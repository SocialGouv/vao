<template>
  <div>
    <DsfrCheckboxSet
      v-if="props.modifiable"
      :model-value="trancheAgeField"
      name="trancheAge"
      legend="Tranches d’âge"
      hint="Vous pouvez sélectionner une ou plusieurs options."
      :options="ageRangeOptions"
      :inline="true"
      :small="true"
      :error-message="trancheAgeErrorMessage"
      @update:model-value="onTrancheAgeChange"
    >
      <template #legend>
        <span class="fr-text--bold">Tranches d’âge</span>
      </template>
    </DsfrCheckboxSet>
    <UtilsDisplayInput
      v-else
      :input="displayInput.AgrementBilanAnnuelInput.trancheAge"
      :value="trancheAgeField"
      :error-message="trancheAgeErrorMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";
import displayInput from "../../../utils/display-input";

const props = defineProps({
  trancheAge: { type: Array, default: () => [] },
  statut: { type: String, required: true },
  modifiable: { type: Boolean, required: false, default: false },
});

const toaster = useToaster();

const ageRangeOptions = [
  { label: "de 18 à 39 ans", value: "18_39", name: "trancheAge" },
  { label: "de 40 à 59 ans", value: "40_59", name: "trancheAge" },
  { label: "plus de 59 ans", value: "59_et_plus", name: "trancheAge" },
];
const validationSchema = yup.object({
  trancheAge:
    props.statut === AGREMENT_STATUT.BROUILLON
      ? yup.array().notRequired().nullable()
      : requiredUnlessBrouillon(
          yup
            .array()
            .min(1, "Veuillez sélectionner au moins une tranche d’âge."),
        ),
});

const initialValues = {
  statut: props.statut,
  trancheAge: props.trancheAge || [],
};

const { validate } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: trancheAgeField,
  errorMessage: trancheAgeErrorMessage,
  handleChange: onTrancheAgeChange,
} = useField("trancheAge");

const validateTranchesAge = async () => {
  const result = await validate();

  if (!result.valid && trancheAgeErrorMessage.value) {
    toaster.error({
      description: trancheAgeErrorMessage.value,
    });
  }
  return {
    valid: result.valid,
    value: trancheAgeField.value,
    errors: trancheAgeErrorMessage.value,
  };
};

const getCurrentValue = () => {
  return trancheAgeField.value || [];
};

defineExpose({
  validateTranchesAge,
  getCurrentValue,
});
</script>
