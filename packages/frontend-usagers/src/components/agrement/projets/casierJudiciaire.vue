<template>
  <TitleWithIcon
    icon="fr-icon-check-line"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Casier judiciaire
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <DsfrCheckbox
      v-model="accompRespAttestHono"
      name="checkbox-required-custom"
      label="J'atteste que les accompagnants et le responsable du déroulement du séjour sur le lieu de vacances n'ont pas fait l'objet d'une condamnation inscrite au bulletin n° 3 du casier judiciaire"
      required
      :readonly="!props.modifiable"
      :value="true"
      @update:model-value="onAccompRespAttestHonoChange"
    />
    <p v-if="accompRespAttestHonoErrorMessage" class="fr-error-text">
      {{ accompRespAttestHonoErrorMessage }}
    </p>
  </div>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="fileProjetsSejoursCasier"
      :cdn-url="props.cdnUrl"
      :modifiable="props.modifiable"
      label="Ajouter un fichier (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import { FileUpload, TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const fileProjetsSejoursCasier = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSCASIER,
  ) || null,
);

const validationSchema = yup.object({
  accompRespAttestHono: yup
    .boolean()
    .oneOf(
      [true],
      "Vous devez attester que les accompagnants et le responsable du déroulement du séjour n'ont pas fait l'objet d'une condamnation inscrite au bulletin n° 3 du casier judiciaire.",
    )
    .required("Ce champ est obligatoire."),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  accompRespAttestHono: false,
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: accompRespAttestHono,
  errorMessage: accompRespAttestHonoErrorMessage,
  handleChange: onAccompRespAttestHonoChange,
} = useField<boolean>("accompRespAttestHono");

const validateForm = async () => {
  try {
    const result = await handleSubmit((values) => {
      return values;
    })();

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(fileProjetsSejoursCasier.value && {
          filesProjetsSejoursCasier: fileProjetsSejoursCasier.value,
        }),
      };
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire! :", error);
  }
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
.fr-error-text {
  color: var(--error-425-625);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
</style>
