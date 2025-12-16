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

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";

const props = defineProps({
  statut: { type: String, required: true },
  typeDeficiences: { type: Array, default: () => [] },
});

const handicapOptions = [
  { label: "Sensoriel", value: "auditif" },
  { label: "Cognitif", value: "cognitif" },
  { label: "Mental/Psychique", value: "mental" },
  { label: "Moteur", value: "moteur" },
  { label: "Polyhandicap", value: "polyhandicap" },
];

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  typeDeficiences: requiredUnlessBrouillon(
    yup.array().min(1, "Veuillez sélectionner au moins un type de déficience."),
  ),
});

const initialValues = {
  statut: props.statut,
  typeDeficiences: props.typeDeficiences || [],
};

console.log("Type de déficiences initial :", props.typeDeficiences);
const { validate } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: typeDeficiencesField,
  errorMessage: typeDeficiencesErrorMessage,
} = useField("typeDeficiences");

const validateTypeDeficiences = async () => {
  const result = await validate();
  return {
    valid: result.valid,
    value: typeDeficiencesField.value,
    errors: typeDeficiencesErrorMessage.value,
  };
};

defineExpose({
  validateTypeDeficiences,
});
</script>
