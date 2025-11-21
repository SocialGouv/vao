<template>
  <TitleWithIcon
    icon="fr-icon-arrow-up-down-line"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Changement ou évolution
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="noteInformation"
        label="Note d'information présentant les éventuelles améliorations ou changements apportés aux séjours (optionnel)"
        :model-value="noteInformation"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="noteInformationMeta.valid"
        :error-message="noteInformationErrorMessage"
        hint="De votre propre initiative ou suite aux observations des inspecteurs de l'action sanitaire et sociale, les médecins inspecteurs de santé publique ou les inspecteurs des agences régionales de santé ayant la qualité de médecin à l'issue des contrôles effectués au cours de l'agrément."
        @update:model-value="onNoteInformationChange"
      />
    </div>
  </div>
  <div class="fr-fieldset__element">
    <DsfrFileUpload
      v-model="fileAttestationsRapatriement"
      label="Ajouter des fichiers (optionnel)"
      :modifiable="true"
    />
  </div>
  <div class="fr-fieldset__element">
    <DsfrCheckbox
      v-model="bilanAucunChangementEvolution"
      name="checkbox-required-custom"
      label="Aucun changement ou évolution à déclarer."
      :error-message="bilanAucunChangementEvolutionErrorMessage"
      required
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const fileAttestationsRapatriement = ref([]);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  noteInformation: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
  bilanAucunChangementEvolution: yup.boolean().required(),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  noteInformation: props.initAgrement.bilan?.noteInformation || "",
  bilanAucunChangementEvolution:
    props.initAgrement.bilan?.bilanAucunChangementEvolution || false,
};

// const { handleSubmit, meta } = useForm({
const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: noteInformation,
  errorMessage: noteInformationErrorMessage,
  handleChange: onNoteInformationChange,
  meta: noteInformationMeta,
} = useField("noteInformation");

const {
  value: bilanAucunChangementEvolution,
  errorMessage: bilanAucunChangementEvolutionErrorMessage,
} = useField("bilanAucunChangementEvolution");

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  if (result) {
    return {
      ...result,
      ...(fileAttestationsRapatriement.value.length > 0 && {
        fileAttestationsRapatriement: fileAttestationsRapatriement.value,
      }),
    };
  }
  return result;
};

defineExpose({
  validateForm,
  // isValid: () => meta.value.valid, // Optionnel : pour vérifier la validité
});
</script>
