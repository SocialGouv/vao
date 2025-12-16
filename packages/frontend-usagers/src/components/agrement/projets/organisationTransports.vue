<template>
  <TitleWithIcon
    icon="fr-icon-bus-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Organisation des transports prévus
  </TitleWithIcon>

  <div class="fr-col-12">
    <DsfrInputGroup
      name="transportAllerRetour"
      label="Du lieu habituel de résidence au lieu de vacances de même que lors du retour "
      hint="Exemple : Car"
      :model-value="transportAllerRetour"
      :label-visible="true"
      :is-valid="transportAllerRetourMeta.valid"
      :error-message="transportAllerRetourErrorMessage"
      @update:model-value="onTransportAllerRetourChange"
    />
  </div>
  <div class="fr-col-12 fr-mt-6v">
    <DsfrInputGroup
      name="transportSejour"
      label="Durant le séjour du lieu d’hébergement au lieu des activités"
      hint="Exemple : Mini-bus"
      :model-value="transportSejour"
      :label-visible="true"
      :is-valid="transportSejourMeta.valid"
      :error-message="transportSejourErrorMessage"
      @update:model-value="onTransportSejourChange"
    />
  </div>

  <div class="fr-fieldset__element fr-mt-6v">
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

const props = defineProps({
  cdnUrl: { type: String, required: true },
});

// todo fichier
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
  transportAllerRetour: yup
    .string()
    .required("Merci de renseigner le mode de transport aller-retour."),
  transportSejour: yup
    .string()
    .required("Merci de renseigner le mode de transport durant le séjour."),
});

const initialValues = {
  transportAllerRetour: "",
  transportSejour: "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: transportAllerRetour,
  errorMessage: transportAllerRetourErrorMessage,
  meta: transportAllerRetourMeta,
  handleChange: onTransportAllerRetourChange,
} = useField("transportAllerRetour");

const {
  value: transportSejour,
  errorMessage: transportSejourErrorMessage,
  meta: transportSejourMeta,
  handleChange: onTransportSejourChange,
} = useField("transportSejour");

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
        ...(filesAccompResp.value.length > 0 && {
          filesAccompResp: filesAccompResp.value,
        }),
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
