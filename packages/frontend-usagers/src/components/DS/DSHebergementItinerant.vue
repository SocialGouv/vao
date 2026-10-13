<template>
  <DsfrFieldset legend="Hébergements du séjour itinérant">
    <div
      v-for="(block, index) in blocks"
      :key="block.id"
      class="fr-fieldset__element fr-col-12 ds-itinerant-etape fr-px-3w"
    >
      <div v-if="modifiable" class="ds-itinerant-action">
        <DsfrButton
          tertiary
          no-outline
          icon="ri:delete-bin-2-line"
          icon-only
          type="button"
          :title="`Supprimer l’étape ${index + 1}`"
          @click="removeBlock(index)"
        >
          <span class="fr-sr-only">Supprimer l’étape {{ index + 1 }}</span>
        </DsfrButton>
      </div>
      <DsfrFieldset :legend="`Étape ${index + 1}`">
        <div class="ds-itinerant-row">
          <div class="ds-itinerant-champ">
            <DsfrInputGroup
              name="dateDebut"
              type="date"
              label="Date de début"
              :label-visible="true"
              :model-value="block.dateDebut"
              :min="dateDebut"
              :max="dateFin"
              :readonly="!modifiable"
              :disabled="index > 0"
              placeholder="Date de début"
              :wrapper-class="
                dateDebutErrorMessage(index) ? 'fr-input-group--error' : ''
              "
              @update:model-value="onDateDebutChange(index, $event)"
            />
            <p
              v-if="dateDebutErrorMessage(index)"
              class="fr-message fr-message--error"
            >
              {{ dateDebutErrorMessage(index) }}
            </p>
          </div>
          <div class="ds-itinerant-champ">
            <DsfrInputGroup
              name="dateFin"
              type="date"
              label="Date de fin"
              :label-visible="true"
              :model-value="block.dateFin"
              :min="block.dateDebut || dateDebut"
              :max="dateFin"
              :readonly="!modifiable"
              placeholder="Date de fin"
              :wrapper-class="
                dateFinErrorMessage(index) ? 'fr-input-group--error' : ''
              "
              @update:model-value="onDateFinChange(index, $event)"
            />
            <p
              v-if="dateFinErrorMessage(index)"
              class="fr-message fr-message--error"
            >
              {{ dateFinErrorMessage(index) }}
            </p>
          </div>
          <div class="ds-itinerant-champ ds-itinerant-champ--select">
            <DSHebergementSelect
              :model-value="block.siteId"
              label="Sélectionner un hébergement"
              name="siteId"
              :options="options"
              :modifiable="modifiable"
              :required="false"
              :error-message="siteErrorMessage(index)"
              @update:model-value="onSiteChange(index, $event)"
              @details="onDetails"
            />
          </div>
        </div>
      </DsfrFieldset>
    </div>
    <div
      v-if="modifiable && !isPeriodeComplete"
      class="fr-fieldset__element fr-col-12"
    >
      <DsfrButton
        secondary
        icon="ri:add-line"
        label="Ajouter une étape"
        @click="addBlock"
      />
    </div>
  </DsfrFieldset>
</template>

<script setup lang="ts">
import { isSejourComplet } from "@vao/shared-bridge";
import {
  dateDebutCoherenceError,
  dateFinCoherenceError,
  recalcDatesLendemain,
} from "~/utils/dsItineraire";
import type { DSItineraireBlock } from "~/utils/dsItineraire";
import type { SiteSelectOption } from "./DSHebergementSelect.vue";

export type { DSItineraireBlock as DSHebergementItinerantBlock } from "~/utils/dsItineraire";

interface DSHebergementItinerantProps {
  modelValue: DSItineraireBlock[];
  options: SiteSelectOption[];
  dateDebut: string;
  dateFin: string;
  modifiable?: boolean;
  dateDebutError?: (index: number) => string;
  dateFinError?: (index: number) => string;
  siteError?: (index: number) => string;
}

const props = withDefaults(defineProps<DSHebergementItinerantProps>(), {
  modifiable: true,
  dateDebutError: () => "",
  dateFinError: () => "",
  siteError: () => "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: DSItineraireBlock[]): void;
  (e: "details", value: string): void;
  (e: "switchedToSingle"): void;
}>();

const blocks = ref<DSItineraireBlock[]>([]);

const isPeriodeComplete = computed(() =>
  isSejourComplet(blocks.value, props.dateDebut, props.dateFin),
);

function syncBlocks() {
  blocks.value = props.modelValue.map((block) => ({ ...block }));
}

watch(
  () => props.modelValue,
  () => syncBlocks(),
  { immediate: true, deep: true },
);

function emitBlocks() {
  emit(
    "update:modelValue",
    blocks.value.map((block) => ({ ...block })),
  );
}

function recalcFrom(fromIndex: number) {
  blocks.value = recalcDatesLendemain(
    blocks.value,
    props.dateDebut,
    fromIndex,
  );
}

function onDateFinChange(index: number, value: string | number | undefined) {
  const arr = [...blocks.value];
  arr[index]!.dateFin = String(value ?? "");
  blocks.value = arr;
  recalcFrom(index + 1);
  emitBlocks();
}

function onDateDebutChange(index: number, value: string | number | undefined) {
  if (index !== 0) {
    return;
  }
  const arr = [...blocks.value];
  arr[index]!.dateDebut = String(value ?? "");
  blocks.value = arr;
  emitBlocks();
}

function onSiteChange(index: number, value: string) {
  const arr = [...blocks.value];
  arr[index]!.siteId = value;
  blocks.value = arr;
  emitBlocks();
}

function addBlock() {
  const arr = [...blocks.value];
  arr.push({
    id: `${Date.now()}-${arr.length}`,
    siteId: "",
    dateDebut: "",
    dateFin: "",
  });
  blocks.value = arr;
  recalcFrom(arr.length - 1);
  emitBlocks();
}

function removeBlock(index: number) {
  const arr = blocks.value.filter((_, i) => i !== index);
  blocks.value = arr;
  recalcFrom(0);
  emitBlocks();
  if (arr.length < 2) {
    emit("switchedToSingle");
  }
}

function onDetails(siteId: string) {
  emit("details", siteId);
}

function dateDebutErrorMessage(index: number): string {
  const coherence = dateDebutCoherenceError(
    blocks.value,
    props.dateDebut,
    index,
  );
  if (coherence !== "") {
    return coherence;
  }
  return props.dateDebutError(index) ?? "";
}
function dateFinErrorMessage(index: number): string {
  const coherence = dateFinCoherenceError(blocks.value, props.dateFin, index);
  if (coherence !== "") {
    return coherence;
  }
  return props.dateFinError(index) ?? "";
}
function siteErrorMessage(index: number): string {
  return props.siteError(index) ?? "";
}
</script>

<style scoped>
.ds-itinerant-etape {
  position: relative;
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 0.75rem;
}

.ds-itinerant-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: nowrap;
}

.ds-itinerant-champ {
  flex: 1 1 0;
  min-width: 0;
}

.ds-itinerant-champ--select {
  flex: 2 1 0;
}

.ds-itinerant-action {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
}
</style>
