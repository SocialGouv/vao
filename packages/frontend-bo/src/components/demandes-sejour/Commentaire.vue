<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            is-textarea
            name="commentaires"
            label="Commentaires"
            label-visible
            :model-value="commentaire"
            :is-valid="commentaireMeta.valid"
            :error-message="commentaireErrorMessage"
            hint="Redimensionnez le champ pour saisir plus de ligne"
            placeholder=""
            @update:model-value="onCommentaireChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-input-group">
        <DsfrButton
          id="ValidationDemandeComplement"
          secondary
          :disabled="!meta.valid"
          @click.prevent="validateDemandeComplement"
          >Valider
        </DsfrButton>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const emit = defineEmits(["valid"]);

const validationSchema = computed(() =>
  yup.object({
    commentaire: yup
      .string()
      .min(1, "Il est impératif de fournir un commentaire")
      .required("Il est impératif de fournir un commentaire"),
  }),
);

const initialValues = {
  commentaire: null,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: commentaire,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
  meta: commentaireMeta,
} = useField("commentaire");

function validateDemandeComplement() {
  emit("valid", { ...values });
}
</script>

<style scoped></style>
