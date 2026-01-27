<template>
  <DsfrModal
    :ref="modalRef"
    :name="name"
    :opened="opened"
    :title="title"
    @validate="onValidate"
    @close="onClose"
  >
    <article class="fr-mb-4v">
      <slot />
    </article>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            is-textarea
            name="commentaire"
            label="Motif de refus"
            label-visible
            :model-value="commentaire"
            :error-message="commentaireErrorMessage"
            hint="Redimensionnez le champ pour saisir plus de ligne. Minimum 5 caractères"
            placeholder=""
            @update:model-value="onCommentaireChange"
          />
          <div class="fr-input-group">
            <DsfrButton
              id="previous-step"
              :secondary="true"
              @click.prevent="onClose"
              >Retour
            </DsfrButton>
            <DsfrButton id="next-step" @click.prevent="handleValidate">
              Refuser
            </DsfrButton>
          </div>
        </div>
      </div>
    </div>
  </DsfrModal>
</template>

<script setup>
import { DsfrButton, DsfrInputGroup } from "@gouvminint/vue-dsfr";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  modalRef: { type: String, required: true },
  name: { type: String, required: true },
  opened: { type: Boolean, default: false },
  title: { type: String, required: true },
  onClose: {
    type: Function,
    default: () => {},
  },
  onValidate: {
    type: Function,
    default: () => {},
  },
  validationLabel: {
    type: String,
    required: false,
    default: null,
  },
});

const validationSchema = computed(() =>
  yup.object({
    commentaire: yup
      .string()
      .min(5, "Il est impératif de fournir le motif de refus")
      .required("Il est impératif de fournir le motif de refus"),
  }),
);

const initialValues = {
  commentaire: null,
};

const { validate } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: commentaire,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
} = useField("commentaire");

async function handleValidate() {
  const { valid } = await validate();
  if (!valid) return;

  props.onValidate({
    commentaire: commentaire.value,
  });
}
</script>

<style scoped></style>
