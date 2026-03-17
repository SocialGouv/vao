<template>
  <div class="cells">
    <div class="cell">
      <DsfrInput
        v-if="props.modifiable"
        name="nomHebergement"
        type="text"
        :label="displayInput.IAgrementProjets['nomHebergement'].label"
        :model-value="nomHebergement"
        :label-visible="false"
        :is-valid="nomHebergementMeta.valid"
        :error-message="nomHebergementErrorMessage"
        @update:model-value="onNomHebergementChange"
      />
      <UtilsDisplayInput
        v-else
        :value="nomHebergement"
        :input="displayInput.IAgrementProjets['nomHebergement']"
        :label-visible="false"
        :is-valid="nomHebergementMeta.valid"
        :error-message="nomHebergementErrorMessage"
      />
    </div>
    <div class="cell">
      <DsfrInputGroup
        v-if="props.modifiable"
        name="adresse"
        type="recherche"
        icon="fr-icon-search-line"
        :label="displayInput.IAgrementProjets['adresseLabel'].label"
        :label-visible="false"
        :model-value="adresseLabel"
        :is-valid="adresseMeta.valid"
        :error-message="adresseErrorMessage"
        @update:model-value="onAdresseChange"
      />
      <UtilsDisplayInput
        v-else
        :value="adresseLabel"
        :input="displayInput.IAgrementProjets['adresseLabel']"
        :label-visible="false"
        :is-valid="adresseMeta.valid"
        :error-message="adresseErrorMessage"
      />
    </div>
    <div class="cell">
      <AgrementBilanSelectMonths
        :default-selected="props.hebergement.mois"
        :modifiable="props.modifiable"
        @update:selected="handleMonths"
      />
    </div>
    <div v-if="showNbJours" class="cell">
      <DsfrInput
        v-if="props.modifiable"
        name="nbJours"
        type="number"
        :label="displayInput.IAgrementProjets['nbJours'].label"
        :model-value="nbJours"
        :label-visible="false"
        :is-valid="nbJoursMeta.valid"
        :error-message="nbJoursErrorMessage"
        @update:model-value="onNbJoursChange"
      />
      <UtilsDisplayInput
        v-else
        :value="nbJours"
        :input="displayInput.IAgrementProjets['nbJours']"
        :label-visible="false"
        :is-valid="nbJoursMeta.valid"
      />
    </div>
    <div v-if="showNbVacanciers" class="cell">
      <DsfrInput
        v-if="props.modifiable"
        name="nbVacanciers"
        type="number"
        :label="displayInput.IAgrementProjets['nbVacanciers'].label"
        :model-value="nbVacanciers"
        :label-visible="false"
        :is-valid="nbVacanciersMeta.valid"
        :error-message="nbVacanciersErrorMessage"
        @update:model-value="onNbVacanciersChange"
      />
      <UtilsDisplayInput
        v-else
        :value="nbVacanciers"
        :input="displayInput.IAgrementProjets['nbVacanciers']"
        :label-visible="false"
        :is-valid="nbVacanciersMeta.valid"
      />

    </div>
    <div class="cell">
      <DsfrButton
        v-if="props.modifiable"
        class="fr-mt-2v"
        type="button"
        label="supprimer l'hébergement"
        secondary
        icon="fr-icon-delete-line"
        icon-only
        @click="emitDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import { watch, computed } from "vue";
import * as yup from "yup";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../../utils/display-input";

const emits = defineEmits(["delete", "update"]);

const props = defineProps({
  statut: {
    type: String,
    required: true,
  },
  hebergement: {
    type: Object,
    required: true,
  },
  modifiable: { type: Boolean, default: false },
});

const showNbJours = computed(() =>
  Object.prototype.hasOwnProperty.call(props.hebergement, "nbJours"),
);

const showNbVacanciers = computed(() =>
  Object.prototype.hasOwnProperty.call(props.hebergement, "nbVacanciers"),
);

function emitDelete() {
  emits("delete");
}

function handleMonths(monthsArray: number[]) {
  emits("update", { ...props.hebergement, mois: monthsArray });
}

function emitNomHebergementUpdate(value: string) {
  emits("update", { ...props.hebergement, nomHebergement: value });
}

function emitNbJoursUpdate(value: number) {
  emits("update", { ...props.hebergement, nbJours: value });
}

function emitNbVacanciersUpdate(value: number) {
  emits("update", { ...props.hebergement, nbVacanciers: value });
}

function emitAdresseUpdate(value: string) {
  emits("update", { ...props.hebergement, adresse: value });
}

const validationSchema = computed(() => {
  const schema: Record<string, yup.AnySchema> = {
    nomHebergement: requiredUnlessBrouillon(yup.string()),
    adresse: requiredUnlessBrouillon(yup.string()),
    statut: yup.string(),
  };

  if (showNbJours.value) {
    schema.nbJours = requiredUnlessBrouillon(
      yup.number().min(1, "Doit être au moins 1"),
    );
  }

  if (showNbVacanciers.value) {
    schema.nbVacanciers = requiredUnlessBrouillon(
      yup.number().min(1, "Doit être au moins 1"),
    );
  }

  return yup.object(schema);
});

const initialValues = computed(() => {
  const values: {
    nomHebergement: string;
    adresse: string;
    statut: string;
    nbJours?: number;
    nbVacanciers?: number;
  } = {
    nomHebergement: props.hebergement.nomHebergement || "",
    adresse: props.hebergement.adresse || "",
    statut: props.statut,
  };

  if (showNbJours.value) {
    values.nbJours = props.hebergement.nbJours || 0;
  }

  if (showNbVacanciers.value) {
    values.nbVacanciers = props.hebergement.nbVacanciers || 0;
  }

  return values;
});

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: nomHebergement,
  errorMessage: nomHebergementErrorMessage,
  handleChange: onNomHebergementChange,
  meta: nomHebergementMeta,
} = useField<string>("nomHebergement");

const {
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAdresseChange,
  meta: adresseMeta,
} = useField<string | { label: string }>("adresse");

const {
  value: nbJours,
  errorMessage: nbJoursErrorMessage,
  handleChange: onNbJoursChange,
  meta: nbJoursMeta,
} = showNbJours.value
  ? useField<number>("nbJours")
  : {
      value: null,
      errorMessage: null,
      handleChange: undefined,
      meta: { valid: true },
    };

const {
  value: nbVacanciers,
  errorMessage: nbVacanciersErrorMessage,
  handleChange: onNbVacanciersChange,
  meta: nbVacanciersMeta,
} = showNbVacanciers.value
  ? useField<number>("nbVacanciers")
  : {
      value: null,
      errorMessage: null,
      handleChange: undefined,
      meta: { valid: true },
    };

const adresseLabel = computed(() => {
  if (!adresse.value) return "";

  if (typeof adresse.value === "object" && adresse.value.label) {
    return adresse.value.label;
  }

  if (typeof adresse.value === "string") {
    return adresse.value;
  }

  return "";
});

watch(nomHebergement, (newValue) => {
  emitNomHebergementUpdate(newValue);
});

if (showNbJours.value && nbJours) {
  watch(nbJours, (newValue) => {
    if (newValue !== null && newValue !== undefined) {
      emitNbJoursUpdate(newValue);
    }
  });
}

if (showNbVacanciers.value && nbVacanciers) {
  watch(nbVacanciers, (newValue) => {
    if (newValue !== null && newValue !== undefined) {
      emitNbVacanciersUpdate(newValue);
    }
  });
}

watch(adresse, (newValue) => {
  if (typeof newValue === "string") {
    emitAdresseUpdate(newValue);
  } else if (typeof newValue === "object" && newValue?.label) {
    emitAdresseUpdate(newValue.label);
  } else if (newValue) {
    emitAdresseUpdate(String(newValue));
  }
});

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  return result;
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
.cells {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  margin-bottom: 1rem;
  gap: 0 0.5rem;
  align-items: stretch;
}

.cells > * {
  height: 100%;
}

.cells > input {
  outline: 2px solid purple;
}
</style>
