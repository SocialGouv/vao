<template>
  <div>
    <p class="fr-mb-1v"><b>Tranches d’âge</b></p>
    <p class="fr-hint-text fr-mb-0">
      Vous pouvez sélectionner une ou plusieurs options.
    </p>
    <div>
      <DsfrCheckboxSet
        :model-value="trancheAgeField"
        name="trancheAge"
        legend=""
        :options="ageRangeOptions"
        :inline="true"
        :small="true"
        :error-message="trancheAgeErrorMessage"
        @update:model-value="onTrancheAgeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";

const props = defineProps({
  trancheAge: { type: Array, default: () => [] },
  statut: { type: String, required: true },
});

console.log("Tranche d'âge initiale :", props.trancheAge);
const ageRangeOptions = [
  { label: "de 18 à 39 ans", value: "18_39" },
  { label: "de 40 à 59 ans", value: "40_59" },
  { label: "plus de 59 ans", value: "59_et_plus" },
];

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  trancheAge: requiredUnlessBrouillon(
    yup.array().min(1, "Veuillez sélectionner au moins une tranche d’âge."),
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
  return {
    valid: result.valid,
    value: trancheAgeField.value,
    errors: trancheAgeErrorMessage.value,
  };
};

defineExpose({
  validateTranchesAge,
});
</script>
