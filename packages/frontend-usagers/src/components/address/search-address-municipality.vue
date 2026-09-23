<template>
  <div class="modal-container">
    <button
      type="button"
      class="close-button"
      aria-label="Fermer"
      title="Fermer"
      @click="closeModal"
    >
      ✕
    </button>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="voie"
            :label="props.labelVoie"
            :label-visible="true"
            :model-value="voie"
            :hint="props.hintVoie"
            @update:model-value="onVoieUpdate"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group fr-col-12">
          <label class="fr-label">
            {{ props.labelCp }}
            <span class="fr-hint-text">{{ props.hintCp }}</span>
          </label>
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
            <template #noresults> Pas de résultat</template>
          </Multiselect>
        </div>
      </div>
    </div>
    <label class="fr-label"> Adresse selectionnée : </label>
    <DsfrHighlight small>{{ adresseLabel }}</DsfrHighlight>
    <DsfrButton type="button" label="Valider" primary @click="validate" />
  </div>
</template>

<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import { MultiSelectOption, eigSchema, useToaster } from "@vao/shared-ui";
import { useForm } from "vee-validate";
import * as yup from "yup";
import type { MunicipalityOption, ApiAdresseResult } from "@vao/shared-ui";
const { adresseSchema } = eigSchema;

const emits = defineEmits(["choose-manual-address", "close"]);

const props = defineProps({
  labelVoie: {
    type: String,
    required: false,
    default: "Indiquer la voie",
  },
  hintVoie: {
    type: String,
    required: false,
    default:
      "Saisissez la voie. Exemple: 18 rue de la république / lieudit des Trois-Chênes",
  },
  labelCp: {
    type: String,
    required: false,
    default: "Sélectionner un code postal",
  },
  hintCp: {
    type: String,
    required: false,
    default: "",
  },
});

const toaster = useToaster();
const log = logger("components/search-address-municipality");

const NB_CAR_ADDRESSE_MIN = 3;

const options = ref<MunicipalityOption[]>([]);
const isLoading = ref(false);

const voie = ref("");
const municipality = ref<MunicipalityOption>({
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

function onVoieUpdate(value: string | number | undefined) {
  voie.value =
    typeof value === "string"
      ? value
      : value === undefined
        ? ""
        : String(value);
  setAdresse();
}

async function searchAddress(queryString: string) {
  if (queryString?.length >= NB_CAR_ADDRESSE_MIN && isLoading.value === false) {
    await searchAddressDebounced(queryString + "&type=municipality");
  }
}

const searchAddressDebounced = debounce(async function (queryString: string) {
  log.d("searchAddressDebounced - IN", { queryString });
  try {
    isLoading.value = true;
    options.value = [];
    const url = "/geo/adresse/";
    const { adresses } = await $fetchBackend<{ adresses: ApiAdresseResult[] }>(
      url,
      {
        body: { queryString },
        method: "POST",
        credentials: "include",
      },
    );
    log.d("searchAddress", { adresses });
    options.value = adresses.map(
      (address: ApiAdresseResult): MunicipalityOption => {
        return {
          label: address.properties.label,
          codeInsee: address.properties.citycode,
          codePostal: address.properties.postcode,
          coordinates: address.geometry.coordinates,
          departement: address.properties.context?.split(",")[0] ?? "",
        };
      },
    );
    isLoading.value = false;
    log.d("searchAddress - DONE", { adresses });
  } catch (error) {
    log.w("searchAddress", error);
    isLoading.value = false;
    toaster.error({
      titleTag: "h2",
      description: "erreur lors de l'appel à l'API adresse",
      role: "alert",
    });
  }
  log.d("searchAddressDebounced - DONE", { queryString });
}, 500);

function selectMunicipality(_value: unknown, option: MunicipalityOption) {
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
  const hasVoie = voie.value.trim().length > 0;
  const hasMunicipality =
    municipality.value.label?.trim().length > 0 &&
    municipality.value.codePostal?.trim().length > 0;

  setValues({
    codeInsee: municipality.value.codeInsee,
    codePostal: municipality.value.codePostal,
    coordinates: municipality.value.coordinates,
    departement: municipality.value.departement,
    label: hasMunicipality
      ? hasVoie
        ? adresseLabel.value
        : `${municipality.value.codePostal} ${municipality.value.label}`.trim()
      : "",
  });
}

function closeModal() {
  emits("close");
  resetForm();
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
  position: relative;
  padding-top: 1rem;
}

.close-button {
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  background: transparent;
  color: var(--text-title-grey);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.fr-fieldset {
  width: 100%;
}

.fr-fieldset__element,
.fr-input-group,
:deep(.multiselect),
:deep(.multiselect-input),
:deep(.multiselect-wrapper) {
  width: 100%;
}

.fr-fieldset > div {
  margin-bottom: 2rem;
}
</style>
