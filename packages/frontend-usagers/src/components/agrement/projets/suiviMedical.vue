<template>
  <fieldset class="no-border">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-capsule-fill" aria-hidden="true"></span>
      Suivi médical prévu
    </legend>
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          v-if="props.modifiable"
          name="suiviMedDistribution"
          hint="Minimum 20 caractères."
          :label="
            displayInput.AgrementProjetsInput['suiviMedDistribution'].label
          "
          :model-value="suiviMedDistribution"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="suiviMedDistributionMeta.valid"
          :error-message="suiviMedDistributionErrorMessage"
          @update:model-value="onSuiviMedDistributionChange"
        />
        <UtilsDisplayInput
          v-else
          :value="suiviMedDistribution"
          :input="displayInput.AgrementProjetsInput['suiviMedDistribution']"
          :is-valid="suiviMedDistributionMeta.valid"
          :error-message="suiviMedDistributionErrorMessage"
        />
      </div>
    </div>

    <div class="fr-fieldset__element fr-mt-8v">
      <div class="fr-col-12">
        <DsfrInputGroup
          v-if="props.modifiable"
          name="suiviMedAccordSejour"
          hint="Minimum 20 caractères."
          :label="
            displayInput.AgrementProjetsInput['suiviMedAccordSejour'].label
          "
          :model-value="suiviMedAccordSejour"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="suiviMedAccordSejourMeta.valid"
          :error-message="suiviMedAccordSejourErrorMessage"
          @update:model-value="onSuiviMedAccordSejourChange"
        />
        <UtilsDisplayInput
          v-else
          :value="suiviMedAccordSejour"
          :input="displayInput.AgrementProjetsInput['suiviMedAccordSejour']"
          :is-valid="suiviMedAccordSejourMeta.valid"
          :error-message="suiviMedAccordSejourErrorMessage"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <UtilsMultiFilesUpload
        v-model="filesProjetsSejoursSuiviMed"
        hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        :modifiable="props.modifiable"
        label="Ajouter des fichiers (optionnel)"
      />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const log = logger("components/agrement/projets/suiviMedical");

const filesProjetsSejoursSuiviMed = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSSUIVIMED,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  suiviMedDistribution: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez indiquer les mesures prévues pour la distribution et le stockage des médicaments. Minimum 20 caractères.",
      )
      .nullable(),
  ),
  suiviMedAccordSejour: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez indiquer les accords passés avec un cabinet paramédical ou un médecin à proximité du lieu de séjour. Minimum 20 caractères.",
      )
      .nullable(),
  ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  suiviMedDistribution: props.initAgrement.suiviMedDistribution || "",
  suiviMedAccordSejour: props.initAgrement.suiviMedAccordSejour || "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: suiviMedDistribution,
  errorMessage: suiviMedDistributionErrorMessage,
  meta: suiviMedDistributionMeta,
  handleChange: onSuiviMedDistributionChange,
} = useField<string>("suiviMedDistribution");

const {
  value: suiviMedAccordSejour,
  errorMessage: suiviMedAccordSejourErrorMessage,
  meta: suiviMedAccordSejourMeta,
  handleChange: onSuiviMedAccordSejourChange,
} = useField<string>("suiviMedAccordSejour");

const validateForm = async () => {
  const finalData = {
    valid: false,
    suiviMedDistribution: suiviMedDistribution.value || null,
    suiviMedAccordSejour: suiviMedAccordSejour.value || null,
    filesProjetsSejoursSuiviMed: filesProjetsSejoursSuiviMed.value,
  };

  try {
    const result = await handleSubmit((values) => values)();

    if (result) {
      finalData.suiviMedDistribution = result.suiviMedDistribution || null;
      finalData.suiviMedAccordSejour = result.suiviMedAccordSejour || null;
      finalData.valid = true;
    }
  } catch (error) {
    log.w("Erreur lors de la validation du formulaire :", error);
  }

  return finalData;
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
fieldset.no-border {
  border: none;
  padding: 0;
}
legend {
  padding-left: 0;
}
</style>
