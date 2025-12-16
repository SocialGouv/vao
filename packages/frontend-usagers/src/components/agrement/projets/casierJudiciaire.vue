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
      label="J’atteste que les accompagnants et le responsable du déroulement du séjour sur le lieu de vacances n'ont pas fait l'objet d'une condamnation inscrite au bulletin n° 3 du casier judiciaire"
      :error-message="accompRespAttestHonoErrorMessage"
      required
      @change="onAccompRespAttestHonoChange"
    />
  </div>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="filesAccompResp"
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
import { FILE_CATEGORY } from "@vao/shared-bridge";
console.log("Hello from projet/casierJudiciaire.vue");

const props = defineProps({
  cdnUrl: { type: String, required: true },
});

// const getFileByCategory = (category) => {
//   return (
//     props.initAgrement?.agrementFiles.find(
//       (file) => file.category === category,
//     ) || null
//   );
// };

const getFileByCategory = () => {
  return null;
};

const filesAccompResp = ref(getFileByCategory(FILE_CATEGORY.ASSURRAPAT));

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
  const formValid = true;

  try {
    // CORRECTION : handleSubmit retourne maintenant les valeurs actuelles
    const result = await handleSubmit((values) => {
      // Log des valeurs ACTUELLES du formulaire
      console.log("Valeurs du formulaire:", values);
      return values;
    })();

    // Validation du type de déficiences

    if (!formValid) {
      console.error("Le formulaire n'est pas valide.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
      };
      console.log("Données finales:", finalData);
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire :", error);
  }
};

defineExpose({
  validateForm,
});
</script>
