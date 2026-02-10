<template>
  <div class="btns-group">
    <DsfrButton
      class="fr-icon-edit-line"
      tertiary
      no-outline
      :aria-label="`Éditer ${personne?.prenom || ''} ${personne?.nom || ''}`"
      @click.stop="onEdit"
    />
    <DsfrButton
      class="fr-icon-delete-fill"
      tertiary
      no-outline
      :aria-label="`Supprimer ${personne?.prenom || ''} ${personne?.nom || ''}`"
      @click.stop="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
type Personne = {
  nom: string
  prenom: string
  fonction: string
}

defineProps<{
  personne: Personne
  index: number
  onEdit: () => void
  onDelete: () => void
}>()
</script>

<style scoped>
.btns-group {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>