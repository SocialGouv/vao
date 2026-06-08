<template>
  <fieldset class="no-border">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-bank-card-fill" aria-hidden="true"></span>
      Budget des personnes prévu
    </legend>
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          v-if="props.modifiable"
          name="budgetGestionPerso"
          :label="displayInput.AgrementProjetsInput['budgetGestionPerso'].label"
          hint="Minimum 20 caractères. Précisez la manière dont vous organisez le budget de chaque vacancier"
          :model-value="budgetGestionPerso"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="budgetGestionPersoMeta.valid"
          :error-message="budgetGestionPersoErrorMessage"
          @update:model-value="onBudgetGestionPersoChange"
        />
        <UtilsDisplayInput
          v-else
          :value="budgetGestionPerso"
          :input="displayInput.AgrementProjetsInput['budgetGestionPerso']"
          :is-valid="budgetGestionPersoMeta.valid"
          :error-message="budgetGestionPersoErrorMessage"
        />
      </div>
    </div>

    <div class="fr-fieldset__element fr-mt-8v">
      <div class="fr-col-12">
        <DsfrInputGroup
          v-if="props.modifiable"
          name="budgetPersoGestionComplementaire"
          :label="
            displayInput.AgrementProjetsInput[
              'budgetPersoGestionComplementaire'
            ].label
          "
          :model-value="budgetPersoGestionComplementaire"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="budgetPersoGestionComplementaireMeta.valid"
          :error-message="budgetPersoGestionComplementaireErrorMessage"
          @update:model-value="onBudgetPersoGestionComplementaireChange"
        />
        <UtilsDisplayInput
          v-else
          :value="budgetPersoGestionComplementaire"
          :input="
            displayInput.AgrementProjetsInput[
              'budgetPersoGestionComplementaire'
            ]
          "
          :is-valid="budgetPersoGestionComplementaireMeta.valid"
          :error-message="budgetPersoGestionComplementaireErrorMessage"
        />
      </div>
    </div>

    <div class="fr-fieldset__element fr-mt-8v">
      <UtilsMultiFilesUpload
        v-model="filesProjSejoursBudgetPersonnes"
        hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        :modifiable="props.modifiable"
        label="Ajouter des fichiers (optionnel)"
      />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../../utils/display-input";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const log = logger("components/agrement/projets/budget");

const filesProjSejoursBudgetPersonnes = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJSEJOURSBUDGETPERSONNES,
  ) || [],
);

const validationSchema = yup.object({
  budgetGestionPerso: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez préciser les conditions de gestion sur place. Minimum 20 caractères.",
      )
      .nullable(),
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
  const finalData = {
    valid: false,
    budgetGestionPerso: budgetGestionPerso.value,
    budgetPersoGestionComplementaire: budgetPersoGestionComplementaire.value,
    filesProjSejoursBudgetPersonnes: filesProjSejoursBudgetPersonnes.value,
  };

  try {
    const result = await handleSubmit((values) => values)();
    if (result) {
      finalData.budgetGestionPerso = result.budgetGestionPerso;
      finalData.budgetPersoGestionComplementaire =
        result.budgetPersoGestionComplementaire;
      finalData.valid = true;
    }
  } catch (error) {
    log.w("Erreur lors de la validation du formulaire :", error);
  }

  return finalData;
};

defineExpose({
  validateForm,
});
</script>
<style scoped>
fieldset.no-border {
  border: none;
  padding: 0;
}
legend {
  padding-left: 0;
}
</style>
