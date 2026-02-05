<template>
  <DsfrInputGroup
    v-if="props.modifiable"
    name="commentaire"
    label="Ajouter un commentaire (optionnel)"
    :model-value="commentaireValue"
    :label-visible="true"
    :is-textarea="true"
    :is-valid="commentaireMeta.valid"
    :error-message="commentaireErrorMessage"
    @update:model-value="onCommentaireChange"
  />
  <UtilsDisplayInput
    v-else
    :value="commentaireValue"
    :input="displayInput.IAgrement['commentaire']"
    :is-valid="commentaireMeta.valid"
    :error-message="commentaireErrorMessage"
  />
</template>

<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import displayInput from "../../utils/display-input";

const props = defineProps({
  initCommentaire: { type: String, default: "" },
  modifiable: { type: Boolean, default: true },
});

const validationSchema = yup.object({
  commentaire: yup
    .string()
    .max(1000, "Le commentaire ne doit pas dépasser 1000 caractères.")
    .nullable(),
});

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: { commentaire: props.initCommentaire },
});

const {
  value: commentaireValue,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
  meta: commentaireMeta,
} = useField<string>("commentaire");

async function getComment() {
  let result = null;
  await handleSubmit((values) => {
    result = values.commentaire;
  })();
  return result;
}
defineExpose({ getComment });
</script>
