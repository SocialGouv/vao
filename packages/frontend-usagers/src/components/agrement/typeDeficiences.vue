<template>
  <div>
    <div v-if="props.modifiable">
      <DsfrCheckboxSet
        v-model="typeDeficiencesField"
        name="typeDeficiences"
        :legend="displayInput.AgrementBilanAnnuelInput['typeHandicap'].label"
        hint="Vous pouvez sélectionner une ou plusieurs options."
        :options="handicapOptions"
        :inline="true"
        :small="true"
        :error-message="typeDeficiencesErrorMessage"
      >
        <template #legend>
          <span class="fr-text--bold">Type de handicaps</span>
        </template>
      </DsfrCheckboxSet>
    </div>
    <UtilsDisplayInput
      v-else
      :legend="displayInput.AgrementBilanAnnuelInput['typeHandicap'].label"
      :input="displayInput.AgrementBilanAnnuelInput['typeHandicap']"
      :value="typeDeficiencesField"
      :error-message="typeDeficiencesErrorMessage"
      :is-valid="typeDeficiencesMeta.valid"
    />
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import { onMounted } from "vue";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../utils/display-input";
import { useToaster } from "@vao/shared-ui";
import {
  AGREMENT_STATUT,
  AGREMENT_STATUTS_PERMISSIFS,
} from "@vao/shared-bridge";
const props = defineProps({
  statut: { type: String, required: true },
  typeDeficiences: { type: Array, default: () => [] },
  modifiable: { type: Boolean, required: false, default: false },
});

const toaster = useToaster();

const handicapOptions = [
  { label: "Sensoriel", value: "auditif", name: "typeDeficiences" },
  { label: "Visuel", value: "visuel", name: "typeDeficiences" },
  { label: "Cognitif", value: "cognitif", name: "typeDeficiences" },
  { label: "Mental/Psychique", value: "mental", name: "typeDeficiences" },
  { label: "Moteur", value: "moteur", name: "typeDeficiences" },
  { label: "Polyhandicap", value: "polyhandicap", name: "typeDeficiences" },
];

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)),
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
  validateOnMount: true,
});

// avoid double validation: `validateOnMount: true` already triggers validation
// on mount. Do not call `validate()` manually here.

const {
  value: typeDeficiencesField,
  meta: typeDeficiencesMeta,
  errorMessage: typeDeficiencesErrorMessage,
} = useField<string[]>("typeDeficiences");

const validateTypeDeficiences = async () => {
  const result = await validate();
  // Show toaster only when statut is not permissive
  if (
    !result.valid &&
    typeDeficiencesErrorMessage.value &&
    !AGREMENT_STATUTS_PERMISSIFS.has(props.statut as AGREMENT_STATUT)
  ) {
    toaster.error({
      description: typeDeficiencesErrorMessage.value,
    });
  }
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
