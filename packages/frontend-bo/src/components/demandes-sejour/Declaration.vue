<template>
  <div>
    <div class="two-month pointer">
      <span class="fr-icon-file-text-line" aria-hidden="true"></span>
      <span>2 mois</span>
    </div>
    <span
      class="height-days"
      :class="{ is_not_height_days: !isDeclaration8Jours }"
      >+ 8 jours</span
    >
  </div>
</template>

<script setup>
import { demandeSejourStatut } from "~/utils/demandes-sejour/enum";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) => Object.values(demandeSejourStatut).includes(value),
  },
});

const isDeclaration8Jours = computed(() =>
  [
    demandeSejourStatut.ATTENTE_8_JOUR,
    demandeSejourStatut.TRANSMISE_8J,
    demandeSejourStatut.VALIDEE,
    demandeSejourStatut.REFUSEE,
  ].includes(props.statut),
);
</script>

<style scoped>
.two-month {
  display: flex;
  gap: 1em;
}

.height-days {
  padding-left: 2em;
}

.is_not_height_days {
  color: #cecece;
}
</style>
