<template>
  <div>
    <div class="two-month">
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
import { demandeStatusSejour } from "~/utils/demandes-sejour/enum";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) =>
      [
        demandeStatusSejour.EN_COURS,
        demandeStatusSejour.TRANSMISE,
        demandeStatusSejour.ATTENTE_HEBERGEMENT,
        demandeStatusSejour.VALIDEE,
        demandeStatusSejour.A_MODIFIER,
        demandeStatusSejour.ATTENTE_8_JOUR,
        demandeStatusSejour.REFUSEE,
      ].includes(value),
  },
});

const isDeclaration8Jours = computed(
  () => props.statut === demandeStatusSejour.ATTENTE_8_JOUR,
);
</script>

<style>
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
