<script setup lang="ts">
import { useToaster } from "../composables/useToaster";
import { DsfrAlert } from "@gouvminint/vue-dsfr";

const { toasts } = useToaster();

// role status par défaut ?
// forcer le role en warning quand j'ai un type warning ?? ou laisser gérer par l'utilisateur ?
// ajouter un aria live ?? Par defaut ?
// supprimer duration ?

function resolvedClosed(id: string) {
  const toast = toasts.find((t) => t.id === id);
  toast?.destroy();
}
</script>

<template>
  <div class="toast-container toast-container--top">
    <DsfrAlert
      v-for="toast in toasts"
      :id="String(toast.id)"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :description="toast.description"
      :title-tag="toast.titleTag"
      :small="toast.small"
      :closeable="true"
      :close-button-label="toast.closeButtonLabel || 'Fermer'"
      :role="toast.role || 'status'"
      @close="() => resolvedClosed(toast.id)"
    />
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2em;
  overflow: hidden;
  z-index: 9999;
  pointer-events: none;
}

.toast-container--top {
  flex-direction: column;
}

.fr-alert {
  background-color: white;
  align-self: flex-end;

  display: grid;
  align-items: center;
  animation-duration: 150ms;
  pointer-events: auto;
  min-height: 3em;
  cursor: pointer;
  word-break: break-word;
}
</style>
