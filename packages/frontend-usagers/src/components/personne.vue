<template>
  <div>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="nom"
            label="Nom"
            :label-visible="true"
            :model-value="nom"
            :readonly="!props.modifiable || props.synthese"
            :is-valid="nomMeta.valid"
            :error-message="nomErrorMessage"
            placeholder=""
            hint="Saisissez le nom d'usage. Exemple: Dupont"
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
            :readonly="!props.modifiable || props.synthese"
            :is-valid="prenomMeta.valid"
            :error-message="prenomErrorMessage"
            placeholder=""
            hint="Saisissez le premier prénom. Exemple: Dupont"
            @update:model-value="onPrenomChange"
          />
        </div>
      </div>
      <div v-if="showDateNaissance" class="fr-col-12">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrInputGroup
              name="dateNaissance"
              type="date"
              label="Date de naissance"
              :label-visible="true"
              :model-value="dateNaissance"
              :readonly="!props.modifiable || props.synthese"
              :is-valid="dateNaissanceMeta.valid"
              :error-message="dateNaissanceErrorMessage"
              hint=""
              @update:model-value="onDateNaissanceChange"
            />
          </div>
        </div>
      </div>
      <div v-if="props.showCompetence" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="competence"
            label="Compétences"
            :label-visible="true"
            :model-value="competence"
            :readonly="!props.modifiable || props.synthese"
            :is-textarea="true"
            :is-valid="competenceMeta.valid"
            :error-message="competenceErrorMessage"
            placeholder=""
            hint=""
            @update:model-value="onCompetenceChange"
          />
        </div>
      </div>
      <div v-if="props.showFonction" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="fonction"
            label="Fonction"
            :label-visible="true"
            :model-value="fonction"
            :readonly="!props.modifiable || props.synthese"
            :is-valid="fonctionMeta.valid"
            :error-message="fonctionErrorMessage"
            placeholder=""
            hint="Fonction du représentant légal au sein de l'organisation. Exemple: directeur"
            @update:model-value="onFonctionChange"
          />
        </div>
      </div>
      <div v-if="props.showListeFonction" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <UtilsMultiSelect
            label="Fonction"
            :options="informationsPersonnelListe.fonctionOptions"
            :values="listeFonction ?? []"
            :modifiable="props.modifiable && !props.synthese"
            :is-valid="listeFonctionMeta.valid"
            :error-message="listeFonctionErrorMessage"
            @update="addListeFonction"
          ></UtilsMultiSelect>
        </div>
      </div>
      <div v-if="props.showAdresse" class="fr-col-12">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <AddressSearchAddress
              :initial-adress="props.personne.adresse?.label"
              :modifiable="props.modifiable && !props.synthese"
              :value="adresse"
              :label="props.personne.adresse ? 'Nouvelle adresse' : 'Adresse'"
              :error-message="adresseErrorMessage"
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
              :readonly="!props.modifiable || props.synthese"
              :is-valid="telephoneMeta.valid"
              :error-message="telephoneErrorMessage"
              placeholder=""
              hint="Au format 0X, +33X ou 0033. Exemple : 0612345678"
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
              label="Adresse courriel"
              :label-visible="true"
              :model-value="email"
              :readonly="!props.modifiable || props.synthese"
              :is-valid="emailMeta.valid"
              :error-message="emailErrorMessage"
              placeholder=""
              hint="Adresse courriel de la personne. Exemple: nom@domaine.fr"
              @update:model-value="onEmailChange"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="showButton" class="fr-fieldset">
      <div class="fr-input-group">
        <DsfrButton
          id="Suivant"
          :secondary="true"
          :disabled="!meta.valid"
          @click.prevent="validatePersonne"
          >Valider
        </DsfrButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  personne: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  showAdresse: { type: Boolean, default: false, required: false },
  showAttestation: { type: Boolean, default: false, required: false },
  showCompetence: { type: Boolean, default: false, required: false },
  showDateNaissance: { type: Boolean, default: false, required: false },
  showEmail: { type: Boolean, default: false, required: false },
  showFonction: { type: Boolean, default: false, required: false },
  showListeFonction: { type: Boolean, default: false, required: false },
  showTelephone: { type: Boolean, default: false, required: false },
  showButton: { type: Boolean, default: true, required: false },
  validateOnMount: { type: Boolean, default: false },
  synthese: { type: Boolean, default: false },
});

const emit = defineEmits(["valid", "update:personne"]);

const validationSchema = computed(() =>
  yup.object({
    ...personne.schema({
      showAdresse: props.showAdresse,
      showCompetence: props.showCompetence,
      showDateNaissance: props.showDateNaissance,
      showEmail: props.showEmail,
      showFonction: props.showFonction,
      showListeFonction: props.showListeFonction,
      showTelephone: props.showTelephone,
    }),
  }),
);

const initialValues = {
  nom: props.personne.nom,
  prenom: props.personne.prenom,
  ...(props.showAdresse && {
    adresse: props.personne.adresse,
  }),
  attestation: props.personne.attestation,
  ...(props.showCompetence && {
    competence: props.personne.competence,
  }),
  ...(props.showDateNaissance && {
    dateNaissance: props.personne.dateNaissance,
  }),
  ...(props.showEmail && {
    email: props.personne.email,
  }),
  ...(props.showFonction && {
    fonction: props.personne.fonction,
  }),
  ...(props.showListeFonction && {
    listeFonction: props.personne.listeFonction,
  }),
  ...(props.showTelephone && {
    telephone: props.personne.telephone,
  }),
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
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
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAddressChange,
} = useField("adresse");
const {
  value: competence,
  errorMessage: competenceErrorMessage,
  handleChange: onCompetenceChange,
  meta: competenceMeta,
} = useField("competence");
const {
  value: dateNaissance,
  errorMessage: dateNaissanceErrorMessage,
  handleChange: onDateNaissanceChange,
  meta: dateNaissanceMeta,
} = useField("dateNaissance");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");
const {
  value: fonction,
  errorMessage: fonctionErrorMessage,
  handleChange: onFonctionChange,
  meta: fonctionMeta,
} = useField("fonction");
const {
  value: listeFonction,
  errorMessage: listeFonctionErrorMessage,
  meta: listeFonctionMeta,
} = useField("listeFonction");
const {
  value: telephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");

function addListeFonction(liste) {
  listeFonction.value = liste;
}

function validatePersonne() {
  emit("valid", { ...values });
}

watch(meta, () => {
  emit("update:personne", { ...values }, meta);
});
</script>

<style scoped></style>
