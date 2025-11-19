<template>
  <DsfrInputGroup
    name="commentaire"
    label="Commentaire"
    :model-value="commentaireValue"
    :label-visible="true"
    :is-textarea="true"
    :is-valid="commentaireMeta.valid"
    :error-message="commentaireErrorMessage"
    hint="Votre commentaire..."
    @update:model-value="onCommentaireChange"
  />
</template>

<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  initCommentaire: { type: String, default: "" },
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
} = useField("commentaire");

async function getComment() {
  let result = null;
  await handleSubmit((values) => {
    result = values.commentaire;
  })();
  return result;
}
defineExpose({ getComment });
</script>
