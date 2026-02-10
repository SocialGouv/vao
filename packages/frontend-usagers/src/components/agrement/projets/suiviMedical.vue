<template>
  <TitleWithIcon
    icon="fr-icon-capsule-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Suivi médical prévu
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        v-if="props.modifiable"
        name="suiviMedDistribution"
        :label="displayInput.IAgrementProjets['suiviMedDistribution'].label"
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
        :input="displayInput.IAgrementProjets['suiviMedDistribution']"
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
        :label="displayInput.IAgrementProjets['suiviMedAccordSejour'].label"
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
        :input="displayInput.IAgrementProjets['suiviMedAccordSejour']"
        :is-valid="suiviMedAccordSejourMeta.valid"
        :error-message="suiviMedAccordSejourErrorMessage"
      />
    </div>
  </div>
  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursSuiviMed"
      :modifiable="props.modifiable"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import { TitleWithIcon } from "@vao/shared-ui";
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

const filesProjetsSejoursSuiviMed = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSSUIVIMED,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  suiviMedDistribution: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  suiviMedAccordSejour: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
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
  const formValid = true;

  try {
    const result = await handleSubmit((values) => {
      return values;
    })();

    if (!formValid) {
      console.error("Le formulaire n'est pas valide suivi.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(filesProjetsSejoursSuiviMed.value.length > 0 && {
          filesProjetsSejoursSuiviMed: filesProjetsSejoursSuiviMed.value,
        }),
      };
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire suivi :", error);
  }
};

defineExpose({
  validateForm,
});
</script>
