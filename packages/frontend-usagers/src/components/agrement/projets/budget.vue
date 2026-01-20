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
        name="budgetPersoGestionComplementaire"
        label="Précisions complémentaires (optionnel)"
        :model-value="budgetPersoGestionComplementaire"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="budgetPersoGestionComplementaireMeta.valid"
        :error-message="budgetPersoGestionComplementaireErrorMessage"
        @update:model-value="onBudgetPersoGestionComplementaireChange"
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <UtilsMultiFilesUpload
      v-model="filesProjSejoursBudgetPersonnes"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesProjSejoursBudgetPersonnes = ref(
  props.initAgrement?.agrementFiles.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJSEJOURSBUDGETPERSONNES,
  ) || [],
);

const validationSchema = yup.object({
  budgetGestionPerso: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  budgetPersoGestionComplementaire: yup.string().nullable(),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  budgetGestionPerso: props.initAgrement.budgetGestionPerso || "",
  budgetPersoGestionComplementaire:
    props.initAgrement.budgetPersoGestionComplementaire || "",
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
} = useField<string>("budgetGestionPerso");

const {
  value: budgetPersoGestionComplementaire,
  errorMessage: budgetPersoGestionComplementaireErrorMessage,
  meta: budgetPersoGestionComplementaireMeta,
  handleChange: onBudgetPersoGestionComplementaireChange,
} = useField<string>("budgetPersoGestionComplementaire");

const validateForm = async () => {
  const formValid = true;

  try {
    const result = await handleSubmit((values) => {
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
        ...(filesProjSejoursBudgetPersonnes.value.length > 0 && {
          filesProjSejoursBudgetPersonnes:
            filesProjSejoursBudgetPersonnes.value,
        }),
      };
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
