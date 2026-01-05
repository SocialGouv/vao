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
      label="Ajouter un fichier (optionnel)"
      :modifiable="true"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { FileUpload } from "@vao/shared-ui";

console.log("Hello from projet/casierJudiciaire.vue");

const props = defineProps({
  cdnUrl: { type: String, required: true },
});

const fileProjetsSejoursCasier = ref(null);

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
} = useField("accompRespAttestHono");

const validateForm = async () => {
  try {
    const result = await handleSubmit((values) => {
      console.log("Valeurs du formulaire:", values);
      return values;
    })();

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(fileProjetsSejoursCasier.value
          ? { fileProjetsSejoursCasier: fileProjetsSejoursCasier.value }
          : {}),
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
