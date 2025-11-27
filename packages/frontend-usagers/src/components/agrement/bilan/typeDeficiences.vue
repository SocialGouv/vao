<template>
  <div>
    <p class="fr-mb-1v"><b>Type de handicaps</b></p>
    <p class="fr-hint-text fr-mb-0">
      Vous pouvez sélectionner une ou plusieurs options.
    </p>
    <div>
      <DsfrCheckboxSet
        v-model="typeDeficiences"
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
});

const handicapOptions = [
  { label: "Sensoriel", value: "auditif" },
  { label: "Cognitif", value: "visuel" },
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
  typeDeficiences: [],
};

const { validate } = useForm({
  validationSchema,
  initialValues,
});

const { value: typeDeficiences, errorMessage: typeDeficiencesErrorMessage } =
  useField("typeDeficiences");

const validateTypeDeficiences = async () => {
  const result = await validate();
  return {
    valid: result.valid,
    value: typeDeficiences.value,
    errors: typeDeficiencesErrorMessage.value,
  };
};

defineExpose({
  validateTypeDeficiences,
});
</script>
