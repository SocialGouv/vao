<template>
  <div class="cells">
    <div>{{ props.hebergement.nomHebergement }}</div>
    <div>125 avenue blabla</div>
    <div>juin</div>
    <div>6</div>
    <div>
      <DsfrButton
        type="button"
        label="supprimer l'hébergement"
        secondary
        icon="fr-icon-delete-line"
        icon-only
        @click="() => console.log('Valider hebergement')"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hebergement: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped>
.cells {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 1rem;
}
</style>
