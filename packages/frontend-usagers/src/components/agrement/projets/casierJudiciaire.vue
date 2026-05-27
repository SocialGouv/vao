<template>
  <fieldset class="no-border">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-check-line" aria-hidden="true"></span>
      Casier judiciaire
    </legend>

    <DsfrCheckbox
      v-model="accompRespAttestHono"
      name="accompRespAttestHono"
      label="J'atteste que les accompagnants et le responsable du déroulement du séjour sur le lieu de vacances n'ont pas fait l'objet d'une condamnation inscrite au bulletin n° 3 du casier judiciaire"
      :error-message="
        accompRespAttestHonoMeta.touched ? accompRespAttestHonoErrorMessage : ''
      "
      :readonly="!props.modifiable"
      :required="props.initAgrement.statut !== AGREMENT_STATUT.BROUILLON"
      :value="true"
    />

    <div class="fr-fieldset__element">
      <FileUpload
        v-model="fileProjetsSejoursCasier"
        hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        :cdn-url="props.cdnUrl"
        :modifiable="props.modifiable"
        label="Ajouter un fichier (optionnel)"
      />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { FileUpload } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import {
  AGREMENT_STATUT,
  FILE_CATEGORY,
  getFileByCategory,
} from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const fileProjetsSejoursCasier = ref(
  getFileByCategory({
    category: FILE_CATEGORY.PROJETSSEJOURSCASIER,
    files: props.initAgrement?.agrementFiles,
  }),
);

const validationSchema = yup.object({
  accompRespAttestHono: yup.boolean().when("statut", {
    is: (val: AGREMENT_STATUT) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) =>
      schema.oneOf([true], "Vous devez cocher cette case pour continuer"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  accompRespAttestHono: !!props.initAgrement.accompRespAttestHono || false,
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: accompRespAttestHono,
  errorMessage: accompRespAttestHonoErrorMessage,
  meta: accompRespAttestHonoMeta,
} = useField<boolean>("accompRespAttestHono", undefined, {
  type: "checkbox",
});

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  if (result) {
    return {
      ...result,
      fileProjetsSejoursCasier: fileProjetsSejoursCasier.value,
    };
  }
  return result;
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
fieldset.no-border {
  border: none;
  padding: 0;
}
legend {
  padding-left: 0;
}
</style>
