<template>
  <TitleWithIcon
    icon="fr-icon-edit-box-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Bilan qualitatif sur les 4 dernières années
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="changements"
        label="Note d'information présentant les éventuelles améliorations ou changements apportés aux séjours (optionnel)"
        :model-value="changements"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="changementsMeta.valid"
        :error-message="changementsErrorMessage"
        hint="De votre propre initiative ou suite aux observations des inspecteurs de l'action sanitaire et sociale, les médecins inspecteurs de santé publique ou les inspecteurs des agences régionales de santé ayant la qualité de médecin à l'issue des contrôles effectués au cours de l'agrément."
        @update:model-value="onChangementsChange"
      />
    </div>
  </div>
</template>

<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  changements: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  changements: props.initAgrement.bilan?.changements || "",
};

// const { handleSubmit, meta } = useForm({
const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: changements,
  errorMessage: changementsErrorMessage,
  handleChange: onChangementsChange,
  meta: changementsMeta,
} = useField("changements");

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  return result;
};

defineExpose({
  validateForm,
  // isValid: () => meta.value.valid, // Optionnel : pour vérifier la validité
});
</script>
