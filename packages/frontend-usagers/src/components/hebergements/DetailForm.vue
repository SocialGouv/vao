<template>
  <form novalidate @submit.prevent="onSubmit">
    <p class="fr-pb-3w fr-col-12">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <fieldset class="fr-fieldset fr-mb-6w">
      <legend class="fr-fieldset__legend fr-text--regular fr-h3">
        Composition du lieu
      </legend>
      <div class="fr-fieldset__element fr-col-12">
        <fieldset
          class="fr-fieldset"
          :class="{ 'fr-fieldset--error': !!compositionErrorMessage }"
        >
          <legend class="fr-fieldset__legend fr-text--regular">
            Ce lieu comporte-t-il plusieurs hébergements accueillant des
            vacanciers (par exemple plusieurs bâtiments ou chalets) ?
          </legend>
          <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
            <div
              v-for="option in compositionOptions"
              :key="String(option.value)"
              class="fr-col-12 fr-col-sm-6"
            >
              <HebergementsCompositionCard
                name="multipleHebergements"
                :value="option.value"
                :label="option.label"
                :icon="option.icon"
                :hint="option.hint"
                :model-value="multipleHebergements"
                @update:model-value="onCompositionChange"
              />
            </div>
          </div>
          <div v-if="compositionErrorMessage" class="fr-messages-group">
            <p class="fr-message fr-message--error">
              {{ compositionErrorMessage }}
            </p>
          </div>
        </fieldset>
      </div>
    </fieldset>

    <div v-if="multipleHebergements !== null">
      <HebergementsDetailsFields
        v-for="(hebergement, index) in hebergements"
        :key="index"
        :label="hebergementLabel(index)"
        :name="`hebergement-${index}`"
        :model-value="hebergement"
        @update:model-value="onHebergementUpdate(index, $event)"
      />

      <div v-if="multipleHebergements" class="fr-mb-6w">
        <DsfrButton
          secondary
          icon="fr-icon-add-line"
          type="button"
          @click="addHebergement"
        >
          Ajouter un hébergement
        </DsfrButton>
      </div>
    </div>

    <div class="site-form-actions fr-mt-2w">
      <DsfrButton secondary type="button" @click="emit('previous')">
        Précédent
      </DsfrButton>
      <DsfrButton type="submit"> Suivant </DsfrButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import { ref, watch } from "vue";
import type { UniteHebergementDto } from "@vao/shared-bridge";
import {
  emptyHebergementDetail,
  mapUniteToHebergementDetail,
  type HebergementDetailValues,
} from "./hebergementDetails";

const compositionOptions = [
  {
    label: "Non, un seul hébergement",
    value: false,
    icon: "fr-icon-home-4-line",
    hint: "Le lieu accueille un unique hébergement.",
  },
  {
    label: "Oui, plusieurs hébergements",
    value: true,
    icon: "fr-icon-building-line",
    hint: "Le lieu comprend plusieurs bâtiments ou chalets distincts.",
  },
];

interface CompositionValues {
  multipleHebergements: boolean | null;
}

const emit = defineEmits<{
  (
    e: "submit",
    payload: {
      multipleHebergements: boolean;
      hebergements: HebergementDetailValues[];
    },
  ): void;
  (e: "previous"): void;
}>();

const props = withDefaults(
  defineProps<{
    siteId?: string | null;
    organismeId?: number | null;
    initUnites?: UniteHebergementDto[];
  }>(),
  {
    siteId: null,
    organismeId: null,
    initUnites: () => [],
  },
);

const hebergements = ref<HebergementDetailValues[]>(
  props.initUnites.length > 0
    ? props.initUnites.map(mapUniteToHebergementDetail)
    : [emptyHebergementDetail()],
);

const { handleSubmit, setFieldValue } = useForm<CompositionValues>({
  initialValues: {
    multipleHebergements:
      props.initUnites.length > 1
        ? true
        : props.initUnites.length === 1
          ? false
          : null,
  },
});

watch(
  () => props.initUnites,
  (unites) => {
    hebergements.value =
      unites.length > 0
        ? unites.map(mapUniteToHebergementDetail)
        : [emptyHebergementDetail()];
    let multipleHebergements: boolean | null = null;
    if (unites.length > 0) {
      multipleHebergements = unites.length > 1;
    }
    setFieldValue("multipleHebergements", multipleHebergements);
  },
);

const {
  value: multipleHebergements,
  errorMessage: compositionErrorMessage,
  handleChange: onCompositionChange,
} = useField<boolean | null>("multipleHebergements");

function hebergementLabel(index: number): string {
  if (multipleHebergements.value === false) {
    return "";
  }
  const ordinals = ["1er hébergement", "2ᵉ hébergement", "3ᵉ hébergement"];
  return ordinals[index] ?? `${index + 1}ᵉ hébergement`;
}

function onHebergementUpdate(index: number, value: HebergementDetailValues) {
  hebergements.value[index] = value;
}

function addHebergement() {
  hebergements.value.push(emptyHebergementDetail());
}

function onSubmit() {
  handleSubmit(({ multipleHebergements: multiple }) => {
    if (multiple === null) {
      return;
    }
    emit("submit", {
      multipleHebergements: multiple,
      hebergements: hebergements.value.map((h) => ({ ...h })),
    });
  })();
}
</script>

<style scoped>
.site-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
</style>
