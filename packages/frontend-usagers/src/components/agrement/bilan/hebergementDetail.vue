<template>
  <div class="cells">
    <div class="cell">
      <DsfrInput
        name="nomHebergement"
        type="text"
        label="Nom de l'hébergement"
        :model-value="nomHebergement"
        :label-visible="false"
        :is-valid="nomHebergementMeta.valid"
        :error-message="nomHebergementErrorMessage"
        @update:model-value="onNomHebergementChange"
      />
    </div>
    <div class="cell">
      <DsfrInputGroup
        name="adresse"
        type="recherche"
        icon="fr-icon-search-line"
        label="Adresse de l'hébergement"
        :label-visible="false"
        :model-value="adresseLabel"
        :is-valid="adresseMeta.valid"
        :error-message="adresseErrorMessage"
        @update:model-value="onAdresseChange"
      />
    </div>
    <div class="cell">
      <AgrementBilanSelectMonths
        :default-selected="props.hebergement.mois"
        @update:selected="handleMonths"
      />
    </div>
    <div class="cell">
      <DsfrInput
        name="nbJours"
        type="number"
        label="nombre de jours"
        :model-value="nbJours"
        :label-visible="false"
        :is-valid="nbJoursMeta.valid"
        :error-message="nbJoursErrorMessage"
        @update:model-value="onNbJoursChange"
      />
    </div>
    <div class="cell">
      <DsfrButton
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

<script setup>
import { useField, useForm } from "vee-validate";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { defineEmits } from "vue";
import * as yup from "yup";
// import Agrement from "~/components/organisme/agrement.vue";

const emits = defineEmits(["delete"]);

const props = defineProps({
  statut: {
    type: String,
    required: true,
  },
  hebergement: {
    type: Object,
    required: true,
  },
});

function emitDelete() {
  emits("delete");
}

function handleMonths(monthsArray) {
  console.log("Mois sélectionnés :", monthsArray);
}

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  nomHebergement: requiredUnlessBrouillon(yup.string()),
  nbJours: requiredUnlessBrouillon(yup.number().min(1, "Doit être au moins 1")),
  adresse: requiredUnlessBrouillon(yup.string()),
});

const initialValues = {
  nomHebergement: props.hebergement.nomHebergement || "",
  nbJours: props.hebergement.nbJours || 0,
  adresse: props.hebergement.adresse || "",
  statut: props.statut,
};

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
} = useField("nomHebergement");

const {
  value: nbJours,
  errorMessage: nbJoursErrorMessage,
  handleChange: onNbJoursChange,
  meta: nbJoursMeta,
} = useField("nbJours");

const {
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAdresseChange,
  meta: adresseMeta,
} = useField("adresse");

const adresseLabel = computed(
  () => (adresse.value && adresse.value.label) || "",
);

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  console.log("result", result);
};

defineExpose({
  validateForm,
  // isValid: () => meta.value.valid, // Optionnel : pour vérifier la validité
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
