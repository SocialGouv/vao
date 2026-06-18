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
      :key="`${hebergement.agrBilanAnnuelId}-${hebergement.agrBilanAnnuelId}-${index}`"
      :hebergement="hebergement"
      :statut="props.statut || AGREMENT_STATUT.BROUILLON"
      @update="
        (updatedHebergement) =>
          handleHebergementUpdate(index, updatedHebergement)
      "
      @delete="() => handleHebergementDelete(index)"
    />
    <DsfrButton
      v-if="props.modifiable"
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
        <AgrementBilanSelectMonths
          :modifiable="props.modifiable"
          @update:selected="handleMonths"
        />
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

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { BilanHebergementDto } from "@vao/shared-bridge/src/dto/agrement.dto";
import type { AdresseDto } from "@vao/shared-bridge/src/dto/adresse.dto";
import SearchAddress from "@/components/address/search-address.vue";
import { useField, useForm } from "vee-validate";
import { useToaster } from "@vao/shared-ui";
import { normalizeAdresse, AGREMENT_STATUT } from "@vao/shared-bridge";
import * as yup from "yup";

const log = logger("components/AgrementBilanHebergements");

const props = defineProps<{
  bilanHebergement?: BilanHebergementDto[];
  statut?: string;
  modifiable?: boolean;
}>();

const toaster = useToaster();

const localHebergements = ref<BilanHebergementDto[]>([
  ...(props.bilanHebergement ?? []),
]);

const isFirstLoad = ref<boolean>(true);

watch(
  () => props.bilanHebergement,
  (newBilanHebergement) => {
    if (isFirstLoad.value) {
      localHebergements.value = [...(newBilanHebergement ?? [])];
      isFirstLoad.value = false;
    }
  },
  { immediate: true, deep: true },
);

const ITEMS_PER_PAGE = 10;
const currentPage = ref<number>(0);

const showForm = ref<boolean>(false);

function toggleForm(): void {
  showForm.value = !showForm.value;
}

const totalPages = computed<number>(() => {
  return Math.ceil(localHebergements.value.length / ITEMS_PER_PAGE);
});

const pages = computed<{ title: string; href: string; label: string }[]>(() => {
  const pageArray: { title: string; href: string; label: string }[] = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pageArray.push({
      title: `Lien vers la page ${i}`,
      href: `#${i}`,
      label: `${i}`,
    });
  }
  return pageArray;
});

const paginatedHebergements = computed<BilanHebergementDto[]>(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return localHebergements.value.slice(start, end);
});

function handleHebergementUpdate(
  index: number,
  updatedHebergement: BilanHebergementDto,
): void {
  const actualIndex = currentPage.value * ITEMS_PER_PAGE + index;
  localHebergements.value[actualIndex] = { ...updatedHebergement };
}

function handleHebergementDelete(index: number): void {
  const actualIndex = currentPage.value * ITEMS_PER_PAGE + index;
  localHebergements.value.splice(actualIndex, 1);

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
} = useField<string>("nomHebergement");

const {
  value: nbJours,
  errorMessage: nbJoursErrorMessage,
  handleChange: onNbJoursChange,
  meta: nbJoursMeta,
} = useField<number>("nbJours");

const { value: adresse, errorMessage: adresseErrorMessage } =
  useField<any>("adresse");

const {
  value: periode,
  errorMessage: periodeErrorMessage,
  meta: periodeMeta,
} = useField<string[]>("periode");

function handleMonths(monthsArray: string[]): void {
  periode.value = monthsArray;
}

const selectedAdresseObject = ref<AdresseDto | { label: string } | null>(null);

function onAdresseSelect(
  selectedAddress: AdresseDto | { label: string },
): void {
  adresse.value = selectedAddress.label || "";
  selectedAdresseObject.value = selectedAddress;
}

const onSubmitAddSejour = handleSubmit(
  (values: Record<string, any>) => {
    const adresseObject: AdresseDto | { label: string } =
      selectedAdresseObject.value
        ? selectedAdresseObject.value
        : { label: values.adresse };

    let adresseNorm: AdresseDto;
    try {
      adresseNorm = normalizeAdresse(adresseObject);
    } catch (e) {
      log.w("Erreur de normalisation de l'adresse :", e);
      toaster.error({
        description: "L'adresse saisie est incomplète ou invalide.",
      });
      return;
    }

    const agrBilanAnnuelId =
      (props.bilanHebergement && props.bilanHebergement[0]?.agrBilanAnnuelId) ||
      null;

    const newHebergement: BilanHebergementDto = {
      agrBilanAnnuelId,
      nomHebergement: values.nomHebergement,
      adresse: adresseNorm,
      nbJours: parseInt(values.nbJours),
      mois: values.periode.map((m: string) => parseInt(m)),
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
  (errors: any) => {
    console.warn("Erreurs de validation :", errors);
  },
);

function validateHebergements(): boolean {
  let isValid = true;
  const errors: string[] = [];

  localHebergements.value.forEach((hebergement, index) => {
    if (
      !hebergement.nomHebergement ||
      hebergement.nomHebergement?.trim?.() === ""
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

function getHebergements(): BilanHebergementDto[] {
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
