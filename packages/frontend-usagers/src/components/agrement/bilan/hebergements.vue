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
      :statut="props.statut"
      @update="
        (updatedHebergement) =>
          handleHebergementUpdate(index, updatedHebergement)
      "
      @delete="() => handleHebergementDelete(index)"
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
      <!-- Formulaire d'ajout de séjour -->
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
        <SearchAddress
          label="Adresse de l'hébergement"
          :value="adresse"
          :error-message="adresseErrorMessage"
          @select="onAdresseSelect"
        />
      </div>
      <div class="fr-mt-6v">
        <p class="fr-mb-0">Période</p>
        <AgrementBilanSelectMonths @update:selected="handleMonths" />
        <p
          v-if="periodeMeta.touched && periodeErrorMessage"
          class="fr-error-text"
        >
          {{ periodeErrorMessage }}
        </p>
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
        class="fr-mt-4v fr-col-12 add-btn"
        type="button"
        label="Ajouter ce séjour"
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
import { computed, ref, watch } from "vue";
import SearchAddress from "@/components/address/search-address.vue";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  bilanHebergement: {
    type: Array,
    required: true,
    default: () => [],
  },
  statut: {
    type: String,
    required: true,
    default: "BROUILLON",
  },
});

const toaster = useToaster();

const localHebergements = ref([...props.bilanHebergement]);

// Si les props changent vraiment (changement d'année), on met à jour
const isFirstLoad = ref(true);

watch(
  () => props.bilanHebergement,
  (newBilanHebergement) => {
    if (isFirstLoad.value) {
      localHebergements.value = [...newBilanHebergement];
      isFirstLoad.value = false;
    }
  },
  { immediate: true, deep: true },
);

// Configuration de la pagination
const ITEMS_PER_PAGE = 10;
const currentPage = ref(0);

const showForm = ref(false);

function toggleForm() {
  showForm.value = !showForm.value;
}

// Calcul du nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(localHebergements.value.length / ITEMS_PER_PAGE);
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
  return localHebergements.value.slice(start, end);
});

function handleHebergementUpdate(index, updatedHebergement) {
  const actualIndex = currentPage.value * ITEMS_PER_PAGE + index;
  localHebergements.value[actualIndex] = { ...updatedHebergement };
}

function handleHebergementDelete(index) {
  const actualIndex = currentPage.value * ITEMS_PER_PAGE + index;
  localHebergements.value.splice(actualIndex, 1);

  // Ajuster la page courante si nécessaire
  if (currentPage.value >= totalPages.value && currentPage.value > 0) {
    currentPage.value = totalPages.value - 1;
  }

  toaster.success({
    titleTag: "h2",
    description: "L'hébergement a été supprimé avec succès.",
  });
}

const validationSchema = yup.object({
  nomHebergement: yup.string().required("Champ obligatoire"),
  adresse: yup.string().required("L'adresse est obligatoire"),
  nbJours: yup.number().required("Champ obligatoire"),
  periode: yup
    .array()
    .of(yup.string())
    .min(1, "Vous devez sélectionner au moins un mois.")
    .required("Veuillez sélectionner une période."),
});

const { handleSubmit, resetForm } = useForm({
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

const { value: adresse, errorMessage: adresseErrorMessage } =
  useField("adresse");

const {
  value: periode,
  errorMessage: periodeErrorMessage,
  meta: periodeMeta,
} = useField("periode");

function handleMonths(monthsArray) {
  periode.value = monthsArray;
}

const selectedAdresseObject = ref(null);

function onAdresseSelect(selectedAddress) {
  adresse.value = selectedAddress.label;
  selectedAdresseObject.value = selectedAddress;
}

const onSubmitAddSejour = handleSubmit(
  (values) => {
    const adresseObject = selectedAdresseObject.value
      ? {
          label: selectedAdresseObject.value.label,
          codeInsee: selectedAdresseObject.value.codeInsee || null,
          codePostal: selectedAdresseObject.value.codePostal || null,
          long: selectedAdresseObject.value.long || null,
          lat: selectedAdresseObject.value.lat || null,
          departement: selectedAdresseObject.value.departement || null,
        }
      : { label: values.adresse };

    const agrBilanAnnuelId =
      props.bilanHebergement[0]?.agrBilanAnnuelId || null;

    const newHebergement = {
      nomHebergement: values.nomHebergement,
      adresse: adresseObject,
      nbJours: parseInt(values.nbJours),
      mois: values.periode.map((m) => parseInt(m)),
      agrBilanAnnuelId,
    };

    localHebergements.value.push(newHebergement);

    resetForm();
    selectedAdresseObject.value = null;
    showForm.value = false;

    toaster.success({
      titleTag: "h2",
      description: "Le séjour a été ajouté avec succès.",
    });
  },
  (errors) => {
    console.log("Erreurs de validation :", errors);
  },
);

function validateHebergements() {
  let isValid = true;
  const errors = [];

  localHebergements.value.forEach((hebergement, index) => {
    if (
      !hebergement.nomHebergement ||
      hebergement.nomHebergement.trim() === ""
    ) {
      errors.push(`Hébergement ${index + 1}: Le nom est obligatoire`);
      isValid = false;
    }

    if (!hebergement.nbJours || hebergement.nbJours <= 0) {
      errors.push(
        `Hébergement ${index + 1}: Le nombre de jours doit être supérieur à 0`,
      );
      isValid = false;
    }

    if (!hebergement.mois || hebergement.mois.length === 0) {
      errors.push(
        `Hébergement ${index + 1}: Au moins un mois doit être sélectionné`,
      );
      isValid = false;
    }

    if (
      !hebergement.adresse ||
      (typeof hebergement.adresse === "object" && !hebergement.adresse.label)
    ) {
      errors.push(`Hébergement ${index + 1}: L'adresse est obligatoire`);
      isValid = false;
    }
  });

  if (!isValid) {
    errors.forEach((error) => {
      console.error(error);
    });
    toaster.error({
      titleTag: "h2",
      description:
        "Certains hébergements contiennent des erreurs. Veuillez les corriger.",
    });
  }

  return isValid;
}

function getHebergements() {
  return localHebergements.value;
}

defineExpose({
  getHebergements,
  validateHebergements,
});
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
