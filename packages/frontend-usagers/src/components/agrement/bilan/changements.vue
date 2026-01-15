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
        name="bilanChangementEvolution"
        label="Note d'information présentant les éventuelles améliorations ou changements apportés aux séjours (optionnel)"
        :model-value="bilanChangementEvolution"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="bilanChangementEvolutionMeta.valid"
        :error-message="bilanChangementEvolutionErrorMessage"
        hint="De votre propre initiative ou suite aux observations des inspecteurs de l'action sanitaire et sociale, les médecins inspecteurs de santé publique ou les inspecteurs des agences régionales de santé ayant la qualité de médecin à l'issue des contrôles effectués au cours de l'agrément."
        @update:model-value="onBilanChangementEvolutionChange"
      />
    </div>
  </div>
  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesChangeEvol"
      label="Ajouter des fichiers (optionnel)"
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
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesChangeEvol = ref(
  props.initAgrement?.agrementFiles.filter(
    (file) => file.category === FILE_CATEGORY.CHANGEEVOL,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  bilanChangementEvolution: yup
    .string()
    .nullable()
    .notRequired()
    .test(
      "min-if-filled",
      "Merci de décrire au moins 20 caractères.",
      (value) => !value || value.length >= 20,
    ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  bilanChangementEvolution: props.initAgrement.bilanChangementEvolution || null,
  bilanAucunChangementEvolution:
    props.initAgrement.bilanAucunChangementEvolution || false,
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: bilanChangementEvolution,
  errorMessage: bilanChangementEvolutionErrorMessage,
  handleChange: onBilanChangementEvolutionChange,
  meta: bilanChangementEvolutionMeta,
} = useField("bilanChangementEvolution");

const {
  value: bilanAucunChangementEvolution,
  errorMessage: bilanAucunChangementEvolutionErrorMessage,
} = useField("bilanAucunChangementEvolution");

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  if (result) {
    return {
      ...result,
      ...(filesChangeEvol.value.length > 0 && {
        filesChangeEvol: filesChangeEvol.value,
      }),
    };
  }
  return result;
};

defineExpose({
  validateForm,
});
</script>
