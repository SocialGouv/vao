<template>
  <div>
    <div class="two-month pointer">
      <span class="fr-icon-file-text-line" aria-hidden="true"></span>
      <span>2 mois</span>
    </div>
    <span
      class="height-days unbreakable"
      :class="{ is_not_height_days: !isDeclaration8Jours }"
      >+ 8 jours</span
    >
  </div>
</template>

<script setup>
const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) =>
      Object.values(demandesSejours.statuts).includes(value),
  },
});

const isDeclaration8Jours = computed(() =>
  demandesSejours.isDeclaration8Jours(props.statut),
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

.unbreakable {
  white-space: nowrap;
}
</style>
