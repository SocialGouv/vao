<template>
  <TitleWithIcon
    icon="fr-icon-award-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Motivations
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="motivations"
        label="Motivations, compétences et expériences"
        :model-value="motivations"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="motivationsMeta.valid"
        :error-message="motivationsErrorMessage"
        hint="Décrivez vos motivations en retraçant les principales activités. Ou vos compétences et expériences en organisation de séjours de vacances et de séjours adaptés pour les personnes handicapées majeures."
        @update:model-value="onMotivationsChange"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesMotivation"
      label="Vous avez la possibilité de joindre des documents relatifs aux informations d’ordre sanitaire (optionnel)"
    />
  </div>

  <TitleWithIcon
    icon="fr-icon-briefcase-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Immatriculation
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <FileUpload
        v-model="fileImmatriculation"
        label="Certificat d’immatriculation au registre des opérateurs de voyages et de séjours (code du tourisme)"
        :modifiable="true"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="dateObtentionCertificat"
        label="Date d’obtention du certificat"
        :error-message="dateObtentionCertificatErrorMessage"
        :is-valid="dateObtentionCertificatMeta.valid"
        :label-visible="true"
        :model-value="dateObtentionCertificat"
        hint="format attendu : JJ/MM/AAAA"
        @update:model-value="onDateObtentionCertificatChange"
      />
      <DsfrAlert class="fr-grid-row fr-my-3v" type="info" :closeable="false">
        Ce certificat est valable 3 ans, il devra être renouvelé à son échéance.
      </DsfrAlert>
    </div>
  </div>

  <TitleWithIcon
    icon="fr-icon-file-text-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Attestations
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="fileAttestationsRespCivile"
      label="Attestation d’assurance responsabilité civile"
      hint="Cette assurance prouve que vous êtes couvert(e) pour tout dommage (matériel, immatériel) causé involontairement à autrui pendant les activités du séjour."
      :modifiable="true"
    />
  </div>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="fileAttestationsRapatriement"
      label="Attestation d’assurance en cas de rapatriement"
      hint="Cette assurance garantit la prise en charge des frais de retour ou d’assistance en cas de maladie, d’accident ou d’urgence pendant le séjour."
      :modifiable="true"
    />
  </div>
  <div v-if="props.showButtons">
    <div class="fr-fieldset__element">
      <UtilsNavigationButtons
        :show-buttons="props.showButtons"
        :is-downloading="props.isDownloading"
        :message="props.message"
        @next="update"
        @previous="emit('previous')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import { FileUpload } from "@vao/shared-ui";
import * as yup from "yup";
import {
  AGREMENT_STATUT,
  formatShortDateFr,
  parseToISODate,
} from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";

// --- Props et événements ---
const props = defineProps({
  initAgrement: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, default: false },
  message: { type: String, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const dateDDMMYYYY = yup
  .string()
  .transform((value, originalValue) => originalValue || "")
  .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Format JJ/MM/AAAA invalide")
  .test("is-valid-date", "La date n'est pas valide", (value) => {
    if (!value) return true; // nullable
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  })
  .nullable();

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  motivations: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  dateObtentionCertificat: requiredUnlessBrouillon(dateDDMMYYYY),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  motivations: props.initAgrement.motivations || "",
  dateObtentionCertificat: formatShortDateFr(
    props.initAgrement.dateObtentionCertificat,
  ),
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: motivations,
  errorMessage: motivationsErrorMessage,
  handleChange: onMotivationsChange,
  meta: motivationsMeta,
} = useField("motivations");

const {
  value: dateObtentionCertificat,
  errorMessage: dateObtentionCertificatErrorMessage,
  handleChange: onDateObtentionCertificatChange,
  meta: dateObtentionCertificatMeta,
} = useField("dateObtentionCertificat");

const filesMotivation = ref([]);
const fileImmatriculation = ref(null);
const fileAttestationsRespCivile = ref(null);
const fileAttestationsRapatriement = ref(null);

const update = handleSubmit((values) => {
  const formValues = {
    ...values,
    dateObtentionCertificat: parseToISODate(values.dateObtentionCertificat),
    filesMotivation: filesMotivation.value,
    fileImmatriculation: fileImmatriculation.value,
    fileAttestationsRespCivile: fileAttestationsRespCivile.value,
    fileAttestationsRapatriement: fileAttestationsRapatriement.value,
  };
  emit("update", formValues);
  emit("next");
});
</script>

<style scoped>
.default-success {
  color: var(--text-default-success);
}
</style>
