<template>
  <div class="card">
    <span
      v-if="state === 'success'"
      class="fr-icon-success-fill icone icone--success"
      aria-hidden="true"
    ></span>
    <span v-if="state === 'success'" class="fr-sr-only">Étape terminée</span>
    <span
      v-else-if="state === 'waiting'"
      class="fr-icon-time-line icone icone--waiting"
      aria-hidden="true"
    ></span>
    <span v-else-if="state === 'waiting'" class="fr-sr-only">Étape en attente</span>
    <div class="texte">
      <p class="texte-intitule">{{ libelle }}</p>
      <p class="texte-temporalite">
        <slot name="temporalite">{{ temporalite }}</slot>
      </p>
    </div>
    <p class="entite">{{ entite }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  state: {
    type: String as PropType<"success" | "waiting">,
    required: true,
    validator: (val: string) => ["success", "waiting"].includes(val),
  },
  libelle: {
    type: String,
    required: true,
  },
  temporalite: {
    type: String,
    required: false,
    default: "",
  },
  entite: {
    type: String,
    required: true,
  },
});
</script>
<style scoped lang="scss">
.card {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 86px; // hauteur minimale pour que le layout soit ok avec le stepper meme quand aucune "entite" n'est affichée
  border-radius: 4px;
  padding: 1rem;
  border: 1px solid
    var(--light-decisions-background-background-alt-grey-active, #cfcfcf);
  @media (max-width: 597px) {
    min-height: 110px;
    height: 110px;
  }
}
.card p {
  margin: 0;
}
.icone--success {
  color: green;
}
.texte {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 10px;
  flex-grow: 1;
}
.texte-intitule {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  color: var(--light-decisions-artwork-artwork-major-blue-france, #000091);
}
.texte-temporalite {
  font-size: 14px;
}
.entite {
  flex-shrink: 0;
  font-size: 14px;
}
</style>
