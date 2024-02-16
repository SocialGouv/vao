<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="nom"
            label="Nom"
            :label-visible="true"
            :model-value="nom"
            :required="true"
            :disabled="false"
            :is-valid="nomMeta.valid"
            :error-message="nomErrorMessage"
            placeholder=""
            hint="nom d'usage"
            @update:model-value="onNomChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="prenom"
            label="Prénom"
            :label-visible="true"
            :model-value="prenom"
            :required="true"
            :disabled="false"
            :is-valid="prenomMeta.valid"
            :error-message="prenomErrorMessage"
            placeholder=""
            hint="Saisissez le premier prénom"
            @update:model-value="onPrenomChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="fonction"
            label="Fonction"
            :label-visible="true"
            :model-value="fonction"
            :required="true"
            :disabled="false"
            :is-valid="fonctionMeta.valid"
            :error-message="fonctionErrorMessage"
            placeholder=""
            hint="Fonction du représentant légal au sein de l'organisation"
            @update:model-value="onFonctionChange"
          />
        </div>
      </div>
      <div v-if="adresseInitiale" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="adresseDomicileSauvegardée"
            label="Adresse enregistrée"
            :label-visible="true"
            :model-value="adresseInitiale"
            :disabled="true"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <label>{{
            props.representantLegal.adresse ? "Nouvelle adresse" : "Adresse"
          }}</label>
          <Multiselect
            v-model="adresse"
            mode="single"
            :close-on-select="true"
            :searchable="true"
            :internal-search="false"
            :loading="searchAdresseRLInProgress"
            :options="adressesRLOptions"
            :options-limit="10"
            @search-change="searchAdresseRL"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="telephone"
            label="Téléphone"
            :label-visible="true"
            :model-value="telephone"
            :required="true"
            :disabled="false"
            :is-valid="telephoneMeta.valid"
            :error-message="telephoneErrorMessage"
            placeholder=""
            hint="Au format 0X, +33X ou 0033"
            @update:model-value="onTelephoneChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-input-group">
        <DsfrButton
          id="Suivant"
          :secondary="true"
          :disabled="!meta.valid"
          @click="validateRepresentantLegal"
          >Valider les informations du réprésentant légal
        </DsfrButton>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";

const props = defineProps({
  representantLegal: { type: Object, default: null, required: true },
  index: { type: Number, default: null, required: true },
});
const emit = defineEmits(["valid"]);
const log = logger("pages/component/operateur/representantLegal");

const NB_CAR_ADRESSE_MIN = 6;
const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const acceptedCharsRegex =
  /^([AÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔPQRSTUÙÛÜVWXYŸZÆŒ\- ']+)$/i;
const spaceFollowingDashRegex = /( -)|(- )/i;
const doubleSpacesRegex = / {2}/i;
const tripleDashRegex = /-{3}/i;
const doubleDashRegex = /-{2}/i;
const adresses = ref([]);
const searchAdresseRLInProgress = ref(false);

const schemaRepresentantLegal = {
  nom: yup
    .string()
    .test("acceptedChars", "Caractères non acceptés détectés", (nom) =>
      acceptedCharsRegex.test(nom),
    )
    .test(
      "doubleSpaces",
      "Le nom ne peut contenir deux espaces successifs",
      (nom) => !doubleSpacesRegex.test(nom),
    )
    .test(
      "spaceFollowingDash",
      "Le nom ne peut contenir d'espace suivant un tiret",
      (nom) => !spaceFollowingDashRegex.test(nom),
    )
    .test(
      "tripleDash",
      "Le nom ne peut contenir trois tirets consécutifs",
      (nom) => !tripleDashRegex.test(nom),
    )
    .required(),
  prenom: yup
    .string()
    .test("acceptedChars", "Caractères non acceptés détectés", (prenom) =>
      acceptedCharsRegex.test(prenom),
    )
    .test(
      "doubleSpaces",
      "Le prénom ne peut contenir deux espaces successifs",
      (prenom) => !doubleSpacesRegex.test(prenom),
    )
    .test(
      "spaceFollowingDash",
      "Le prénom ne peut contenir d'espace suivant un tiret",
      (prenom) => !spaceFollowingDashRegex.test(prenom),
    )
    .test(
      "doubleDash",
      "Le prénom ne peut contenir deux tirets consécutifs",
      (prenom) => !doubleDashRegex.test(prenom),
    )
    .required(),
  fonction: yup.string().required(),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (telephone) =>
      numTelephoneRegex.test(telephone),
    )
    .required(),
  adresse: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup.object().required(); // schema for object
      case "string":
        return yup.string().required();
    }
  }),
};

const validationSchema = computed(() => {
  return yup.object({ ...schemaRepresentantLegal });
});

const initialValues = computed(() => {
  return {
    nom: props.representantLegal?.nom ?? "",
    prenom: props.representantLegal?.prenom ?? "",
    fonction: props.representantLegal?.fonction ?? "",
    adresse: props.representantLegal?.adresseShort ?? "",
    telephone: props.representantLegal?.telephone ?? "",
  };
});

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: nom,
  errorMessage: nomErrorMessage,
  handleChange: onNomChange,
  meta: nomMeta,
} = useField("nom");
const {
  value: prenom,
  errorMessage: prenomErrorMessage,
  handleChange: onPrenomChange,
  meta: prenomMeta,
} = useField("prenom");
const {
  value: fonction,
  errorMessage: fonctionErrorMessage,
  handleChange: onFonctionChange,
  meta: fonctionMeta,
} = useField("fonction");
const { value: adresse } = useField("adresse");
const {
  value: telephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");

const adressesRLOptions = computed(() => {
  if (adresses.value && adresses.value.length > 0) {
    return adresses.value.map((a) => {
      return { value: a, label: a.properties.label };
    });
  }
  return [];
});

const adresseInitiale = computed(() => {
  if (props.representantLegal.adresse) {
    adresse.value = props.representantLegal.adresse;
    return props.representantLegal.adresseShort;
  }
});

async function searchAdresseRL(queryString) {
  if (queryString.length > NB_CAR_ADRESSE_MIN) {
    searchAdresseRLInProgress.value = true;
    const url = "/geo/adresse/";
    const { data } = await useFetchWithCredentials(url, {
      body: { queryString },
      method: "POST",
    });
    if (data.value?.adresses) {
      adresses.value = data.value.adresses;
      searchAdresseRLInProgress.value = false;
    }
  }
}

function validateRepresentantLegal() {
  log.i("validateRepresentantLegal");
  emit(
    "valid",
    {
      ...values,
      adresseShort: adresse.value.properties?.label ?? adresse.value,
    },
    props.index,
    meta,
  );
}
</script>

<style scoped></style>
