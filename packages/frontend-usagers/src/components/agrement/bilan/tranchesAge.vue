<template>
  <div>
    <p class="fr-mb-1v"><b>Tranches d’âge</b></p>
    <p class="fr-hint-text fr-mb-0">
      Vous pouvez sélectionner une ou plusieurs options.
    </p>
    <div>
      <DsfrCheckboxSet
        v-model="trancheAge"
        name="trancheAge"
        legend=""
        :options="ageRangeOptions"
        :inline="true"
        :small="true"
        :error-message="trancheAgeErrorMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const ageRangeOptions = [
  { label: "de 18 à 39 ans", value: "18_39" },
  { label: "de 40 à 59 ans", value: "40_59" },
  { label: "plus de 59 ans", value: "59_et_plus" },
];

const validationSchema = yup.object({
  trancheAge: yup
    .array()
    .min(1, "Veuillez sélectionner au moins une tranche d’âge."),
});

const initialValues = {
  trancheAge: [],
};

const { validate } = useForm({
  validationSchema,
  initialValues,
});

const { value: trancheAge, errorMessage: trancheAgeErrorMessage } =
  useField("trancheAge");

const validateTranchesAge = async () => {
  const result = await validate();
  return {
    valid: result.valid,
    value: trancheAge.value,
    errors: trancheAgeErrorMessage.value,
  };
};

defineExpose({
  validateTranchesAge,
});
</script>
