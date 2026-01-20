<template>
  <div>
    <p class="fr-mb-1v"><b>Type de handicaps</b></p>
    <p class="fr-hint-text fr-mb-0">
      Vous pouvez sélectionner une ou plusieurs options.
    </p>
    <div>
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
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";

const props = defineProps({
  statut: { type: String, required: true },
  typeDeficiences: { type: Array, default: () => [] },
});

const handicapOptions = [
  { label: "Sensoriel", value: "auditif", name: "typeDeficiences" },
  { label: "Sensoriel", value: "visuel", name: "typeDeficiences" },
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
