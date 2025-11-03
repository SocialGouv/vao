<template>
  <div
    v-if="filteredApiUnavailableTypes.length > 0"
    class="fr-alert fr-alert--warning"
  >
    <h2>
      Service{{
        filteredApiUnavailableTypes.length > 1 ? "s" : ""
      }}
      indisponible{{ filteredApiUnavailableTypes.length > 1 ? "s" : "" }} :
    </h2>
    <ul>
      <li v-for="type in filteredApiUnavailableTypes" :key="type">
        {{ getApiLabel(type) }}
      </li>
    </ul>
    Au moins un service externe à l'application est actuellement
    indisponible.<br />
    Cela perturbe le fonctionnement du système. <br />
    Nous vous invitons à renouveler cette opération ultérieurement.
  </div>
</template>

<script setup>
import { apiLabels } from "../../models/api";
import { defineProps, computed } from "vue";

const props = defineProps({
  apiUnavailableTypes: {
    type: Object,
    required: true,
  },
  displayTypes: {
    type: Array,
    required: true,
  },
});

const filteredApiUnavailableTypes = computed(() => {
  return Object.entries(props.apiUnavailableTypes)
    .filter(([, isUnavailable]) => isUnavailable)
    .map(([type]) => type)
    .filter((type) => props.displayTypes.includes(type));
});

function getApiLabel(type) {
  return apiLabels[type] || type;
}
</script>
