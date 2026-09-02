<template>
  <div>
    <DsfrAlert
      v-if="props.submitErrorMessage"
      class="fr-grid-row fr-alert--sm fr-my-3v"
      role="alert"
      type="error"
      :description="props.submitErrorMessage"
    />
    <p v-if="props.showRequiredFieldsMessage" class="fr-hint-text">
      Tous les champs sont obligatoires.
    </p>
    <label class="fr-label" :class="{ 'fr-label--error': fileErrorMessage }">
      {{ description }}
    </label>
    <div v-if="props.haveCommentaire" class="fr-fieldset">
      <div ref="commentaireFieldRef" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            is-textarea
            name="commentaires"
            label="Commentaires"
            label-visible
            :model-value="commentaire"
            :is-valid="commentaireMeta.valid"
            :error-message="commentaireErrorMessage"
            hint="Redimensionnez le champ pour saisir plus de ligne. Minimum 5 caractères"
            placeholder=""
            @update:model-value="onCommentaireChange"
          />
        </div>
      </div>
    </div>
    <div ref="fileFieldRef" class="fr-grid-row fr-alert--sm fr-my-3v">
      <FileUpload
        :model-value="file"
        :label="labelFileUpload"
        :cdn-url="props.cdnUrl"
        :modifiable="true"
        :hint="hintFileUpload"
        hint-class="file-upload-hint"
        @update:model-value="handleFileChange"
      />
      <p v-if="fileErrorMessage" class="fr-error-text">
        {{ fileErrorMessage }}
      </p>
    </div>
    <div v-if="props.haveAgrementNumber" class="fr-fieldset">
      <div ref="numeroAgrementFieldRef" class="fr-fieldset__element">
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
          @click.prevent="onSubmit"
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

const props = defineProps<{
  cdnUrl: string;
  textAlert?: string[] | null;
  typeAlert?: DsfrAlertType;
  description: string;
  haveCommentaire: boolean;
  haveRequiredFile: boolean;
  haveAgrementNumber?: boolean;
  validButton: string;
  showRequiredFieldsMessage?: boolean;
  submitErrorMessage?: string | null;
}>();

const emit = defineEmits<{
  valid: [
    payload: {
      commentaire?: string;
      numeroAgrement?: string;
      file: File | null;
    },
  ];
  close: [];
}>();

const validationSchema = computed(() =>
  yup.object({
    commentaire: props.haveCommentaire
      ? yup
          .string()
          .min(
            5,
            "Le champ « Commentaires » doit contenir au moins 5 caractères.",
          )
          .required("Le champ « Commentaires » est vide. Veuillez le remplir.")
      : yup.string().notRequired(),
    numeroAgrement: props.haveAgrementNumber
      ? yup
          .string()
          .min(
            5,
            "Le champ « Numéro d’agrément » doit contenir au moins 5 caractères.",
          )
          .required(
            "Le champ « Numéro d’agrément » est vide. Veuillez le remplir.",
          )
      : yup.string().notRequired(),

    file: props.haveRequiredFile
      ? yup.mixed<File>().required("Vous devez ajouter un fichier.")
      : yup.mixed<File>().notRequired(),
  }),
);

const initialValues = {
  commentaire: "",
  numeroAgrement: "",
  file: null as File | null,
};

const { handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: commentaire,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
  meta: commentaireMeta,
} = useField<string>("commentaire");

const {
  value: numeroAgrement,
  errorMessage: numeroAgrementErrorMessage,
  handleChange: onNumeroAgrementChange,
  meta: numeroAgrementMeta,
} = useField<string>("numeroAgrement");

const {
  value: file,
  errorMessage: fileErrorMessage,
  handleChange: onFileChange,
} = useField<File | null>("file");

const labelFileUpload = computed(() =>
  props.haveRequiredFile ? "" : "Ajouter un fichier (optionnel)",
);
const hintFileUpload = computed(() => {
  const parts = [];

  if (!props.haveRequiredFile) {
    parts.push("Vous pouvez ajouter un fichier.\n");
  }

  parts.push(
    "Documents importés : taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf.",
  );

  return parts.join(" ");
});

const commentaireFieldRef = ref<HTMLElement | null>(null);
const fileFieldRef = ref<HTMLElement | null>(null);
const numeroAgrementFieldRef = ref<HTMLElement | null>(null);

function focusFirstErrorField(errors: Partial<Record<string, string>>) {
  const fieldOrder: Array<{ key: string; container: Ref<HTMLElement | null> }> =
    [
      { key: "commentaire", container: commentaireFieldRef },
      { key: "file", container: fileFieldRef },
      { key: "numeroAgrement", container: numeroAgrementFieldRef },
    ];

  const firstInError = fieldOrder.find(({ key }) => errors[key]);
  const focusable = firstInError?.container.value?.querySelector<HTMLElement>(
    "input, textarea, button, [tabindex]",
  );
  focusable?.focus();
}

function handleFileChange(newFile: File | null) {
  onFileChange(newFile);
}

const onSubmit = handleSubmit(
  (formValues) => {
    emit("valid", {
      commentaire: formValues.commentaire,
      numeroAgrement: formValues.numeroAgrement,
      file: formValues.file ?? null,
    });
  },
  ({ errors }) => focusFirstErrorField(errors),
);

function cancelForm() {
  resetForm();
  emit("close");
}
</script>

<style lang="css">
.fr-hint-text {
  white-space: pre-line;
}
.fr-label--error {
  color: var(--text-default-error);
}
</style>
