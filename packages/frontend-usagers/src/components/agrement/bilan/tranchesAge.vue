<template>
  <div>
    <DsfrCheckboxSet
      v-if="props.modifiable"
      :model-value="trancheAgeField"
      name="trancheAge"
      :legend="displayInput.AgrementBilanAnnuelInput['trancheAge'].label"
      hint="Vous pouvez sélectionner une ou plusieurs options."
      :options="ageRangeOptions"
      :inline="true"
      :small="true"
      :error-message="trancheAgeErrorMessage"
      @update:model-value="onTrancheAgeChange"
    >
      <template #legend>
        <span class="fr-text--bold">{{
          displayInput.AgrementBilanAnnuelInput["trancheAge"].label
        }}</span>
      </template>
    </DsfrCheckboxSet>
    <UtilsDisplayInput
      v-else
      :input="displayInput.AgrementBilanAnnuelInput['trancheAge']"
      :value="trancheAgeField"
      :error-message="trancheAgeErrorMessage"
      :is-valid="trancheAgeMeta.valid"
    />
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import {
  AGREMENT_STATUTS_PERMISSIFS,
  AGREMENT_STATUT,
} from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";
import displayInput from "../../../utils/display-input";
import { onMounted } from "vue";

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
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)),
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
  validateOnMount: true,
});

onMounted(() => {
  // ensure validation runs on mount in case validateOnMount is ineffective
  validate();
});
const {
  value: trancheAgeField,
  meta: trancheAgeMeta,
  errorMessage: trancheAgeErrorMessage,
  handleChange: onTrancheAgeChange,
} = useField("trancheAge");

const validateTranchesAge = async () => {
  const result = await validate();

  // Show toaster only when the statut is not permissive (i.e. when
  // required fields are expected). Previously the condition checked
  // equality with BROUILLON which was inverted versus intent.
  if (
    !result.valid &&
    trancheAgeErrorMessage.value &&
    !AGREMENT_STATUTS_PERMISSIFS.has(props.statut as AGREMENT_STATUT)
  ) {
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
