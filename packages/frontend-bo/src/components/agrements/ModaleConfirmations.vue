<template>
  <div>
    <label class="fr-label"> {{ description }} </label>
    <div v-if="props.haveCommentaire" class="fr-fieldset">
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
    <div class="fr-grid-row fr-alert--sm fr-my-3v">
      <FileUpload
        :model-value="localFile"
        :label="labelFileUpload"
        :cdn-url="props.cdnUrl"
        :modifiable="true"
        :hint="hintFileUpload"
        hint-class="file-upload-hint"
        @update:model-value="handleFileChange"
      />
    </div>
    <div v-if="props.haveAgrementNumber" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="numeroAgrement"
            label="Numéro de l'agrément"
            label-visible
            :model-value="numeroAgrement"
            :is-valid="numeroAgrementMeta.valid"
            :error-message="numeroAgrementErrorMessage"
            hint="Entrez le numéro d'agrément associé à l'arrêté"
            placeholder=""
            @update:model-value="onNumeroAgrementChange"
          />
        </div>
      </div>
    </div>

    <DsfrAlert
      v-if="textAlert"
      class="fr-grid-row fr-alert--sm fr-my-3v"
      :role="'alert'"
      :type="props.typeAlert"
    >
      <p v-for="(item, index) in textAlert" :key="index">
        {{ item }}
      </p>
    </DsfrAlert>
    <div class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true">
        <DsfrButton id="CancelForm" secondary @click.prevent="cancelForm"
          >Annuler
        </DsfrButton>
        <DsfrButton
          id="ValidationDemandeComplement"
          primary
          :label="validButton"
          :disabled="!enableValidationButton"
          @click.prevent="validateForm"
        >
        </DsfrButton>
      </DsfrButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileUpload } from "@vao/shared-ui";
import type { DsfrAlertType } from "@gouvminint/vue-dsfr";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const initialValues = {
  commentaire: null,
};

const localFile = ref<File | null>(null);

const props = defineProps<{
  cdnUrl: string;
  textAlert?: string[] | null;
  typeAlert?: DsfrAlertType;
  description: string;
  haveCommentaire: boolean;
  haveRequiredFile: boolean;
  haveAgrementNumber?: boolean;
  validButton: string;
}>();

const labelFileUpload = computed(() =>
  props.haveRequiredFile ? "" : "Ajouter un fichier (optionnel)",
);
const hintFileUpload = computed(() => {
  const parts = [];

  if (!props.haveRequiredFile) {
    parts.push("Vous pouvez ajouter une pièce jointe.\n");
  }

  parts.push(
    "Documents importés : taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf.",
  );

  return parts.join(" ");
});
const validationSchema = computed(() =>
  yup.object({
    commentaire: props.haveCommentaire
      ? yup
          .string()
          .min(20, "Il est impératif de fournir un commentaire")
          .required("Il est impératif de fournir un commentaire")
      : yup.string().notRequired(),
    numeroAgrement: props.haveAgrementNumber
      ? yup
          .string()
          .min(5, "Il est impératif de fournir le numéro d'agrément")
          .required("Il est impératif de fournir le numéro d'agrément")
      : yup.string().notRequired(),
  }),
);

const { values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: commentaire,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
  meta: commentaireMeta,
} = useField<string>("commentaire", undefined, {
  initialValue: "",
});

const {
  value: numeroAgrement,
  errorMessage: numeroAgrementErrorMessage,
  handleChange: onNumeroAgrementChange,
  meta: numeroAgrementMeta,
} = useField<string>("numeroAgrement", undefined, {
  initialValue: "",
});

const enableValidationButton = computed(() => {
  const isCommentaireOk =
    !props.haveCommentaire ||
    (commentaire.value && commentaire.value.length >= 20);

  const isFileOk = !props.haveRequiredFile || localFile.value !== null;

  const isAgrementNumberOk =
    !props.haveAgrementNumber ||
    (numeroAgrement.value && numeroAgrement.value.length >= 5);

  return isCommentaireOk && isFileOk && isAgrementNumberOk;
});
const emit = defineEmits(["valid", "update:file", "close"]);

function handleFileChange(newFile: File | null) {
  localFile.value = newFile;
  emit("update:file", newFile);
}
function validateForm() {
  emit("valid", { ...values });
}
function cancelForm() {
  emit("close");
}
</script>

<style lang="css">
.fr-hint-text {
  white-space: pre-line;
}
</style>
