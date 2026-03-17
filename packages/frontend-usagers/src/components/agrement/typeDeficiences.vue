<template>
  <div>
    <div v-if="props.modifiable">
      <p class="fr-mb-1v"><b>Type de handicaps</b></p>
      <p class="fr-hint-text fr-mb-0">
        Vous pouvez sélectionner une ou plusieurs options.
      </p>
      <DsfrCheckboxSet
        v-model="typeDeficiencesField"
        name="typeDeficiences"
        legend=""
        :options="handicapOptions"
        :inline="true"
        :small="true"
        :error-message="typeDeficiencesErrorMessage"
      />
    </div>
    <UtilsDisplayInput
      v-else
      :input="displayInput.IAgrementBilanAnnuel.typeHandicap"
      :value="typeDeficiencesField"
      :error-message="typeDeficiencesErrorMessage"
      :is-valid="typeDeficiencesMeta.valid"
    />
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../utils/display-input";
const props = defineProps({
  statut: { type: String, required: true },
  typeDeficiences: { type: Array, default: () => [] },
  modifiable: { type: Boolean, required: true, default: false },
});

const handicapOptions = [
  { label: "Sensoriel", value: "auditif", name: "typeDeficiences" },
  { label: "Visuel", value: "visuel", name: "typeDeficiences" },
  { label: "Cognitif", value: "cognitif", name: "typeDeficiences" },
  { label: "Mental/Psychique", value: "mental", name: "typeDeficiences" },
  { label: "Moteur", value: "moteur", name: "typeDeficiences" },
  { label: "Polyhandicap", value: "polyhandicap", name: "typeDeficiences" },
];

const validationSchema = yup.object({
  typeDeficiences: requiredUnlessBrouillon(
    yup.array().min(1, "Veuillez sélectionner au moins un type de déficience."),
  ),
});

const initialValues = {
  statut: props.statut,
  typeDeficiences: props.typeDeficiences || [],
};

const { validate } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: typeDeficiencesField,
  meta: typeDeficiencesMeta,
  errorMessage: typeDeficiencesErrorMessage,
} = useField<string[]>("typeDeficiences");

const validateTypeDeficiences = async () => {
  const result = await validate();
  return {
    valid: result.valid,
    value: typeDeficiencesField.value,
    errors: typeDeficiencesErrorMessage.value,
  };
};

const getCurrentValue = () => {
  return typeDeficiencesField.value || [];
};

defineExpose({
  validateTypeDeficiences,
  getCurrentValue,
});
</script>
