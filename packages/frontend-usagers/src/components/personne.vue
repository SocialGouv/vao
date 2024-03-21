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
            :readonly="!props.modifiable"
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
            :readonly="!props.modifiable"
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
            :readonly="!props.modifiable"
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
              :initial-adress="props.personne.adresse?.label"
              :modifiable="props.modifiable"
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
              :required="true"
              :readonly="!props.modifiable"
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
              :readonly="!props.modifiable"
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
          @click.prevent="validatePersonne"
          >Valider
        </DsfrButton>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  personne: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  showAdresse: { type: Boolean, default: false, required: false },
  showTelephone: { type: Boolean, default: false, required: false },
  showEmail: { type: Boolean, default: false, required: false },
  showButton: { type: Boolean, default: true, required: false },
});

const emit = defineEmits(["valid", "update:personne"]);

const validationSchema = computed(() =>
  yup.object({
    ...personne.schema({
      showAdresse: props.showAdresse,
      showTelephone: props.showTelephone,
      showEmail: props.showEmail,
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

const {
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAddressChange,
} = useField("adresse");

function validatePersonne() {
  emit("valid", { ...values });
}

watch(meta, () => {
  emit("update:personne", { ...values }, meta);
});
</script>

<style scoped></style>
