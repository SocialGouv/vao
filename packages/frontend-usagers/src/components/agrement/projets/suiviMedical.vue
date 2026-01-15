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
      v-model="filesProjetsSejoursSuiviMed"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesProjetsSejoursSuiviMed = ref(
  props.initAgrement?.agrementFiles.filter(
    (file) => file.category === FILE_CATEGORY.PROJETSSEJOURSSUIVIMED,
  ) || [],
);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  suiviMedDistribution: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  suiviMedAccordSejour: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  suiviMedDistribution: props.initAgrement.suiviMedDistribution || "",
  suiviMedAccordSejour: props.initAgrement.suiviMedAccordSejour || "",
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
    const result = await handleSubmit((values) => {
      return values;
    })();

    if (!formValid) {
      console.error("Le formulaire n'est pas valide suivi.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(filesProjetsSejoursSuiviMed.value.length > 0 && {
          filesProjetsSejoursSuiviMed: filesProjetsSejoursSuiviMed.value,
        }),
      };
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire suivi :", error);
  }
};

defineExpose({
  validateForm,
});
</script>
