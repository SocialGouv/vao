<template>
  <div>
    <DsfrFieldset>
      <DsfrRadioButtonSet
        name="typePrestataire"
        legend="Type de prestataire"
        :model-value="typePrestataire"
        :options="prestataireUtils.typePrestataireOptions"
        :is-valid="typePrestataireMeta"
        :inline="true"
        :error-message="typePrestataireErrorMessage"
        @update:model-value="onTypePrestataireChange"
      ></DsfrRadioButtonSet>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="nom"
          :label="`${typePrestataire === 'personne_morale' ? 'Raison sociale' : 'Nom'}`"
          :label-visible="true"
          :model-value="nom"
          :readonly="!props.modifiable"
          :is-valid="nomMeta.valid"
          :error-message="nomErrorMessage"
          placeholder=""
          @update:model-value="onNomChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="prenom"
          :label="`${typePrestataire === 'personne_morale' ? 'Nom commercial' : 'Prénom'}`"
          :label-visible="true"
          :model-value="prenom"
          :readonly="!props.modifiable"
          :is-valid="prenomMeta.valid"
          :error-message="prenomErrorMessage"
          placeholder=""
          @update:model-value="onPrenomChange"
        />
      </div>
      <div v-if="typePrestataire === 'personne_morale'">
        <div class="fr-input-group fr-col-12">
          <SearchAddress
            :initial-adress="props.prestataire.adresse?.label"
            :modifiable="props.modifiable"
            :value="adresse"
            :label="props.prestataire.adresse ? 'Nouvelle adresse' : 'Adresse'"
            :error-message="adresseErrorMessage"
            @select="onAddressChange"
          />
        </div>
      </div>
      <div v-else>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="dateNaissance"
            type="date"
            label="Date de naissance"
            :label-visible="true"
            :model-value="dateNaissance"
            :readonly="!props.modifiable"
            :is-valid="dateNaissanceMeta.valid"
            :error-message="dateNaissanceErrorMessage"
            hint=""
            @update:model-value="onDateNaissanceChange"
          />
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrInputGroup
              name="competence"
              label="Compétences"
              :label-visible="true"
              :model-value="competence"
              :readonly="!props.modifiable"
              :is-textarea="true"
              :is-valid="competenceMeta.valid"
              :error-message="competenceErrorMessage"
              placeholder=""
              hint=""
              @update:model-value="onCompetenceChange"
            />
          </div>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="telephone"
          label="Téléphone"
          :label-visible="true"
          :model-value="telephone"
          :readonly="!props.modifiable"
          :is-valid="telephoneMeta.valid"
          :error-message="telephoneErrorMessage"
          placeholder=""
          hint="Au format 0X, +33X ou 0033"
          @update:model-value="onTelephoneChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset>
      <div class="fr-input-group">
        <DsfrButton
          id="valider"
          :secondary="true"
          :disabled="!meta.valid"
          @click.prevent="updatePrestataire"
          >Valider
        </DsfrButton>
      </div>
    </DsfrFieldset>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";

const props = defineProps({
  prestataire: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  titre: { type: String, required: true },
});

const emit = defineEmits(["updatePrestataire"]);
const log = logger("pages/component/prestataire-detail");

const indexCourant = ref();

const validationSchema = computed(() =>
  yup.object({
    ...prestataireUtils.schema,
  }),
);
const initialValues = {
  typePrestataire: props.prestataire?.typePrestataire ?? "personne_morale",
  nom: props.prestataire.nom,
  prenom: props.prestataire.prenom,
  adresse: props.prestataire.adresse,
  competence: props.prestataire.competence,
  dateNaissance: props.prestataire.dateNaissance,
  telephone: props.prestataire.telephone,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: typePrestataire,
  errorMessage: typePrestataireErrorMessage,
  handleChange: onTypePrestataireChange,
  meta: typePrestataireMeta,
} = useField("typePrestataire");
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
  value: telephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");

function updatePrestataire() {
  log.i("updatePrestataire");
  emit("updatePrestataire", { ...values });
  indexCourant.value = null;
}
</script>
