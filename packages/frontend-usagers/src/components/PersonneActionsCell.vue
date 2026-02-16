<template>
  <ul class="btns-group">
    <li>
      <DsfrButton
        class="fr-icon-edit-line"
        tertiary
        no-outline
        @click.stop="onEdit"
      >
        <span class="fr-sr-only">
          Éditer {{ personne?.prenom || "" }} {{ personne?.nom || "" }}
        </span>
      </DsfrButton>
    </li>

    <li>
      <DsfrButton
        class="fr-icon-delete-fill"
        tertiary
        no-outline
        @click.stop="onDelete"
      >
        <span class="fr-sr-only">
          Supprimer {{ personne?.prenom || "" }} {{ personne?.nom || "" }}
        </span>
      </DsfrButton>
    </li>
  </ul>
</template>

<script setup lang="ts">
type Personne = {
  nom: string;
  prenom: string;
  fonction: string;
};

defineProps<{
  personne: Personne;
  onEdit: () => void;
  onDelete: () => void;
}>();
</script>

<style scoped>
.btns-group {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
}
</style>
