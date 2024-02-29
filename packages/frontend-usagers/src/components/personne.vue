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
      <div v-if="props.showAdresse" class="fr-col-12">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <SearchAddress
              :value="adresse"
              :label="props.personne.adresse ? 'Nouvelle adresse' : 'Adresse'"
              @select="onAddressChange"
            />
          </div>
        </div>
      </div>
      <div v-if="showTelephone" class="fr-col-12">
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
      </div>
      <div v-if="showEmail" class="fr-col-12">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrInputGroup
              name="email"
              label="Email"
              :label-visible="true"
              :model-value="email"
              :required="true"
              :disabled="false"
              :is-valid="emailMeta.valid"
              :error-message="emailErrorMessage"
              placeholder=""
              hint="courriel de la personne"
              @update:model-value="onEmailChange"
            />
          </div>
        </div>
      </div>
    </fieldset>
    <fieldset v-if="showButton" class="fr-fieldset">
      <div class="fr-input-group">
        <DsfrButton
          id="Suivant"
          :secondary="true"
          :disabled="!meta.valid"
          @click="validatePersonne"
          >Valider
        </DsfrButton>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const log = logger("components/personne");

const props = defineProps({
  personne: { type: Object, required: true },
  showAdresse: { type: Boolean, default: false, required: false },
  showTelephone: { type: Boolean, default: false, required: false },
  showEmail: { type: Boolean, default: false, required: false },
  showButton: { type: Boolean, default: true, required: false },
});

const emit = defineEmits(["valid", "update:personne"]);

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const acceptedCharsRegex =
  /^([AÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔPQRSTUÙÛÜVWXYŸZÆŒ\- ']+)$/i;
const spaceFollowingDashRegex = /( -)|(- )/i;
const doubleSpacesRegex = / {2}/i;
const tripleDashRegex = /-{3}/i;
const doubleDashRegex = /-{2}/i;

const validationSchema = computed(() =>
  yup.object({
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
    ...(props.showTelephone && {
      telephone: yup
        .string()
        .test(
          "telephone",
          "Format de numéro de téléphone invalide",
          (telephone) => numTelephoneRegex.test(telephone),
        )
        .required(),
    }),
    ...(props.showEmail && {
      email: yup
        .string()
        .test("email", "l'email n'est pas au format attendu", (email) =>
          emailRegex.test(email),
        )
        .required(),
    }),
    ...(props.showAdresse && {
      adresse: yup.object().required(),
    }),
  }),
);

const initialValues = {
  nom: props.personne.nom,
  prenom: props.personne.prenom,
  fonction: props.personne.fonction,
  ...(props.showTelephone && {
    telephone: props.personne.telephone,
  }),
  ...(props.showEmail && {
    email: props.personne.email,
  }),
  ...(props.showAdresse && {
    adresse: props.personne.adresse,
  }),
};

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
const {
  value: telephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");

const { value: adresse, handleChange: onAddressChange } = useField("adresse");

function validatePersonne() {
  emit("valid", { ...values });
}

watch(meta, () => {
  emit("update:personne", { ...values }, meta);
});
</script>

<style scoped></style>
