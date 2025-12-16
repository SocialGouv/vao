<template>
  <TitleWithIcon
    icon="fr-icon-capsule-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Suivi médical prévu
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="suiviMedDistribution"
        label="Mesures prévues pour la distribution et le stockage des médicaments"
        :model-value="suiviMedDistribution"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="suiviMedDistributionMeta.valid"
        :error-message="suiviMedDistributionErrorMessage"
        @update:model-value="onSuiviMedDistributionChange"
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="suiviMedAccordSejour"
        label="Accords passés avec un cabinet paramédical ou un médecin à proximité du lieu de séjour"
        :model-value="suiviMedAccordSejour"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="suiviMedAccordSejourMeta.valid"
        :error-message="suiviMedAccordSejourErrorMessage"
        @update:model-value="onSuiviMedAccordSejourChange"
      />
    </div>
  </div>
  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesSuiviMed"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

// todo: gerer file
const filesSuiviMed = ref(
  props.initAgrement?.agrementFiles.filter(
    (file) => file.category === FILE_CATEGORY.SUIVIMED,
  ) || [],
);

// const filesMotivation = ref([]);

const validationSchema = yup.object({
  suiviMedDistribution: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .required("Ce champ est obligatoire."),
  suiviMedAccordSejour: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .required("Ce champ est obligatoire."),
});

const initialValues = {
  suiviMedDistribution: "",
  suiviMedAccordSejour: "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: suiviMedDistribution,
  errorMessage: suiviMedDistributionErrorMessage,
  meta: suiviMedDistributionMeta,
  handleChange: onSuiviMedDistributionChange,
} = useField("suiviMedDistribution");

const {
  value: suiviMedAccordSejour,
  errorMessage: suiviMedAccordSejourErrorMessage,
  meta: suiviMedAccordSejourMeta,
  handleChange: onSuiviMedAccordSejourChange,
} = useField("suiviMedAccordSejour");

const validateForm = async () => {
  const formValid = true;

  try {
    // CORRECTION : handleSubmit retourne maintenant les valeurs actuelles
    const result = await handleSubmit((values) => {
      // Log des valeurs ACTUELLES du formulaire
      console.log("Valeurs du formulaire:", values);
      return values;
    })();

    if (!formValid) {
      console.error("Le formulaire n'est pas valide.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(filesSuiviMed.value.length > 0 && {
          filesSuiviMed: filesSuiviMed.value,
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
