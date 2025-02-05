<template>
  <div>
    <div class="fr-fieldset">
      <div class="fr-input-group fr-col-12">
        <div class="fr-fieldset__element">
          <label class="fr-label"> Selectionner un code postal </label>
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
            @select="selectMunicipality"
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
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrInputGroup
              name="adresse"
              label="Adresse"
              :label-visible="true"
              :model-value="values.label"
              hint="Saisissez l'adresse. Exemple: 18 rue de la république, 39400 Morez"
              @update:model-value="selectLabel"
            />
          </div>
        </div>
      </div>
    </div>
    <DsfrButton
      type="button"
      label="Choisir la ville"
      primary
      :disabled="!meta.valid"
      @click="validate"
    />
  </div>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import { MultiSelectOption } from "@vao/shared";
import { useForm } from "vee-validate";
import { adresseSchema } from "@vao/shared/src/schema/adresse";
import * as yup from "yup";

const emits = defineEmits(["choose-manual-address"]);

const toaster = useToaster();
const log = logger("components/search-address-municipality");

const NB_CAR_ADDRESSE_MIN = 3;

const options = ref([]);
const isLoading = ref(false);

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

function selectMunicipality(_option, municipality) {
  setValues({
    ...values,
    codeInsee: municipality.codeInsee,
    codePostal: municipality.codePostal,
    coordinates: municipality.coordinates,
    departement: municipality.departement,
  });
}

function selectLabel(label) {
  setValues({
    ...values,
    label,
  });
}

function validate() {
  emits("choose-manual-address", {
    ...values,
  });

  resetForm();
}
</script>
