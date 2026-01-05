<template>
  <TitleWithIcon
    icon="fr-icon-bank-card-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Budget des personnes prévu
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="budgetGestionPerso"
        label="Conditions de gestion sur place et d’usage du budget personnel des personnes accueillies"
        hint="Précisez la manière dont vous organisez le budget de chaque vacancier"
        :model-value="budgetGestionPerso"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="budgetGestionPersoMeta.valid"
        :error-message="budgetGestionPersoErrorMessage"
        @update:model-value="onBudgetGestionPersoChange"
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="precisionComplementaire"
        label="Précisions complémentaires (optionnel)"
        :model-value="precisionComplementaire"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="precisionComplementaireMeta.valid"
        :error-message="precisionComplementaireErrorMessage"
        @update:model-value="onPrecisionComplementaireChange"
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursBudgetPersonnes"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";

// const props = defineProps({
//   initAgrement: { type: Object, required: true },
//   cdnUrl: { type: String, required: true },
// });

// todo: gerer file
const filesProjetsSejoursBudgetPersonnes = ref([]);

const validationSchema = yup.object({
  budgetGestionPerso: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .required("Ce champ est obligatoire."),
  precisionComplementaire: yup.string().nullable(),
});

const initialValues = {
  budgetGestionPerso: "",
  precisionComplementaire: "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: budgetGestionPerso,
  errorMessage: budgetGestionPersoErrorMessage,
  meta: budgetGestionPersoMeta,
  handleChange: onBudgetGestionPersoChange,
} = useField("budgetGestionPerso");

const {
  value: precisionComplementaire,
  errorMessage: precisionComplementaireErrorMessage,
  meta: precisionComplementaireMeta,
  handleChange: onPrecisionComplementaireChange,
} = useField("precisionComplementaire");

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
        ...(filesProjetsSejoursBudgetPersonnes.value.length > 0 && {
          filesProjetsSejoursBudgetPersonnes:
            filesProjetsSejoursBudgetPersonnes.value,
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
