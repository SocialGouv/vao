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
        v-if="modifiable"
        name="motivations"
        :label="displayInput.AgrementInput['motivations'].label"
        :model-value="motivations"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="motivationsMeta.valid"
        :error-message="motivationsErrorMessage"
        hint="Décrivez vos motivations en retraçant les principales activités. Ou vos compétences et expériences en organisation de séjours de vacances et de séjours adaptés pour les personnes handicapées majeures."
        @update:model-value="onMotivationsChange"
      />
      <UtilsDisplayInput
        v-else
        :value="motivations"
        :input="displayInput.AgrementInput['motivations']"
        :is-valid="motivationsMeta.valid"
        :error-message="motivationsErrorMessage"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesMotivation"
      :modifiable="props.modifiable"
      label="Vous avez la possibilité de joindre des documents relatifs aux informations d’ordre sanitaire (optionnel)"
    />
  </div>
  <div class="fr-mt-8v">
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
          :model-value="fileImmatriculation"
          :cdn-url="props.cdnUrl"
          label="Certificat d’immatriculation au registre des opérateurs de voyages et de séjours (code du tourisme)"
          :modifiable="props.modifiable"
          :error-message="fileImmatriculationErrorMessage"
          @update:model-value="setFileImmatriculation"
        />
      </div>
    </div>

    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          v-if="props.modifiable"
          name="dateObtentionCertificat"
          :label="displayInput.AgrementInput['dateObtentionCertificat'].label"
          :error-message="
            dateObtentionCertificatMeta.touched
              ? dateObtentionCertificatErrorMessage
              : undefined
          "
          :is-valid="
            dateObtentionCertificatMeta.touched
              ? dateObtentionCertificatMeta.valid
              : undefined
          "
          :label-visible="true"
          :model-value="dateObtentionCertificat"
          hint="format attendu : JJ/MM/AAAA"
          @update:model-value="onDateObtentionCertificatChange"
        />
        <UtilsDisplayInput
          v-else
          label="Date d'obtention du certificat d'immatriculation"
          :value="dateObtentionCertificat"
          :input="displayInput.AgrementInput['dateObtentionCertificat']"
          :error-message="dateObtentionCertificatErrorMessage"
          :is-valid="dateObtentionCertificatMeta.valid"
        />
        <DsfrAlert
          v-if="props.modifiable"
          class="fr-grid-row fr-my-3v"
          :type="isCertificatExpire ? 'warning' : 'info'"
          :closeable="false"
        >
          {{
            isCertificatExpire
              ? "Votre certificat est expiré, veuillez le renouveler."
              : "Ce certificat est valable 3 ans, il devra être renouvelé à son échéance."
          }}
        </DsfrAlert>
      </div>
    </div>
  </div>

  <div class="fr-mt-8v">
    <TitleWithIcon
      icon="fr-icon-file-text-fill"
      :level="3"
      title-class="fr-text--lead fr-mb-0"
    >
      Attestations
    </TitleWithIcon>
    <div class="fr-fieldset__element">
      <FileUpload
        :model-value="fileAttestationsRespCivile"
        :cdn-url="props.cdnUrl"
        label="Attestation d’assurance responsabilité civile"
        hint="Cette assurance prouve que vous êtes couvert(e) pour tout dommage (matériel, immatériel) causé involontairement à autrui pendant les activités du séjour."
        :modifiable="props.modifiable"
        :error-message="fileAttestationsRespCivileErrorMessage"
        @update:model-value="setFileAttestationsRespCivile"
      />
    </div>
    <div class="fr-fieldset__element">
      <FileUpload
        :model-value="fileAttestationsRapatriement"
        :cdn-url="props.cdnUrl"
        label="Attestation d’assurance en cas de rapatriement"
        hint="Cette assurance garantit la prise en charge des frais de retour ou d’assistance en cas de maladie, d’accident ou d’urgence pendant le séjour."
        :modifiable="props.modifiable"
        :error-message="fileAttestationsRapatriementErrorMessage"
        @update:model-value="setFileAttestationsRapatriement"
      />
    </div>
  </div>
  <div v-if="props.showButtons && props.modifiable">
    <div class="fr-fieldset__element">
      <UtilsNavigationButtons
        :show-buttons="props.showButtons"
        :is-downloading="props.isDownloading"
        :message="props.message"
        @next="trySubmit"
        @previous="emit('previous')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useForm, useField } from "vee-validate";
import { FileUpload, TitleWithIcon, useToaster } from "@vao/shared-ui";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import regex from "../../utils/regex";
import * as yup from "yup";
import {
  AGREMENT_STATUT,
  FILE_CATEGORY,
  formatFR,
  parseToISODate,
} from "@vao/shared-bridge";
import displayInput from "../../utils/display-input";

// --- Props et événements ---
const props = defineProps({
  valid: { type: Boolean, default: true },
  initAgrement: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
  isDownloading: { type: Boolean, default: false },
  message: { type: String, default: null },
  modifiable: { type: Boolean, default: true },
});

const dateDDMMYYYYRegex = regex.dateDDMMYYYYRegex;

const toaster = useToaster();

const emit = defineEmits(["previous", "next", "update:valid", "update"]);

const getFileByCategory = (category: string): AgrementFilesDto | null => {
  return (
    props.initAgrement?.agrementFiles?.find(
      (file: AgrementFilesDto) => file.category === category,
    ) || null
  );
};

const dateDDMMYYYY = yup
  .string()
  .transform((value, originalValue) => originalValue || "")
  .matches(dateDDMMYYYYRegex, "Format JJ/MM/AAAA invalide")
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
  .test(
    "is-not-expired",
    "Votre certificat est expiré, veuillez le renouveler.",
    (value) => {
      if (!value) return true;
      const [day, month, year] = value.split("/").map(Number);
      if (!day || !month || !year) return true;

      const dateObtention = new Date(year, month - 1, day);
      const dateExpiration = new Date(dateObtention);
      dateExpiration.setFullYear(dateExpiration.getFullYear() + 3);

      return new Date() <= dateExpiration;
    },
  )
  .nullable();

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  motivations: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
  ),
  dateObtentionCertificat: requiredUnlessBrouillon(dateDDMMYYYY),
  fileImmatriculation: yup
    .mixed()
    .required("Le certificat d'immatriculation est obligatoire."),
  fileAttestationsRespCivile: yup
    .mixed()
    .required(
      "L'attestation d'assurance responsabilité civile est obligatoire.",
    ),
  fileAttestationsRapatriement: yup
    .mixed()
    .required(
      "L'attestation d'assurance en cas de rapatriement est obligatoire.",
    ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  motivations: props.initAgrement.motivations || "",
  dateObtentionCertificat: props.initAgrement.dateObtentionCertificat
    ? formatFR(props.initAgrement.dateObtentionCertificat)
    : "",
  fileImmatriculation: getFileByCategory(FILE_CATEGORY.IMMATRICUL) || null,
  fileAttestationsRespCivile:
    getFileByCategory(FILE_CATEGORY.ASSURRESP) || null,
  fileAttestationsRapatriement:
    getFileByCategory(FILE_CATEGORY.ASSURRAPAT) || null,
  //synthese: props.initAgrement.synthese || false,
};

const isCertificatExpire = computed(() => {
  const val = dateObtentionCertificat.value;
  if (!val) return false;

  const [day, month, year] = val.split("/").map(Number);
  if (!day || !month || !year) return false;

  const dateObtention = new Date(year, month - 1, day);
  const dateExpiration = new Date(dateObtention);
  dateExpiration.setFullYear(dateExpiration.getFullYear() + 3);

  return new Date() > dateExpiration;
});

const { handleSubmit, meta, validate } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: motivations,
  errorMessage: motivationsErrorMessage,
  handleChange: onMotivationsChange,
  meta: motivationsMeta,
} = useField<string | null>("motivations");

const {
  value: dateObtentionCertificat,
  errorMessage: dateObtentionCertificatErrorMessage,
  handleChange: onDateObtentionCertificatChange,
  meta: dateObtentionCertificatMeta,
} = useField<string | null>("dateObtentionCertificat");

const {
  value: fileImmatriculation,
  errorMessage: fileImmatriculationErrorMessage,
  setValue: setFileImmatriculation,
} = useField<AgrementFilesDto | null>("fileImmatriculation");

const {
  value: fileAttestationsRespCivile,
  errorMessage: fileAttestationsRespCivileErrorMessage,
  setValue: setFileAttestationsRespCivile,
} = useField<AgrementFilesDto | null>("fileAttestationsRespCivile");

const {
  value: fileAttestationsRapatriement,
  errorMessage: fileAttestationsRapatriementErrorMessage,
  setValue: setFileAttestationsRapatriement,
} = useField<AgrementFilesDto | null>("fileAttestationsRapatriement");

const filesMotivation = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) => file.category === FILE_CATEGORY.MOTIVATION,
  ) || [],
);

watch(
  () => meta.value.valid,
  (newVal) => {
    if (!props.modifiable) {
      emit("update:valid", newVal);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  if (!props.modifiable) {
    await validate();
  }
});

const trySubmit = async () => {
  let valid = false;
  try {
    await handleSubmit((vals) => vals)();
    valid = true;
  } catch (e) {
    toaster.error({
      titleTag: "h2",
      description:
        "Merci de corriger les erreurs dans le formulaire avant de continuer.",
    });
  }

  if (valid || initialValues.statut === AGREMENT_STATUT.BROUILLON) {
    const formValues = {
      dateObtentionCertificat: dateObtentionCertificat.value
        ? parseToISODate(dateObtentionCertificat.value)
        : null,
      motivations: motivations.value,
      filesMotivation: filesMotivation.value,
      fileImmatriculation: fileImmatriculation.value,
      fileAttestationsRespCivile: fileAttestationsRespCivile.value,
      fileAttestationsRapatriement: fileAttestationsRapatriement.value,
    };
    emit("update", formValues);
    emit("next");
  }
};

async function validateDossier() {
  const result = await validate();
  return result;
}

defineExpose({ validateDossier });
</script>

<style scoped>
.default-success {
  color: var(--text-default-success);
}
</style>
