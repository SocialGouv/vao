<template>
  <div>
    <div class="fr-fieldset">
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
            hint="Redimensionnez le champ pour saisir plus de ligne. Minimum 20 caractères"
            placeholder=""
            @update:model-value="onCommentaireChange"
          />
        </div>
      </div>
    </div>
    <div class="fr-fieldset">
      <FileUpload
        :model-value="localFile"
        :cdn-url="props.cdnUrl"
        :modifiable="true"
        hint="Vous pouvez ajouter une pièce jointe"
        @update:model-value="handleFileChange"
      />
    </div>
    <div class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true">
        <DsfrButton
          id="CancelDemandeComplement"
          secondary
          @click.prevent="validateDemandeComplement"
          >Annuler
        </DsfrButton>
        <DsfrButton
          id="ValidationDemandeComplement"
          primary
          :disabled="!meta.valid"
          @click.prevent="validateDemandeComplement"
          >Envoyer la demande
        </DsfrButton>
      </DsfrButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import { FileUpload } from "@vao/shared-ui";
import * as yup from "yup";

const emit = defineEmits(["valid", "update:file"]);

const localFile = ref<File | null>(null);

const props = defineProps<{
  cdnUrl: string;
}>();

const validationSchema = computed(() =>
  yup.object({
    commentaire: yup
      .string()
      .min(20, "Il est impératif de fournir un commentaire")
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
} = useField<string>("commentaire");

function handleFileChange(newFile: File | null) {
  localFile.value = newFile;
  emit("update:file", newFile);
}
function validateDemandeComplement() {
  emit("valid", { ...values });
}
</script>

<style scoped></style>
