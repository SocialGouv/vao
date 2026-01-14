<template>
  <div class="modal-container">
    <div class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="voie"
            label="Indiquer la voie"
            :label-visible="true"
            :model-value="voie"
            hint="Saisissez la voie. Exemple: 18 rue de la république / lieudit des Trois-Chênes"
            @update:model-value="
              voie = $event;
              setAdresse();
            "
          />
        </div>
      </div>
      <div class="fr-input-group fr-col-12">
        <div class="fr-fieldset__element">
          <label class="fr-label"> Sélectionner un code postal </label>
          <Multiselect
            value-prop="label"
            mode="single"
            :close-on-select="true"
            :searchable="true"
            :internal-search="true"
            :loading="isLoading"
            no-options-text="Rechercher une Ville"
            :options="options"
            autocomplete="off"
            :filter-results="false"
            @search-change="searchAddress"
            @select="
              (value, option) => {
                selectMunicipality(value, option);
                setAdresse();
              }
            "
          >
            <template #option="{ option, isPointed }">
              <MultiSelectOption
                :label="option.label"
                :is-pointed="isPointed(option)"
              />
            </template>
            <template #no-result> Pas de résultat</template>
          </Multiselect>
        </div>
      </div>
    </div>
    <label class="fr-label"> Adresse selectionnée : </label>
    <DsfrHighlight small>{{ adresseLabel }}</DsfrHighlight>
    <DsfrButton
      type="button"
      label="Valider"
      primary
      :disabled="!meta.valid"
      @click="validate"
    />
  </div>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import { MultiSelectOption, eigSchema } from "@vao/shared-ui";
import { useForm } from "vee-validate";
const { adresseSchema } = eigSchema;
import * as yup from "yup";

const emits = defineEmits(["choose-manual-address"]);

const toaster = useToaster();
const log = logger("components/search-address-municipality");

const NB_CAR_ADDRESSE_MIN = 3;

const options = ref([]);
const isLoading = ref(false);

const voie = ref("");
const municipality = ref({
  label: "",
  codeInsee: "",
  codePostal: "",
  coordinates: [],
  departement: "",
});

const validationSchema = yup.object(adresseSchema({ isFromAPIAdresse: true }));
const { values, meta, setValues, resetForm } = useForm({
  validationSchema,
});

async function searchAddress(queryString) {
  if (queryString?.length >= NB_CAR_ADDRESSE_MIN && isLoading.value === false) {
    await searchAddressDebounced(queryString + "&type=municipality");
  }
}

const searchAddressDebounced = debounce(async function (queryString) {
  log.d("searchAddressDebounced - IN", { queryString });
  try {
    isLoading.value = true;
    options.value = [];
    const url = "/geo/adresse/";
    const { adresses } = await $fetchBackend(url, {
      body: { queryString },
      method: "POST",
      credentials: "include",
    });
    log.d("searchAddress", { adresses });
    options.value = adresses.map((address) => {
      return {
        label: address.properties.label,
        codeInsee: address.properties.citycode,
        codePostal: address.properties.postcode,
        coordinates: address.geometry.coordinates,
        departement: address.properties.context.split(",")[0],
      };
    });
    isLoading.value = false;
    log.d("searchAddress - DONE", { adresses });
  } catch (error) {
    log.w("searchAddress", error);
    isLoading.value = false;
    toaster.error({
      titleTag: "h2",
      description: "erreur lors de l'appel à l'API adresse",
    });
  }
  log.d("searchAddressDebounced - DONE", { queryString });
}, 500);

function selectMunicipality(_value, option) {
  municipality.value = {
    label: option.label,
    codeInsee: option.codeInsee,
    codePostal: option.codePostal,
    coordinates: option.coordinates,
    departement: option.departement,
  };
}

const adresseLabel = computed(() => {
  const voieFull = voie.value.trim();
  const municipalityFull =
    `${municipality.value.codePostal} ${municipality.value.label}`.trim();
  if (voieFull.length > 0 && municipalityFull.length > 0) {
    return `${voieFull}, ${municipalityFull}`;
  } else if (voieFull.length > 0) {
    return voieFull;
  } else if (municipalityFull.length > 0) {
    return municipalityFull;
  } else return "";
});

function setAdresse() {
  setValues({
    codeInsee: municipality.value.codeInsee,
    codePostal: municipality.value.codePostal,
    coordinates: municipality.value.coordinates,
    departement: municipality.value.departement,
    label:
      voie.value?.length &&
      municipality.value.label?.length &&
      municipality.value.codePostal?.length
        ? adresseLabel.value
        : "",
  });
}

function validate() {
  emits("choose-manual-address", {
    ...values,
  });

  resetForm();
}
</script>

<style scoped>
.modal-container {
  padding-top: 1rem;
}

.fr-fieldset > div {
  margin-bottom: 2rem;
}
</style>
