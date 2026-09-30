<template>
  <div class="fr-p-4w">
    <div v-for="group in groups" :key="group.type" class="fr-mb-3w">
      <h2 class="fr-mb-1w similarity-title">
        <span v-for="(seg, i) in group.title" :key="i">
          <strong v-if="seg.bold">{{ seg.text }}</strong>
          <template v-else>{{ seg.text }}</template>
        </span>
      </h2>
      <template v-if="group.type === 'nomLieu'">
        <div class="fr-mb-2w">
          <ul class="fr-mb-0">
            <li v-for="name in group.names" :key="name">
              <strong>{{ name }}</strong>
            </li>
          </ul>
        </div>
        <div class="fr-mb-2w">
          <p class="fr-mb-0">
            Votre saisie : <strong>{{ saisieName }}</strong>
          </p>
        </div>
      </template>
      <template v-else>
        <div class="fr-fieldset__element">
          <p class="fr-mb-0">
            Votre saisie :
            <span
              v-for="(seg, i) in highlightLabelSegments(
                adresseLabelSaisie,
                group.type,
              )"
              :key="i"
            >
              <strong v-if="seg.bold">{{ seg.text }}</strong>
              <template v-else>{{ seg.text }}</template>
            </span>
          </p>
        </div>
        <div
          v-if="group.items.length > 1"
          class="fr-fieldset__element fr-mt-1w"
        >
          <p class="fr-mb-1v">Saisies similaires :</p>
          <ul class="fr-mb-0">
            <li v-for="item in group.items" :key="item.siteId">
              <span
                v-for="(seg, i) in similarLabelSegments(item, group.type)"
                :key="i"
              >
                <strong v-if="seg.bold">{{ seg.text }}</strong>
                <template v-else>{{ seg.text }}</template>
              </span>
            </li>
          </ul>
        </div>
        <div v-else-if="group.items.length === 1" class="fr-fieldset__element">
          <p class="fr-mb-0">
            Saisie similaire :
            <span
              v-for="(seg, i) in similarLabelSegments(
                group.items[0]!,
                group.type,
              )"
              :key="i"
            >
              <strong v-if="seg.bold">{{ seg.text }}</strong>
              <template v-else>{{ seg.text }}</template>
            </span>
          </p>
        </div>
      </template>
    </div>

    <div class="fr-btns-group fr-btns-group--inline-md">
      <DsfrButton
        type="button"
        label="Retourner à la saisie"
        primary
        @click="emit('edit')"
      />
      <DsfrButton
        type="button"
        label="Continuer sans modifier"
        secondary
        @click="emit('continue')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdresseDto, SiteSimilariteResult } from "@vao/shared-bridge";
import {
  buildSimilarityGroups,
  highlightLabelSegments,
  similarLabelSegments,
} from "@/helpers/addressSimilarity";

const props = defineProps<{
  saisie: { nomSiteOfficiel: string; adresse: AdresseDto | null };
  similarites: SiteSimilariteResult[];
}>();

const emit = defineEmits<{
  (e: "continue" | "edit"): void;
}>();

const adresseLabelSaisie = computed(
  () => props.saisie.adresse?.label ?? props.saisie.nomSiteOfficiel,
);
const saisieName = computed(() => props.saisie.nomSiteOfficiel);

const groups = computed(() => buildSimilarityGroups(props.similarites));
</script>

<style scoped>
.similarity-title {
  font-size: 1.125rem;
  line-height: 1.5rem;
  font-weight: 400;
  margin: var(--title-spacing);
}
</style>
