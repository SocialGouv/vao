<template>
  <div>
    <div class="headings">
      <p class="fr-mb-0">Nom de l'hébergement</p>
      <p class="fr-mb-0">Adresse de l'hébergement</p>
      <p class="fr-mb-0">Période</p>
      <p class="fr-mb-0">
        <span>Nombre jours</span>
        <DsfrTooltip
          class="fr-ml-2v"
          content="Précisez la durée du séjour indépendamment du nombre de vacanciers présents."
        />
      </p>
      <p></p>
    </div>
    <AgrementBilanHebergementDetail
      v-for="(hebergement, index) in paginatedHebergements"
      :key="`${hebergement.agrBilanAnnuelId}-${hebergement.adresseId}-${index}`"
      :hebergement="hebergement"
    />
    <DsfrButton
      class="fr-mt-2v fr-col-12 add-btn"
      type="button"
      label="Ajouter un séjour"
      secondary
      icon="fr-icon-add-line"
      @click="toggleForm"
    />
    <div v-if="showForm" class="fr-mt-2v">
      <!-- Formulaire d'ajout de séjour (placeholder) -->
      <div class="fr-mt-6v">
        <DsfrInput
          name="nomHebergement"
          type="text"
          label="Nom de l'hébergement"
          :model-value="nomHebergement"
          :label-visible="true"
          :is-valid="nomHebergementMeta.valid"
          :error-message="nomHebergementErrorMessage"
          @update:model-value="onNomHebergementChange"
        />
      </div>
      <div class="fr-mt-6v">
        <DsfrInputGroup
          name="adresse"
          type="recherche"
          icon="fr-icon-search-line"
          label="Adresse de l'hébergement"
          :label-visible="true"
          :model-value="adresse"
          :is-valid="adresseMeta.valid"
          :error-message="adresseErrorMessage"
          @update:model-value="onAdresseChange"
        />
      </div>
      <div class="fr-mt-6v">
        <p class="fr-mb-0">Période</p>
        <AgrementBilanSelectMonths @update:selected="handleMonths" />
      </div>
      <div class="fr-mt-6v">
        <DsfrInput
          name="nbJours"
          type="number"
          label="nombre de jours"
          :model-value="nbJours"
          :label-visible="true"
          :is-valid="nbJoursMeta.valid"
          :error-message="nbJoursErrorMessage"
          @update:model-value="onNbJoursChange"
        />
      </div>
      <DsfrButton
        class="fr-mt-2v fr-col-12 add-btn"
        type="button"
        label="Ajouter le séjour"
        icon="fr-icon-add-line"
        @click="onSubmitAddSejour"
      />
    </div>
    <!-- Pagination -->
    <div class="pagination-center">
      <DsfrPagination
        v-if="totalPages > 1"
        v-model:current-page="currentPage"
        :pages="pages"
        :trunc-limit="2"
        next-page-title="séjours suivants"
        prev-page-title="séjours précédents"
        current-page-title-suffix=" - page courante"
        class="fr-mt-4v fr-col-12"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useField, useForm } from "vee-validate";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import * as yup from "yup";

const props = defineProps({
  statut: { type: String, required: true },
  bilanHebergement: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

// Configuration de la pagination
const ITEMS_PER_PAGE = 10;
const currentPage = ref(0);

const showForm = ref(false);

function toggleForm() {
  showForm.value = !showForm.value;
}

// Calcul du nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(props.bilanHebergement.length / ITEMS_PER_PAGE);
});

// Génération des pages pour le composant DsfrPagination
const pages = computed(() => {
  const pageArray = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pageArray.push({
      title: `Lien vers la page ${i}`,
      href: `#${i}`,
      label: `${i}`,
    });
  }
  return pageArray;
});

// Calcul des hébergements paginés
const paginatedHebergements = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return props.bilanHebergement.slice(start, end);
});

console.log("Total pages:", totalPages.value);
console.log("Pages:", pages.value);
console.log("Hébergements paginés:", paginatedHebergements.value);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  nBtotalJoursVacances: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre total de jours de vacances ne peut pas être négatif.")
      .required("Ce champ est obligatoire."),
  ),
  nomHebergement: yup.string().required("Champ obligatoire"),
  adresse: yup.string().required("Champ obligatoire"),
  nbJours: yup.number().required("Champ obligatoire"),
});

const { handleSubmit } = useForm({
  validationSchema,
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

function handleMonths(monthsArray) {
  console.log("Mois sélectionnés :", monthsArray);
}

const onSubmit = handleSubmit((values) => {
  // Ici tu ajoutes le séjour (à compléter plus tard)
  console.log("Séjour validé :", values);
  showForm.value = false; // Masque le formulaire après ajout
});

const onSubmitAddSejour = () => {
  onSubmit();
};

console.log("handleSubmit:", handleSubmit);
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  gap: 0 0.5rem;
  margin-bottom: 1rem;
}
.flex {
  display: flex;
  align-items: center;
}
.add-btn {
  width: 100%;
  justify-content: center;
}
</style>
