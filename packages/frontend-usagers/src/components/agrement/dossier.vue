<template>
  <fieldset>
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-award-fill" aria-hidden="true"></span>Motivations
    </legend>

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
          hint="Décrivez vos motivations en retraçant les principales activités. Ou vos compétences et expériences en organisation de séjours de vacances et de séjours adaptés pour les personnes handicapées majeures. Minimum 20 caractères."
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
  </fieldset>
  <fieldset class="fr-mt-8v">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-briefcase-fill" aria-hidden="true"></span
      >Immatriculation
    </legend>
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
          :error-message="dateObtentionCertificatErrorMessage"
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
        <div class="fr-grid-row fr-my-3v">
          <DsfrAlert
            v-if="isCertificatExpire"
            :type="'warning'"
            :closeable="false"
          >
            Ce certificat a expiré. Veuillez le renouveler afin de rétablir
            l’accès aux services.
          </DsfrAlert>
          <p v-else class="fr-message fr-message--info">
            Ce certificat est valable 3 ans, il devra être renouvelé à son
            échéance.
          </p>
        </div>
      </div>
    </div>
  </fieldset>

  <fieldset class="fr-mt-8v">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-file-text-fill" aria-hidden="true"></span
      >Attestations
    </legend>
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
  </fieldset>
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
import {
  isValidFrShort,
  parseFrShort,
  addYears,
  isBefore,
  isAfter,
} from "@vao/shared-bridge/utils/date";
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
  .matches(dateDDMMYYYYRegex, "Format JJ/MM/AAAA invalide")
  .test(
    "is-valid-date",
    "La date n'est pas valide. Veuillez entrer une date valide au format JJ/MM/AAAA.",
    (value) => {
      if (!value) {
        return true;
      }
      return isValidFrShort(value);
    },
  )
  .test(
    "is-not-expired",
    "Ce certificat a expiré. Veuillez le renouveler afin de rétablir l’accès  aux services.",
    (value) => {
      const dateObtention = parseFrShort(value)?.toDate();
      if (!dateObtention) {
        return false;
      }

      const dateExpiration = addYears(dateObtention, 3);

      return isBefore(new Date(), dateExpiration!);
    },
  )
  .nullable();

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  motivations: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Le nombre de caractères est insuffisant. Merci de saisir au moins 20 caractères.",
      ),
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
  const dateObtention = parseFrShort(dateObtentionCertificat.value)?.toDate();
  if (!dateObtention) {
    return false;
  }

  const dateExpiration = addYears(dateObtention, 3);

  return isAfter(new Date(), dateExpiration!);
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
      dateObtentionCertificat:
        dateObtentionCertificat.value &&
        isValidFrShort(dateObtentionCertificat.value)
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
