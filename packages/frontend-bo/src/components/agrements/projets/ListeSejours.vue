<template>
  <div>
    <div class="headings">
      <p class="fr-mb-0">Nom de l'hébergement</p>
      <p class="fr-mb-0">Adresse de l'hébergement</p>
      <p class="fr-mb-0">Période</p>
      <p class="fr-mb-0">Nombre de vacanciers</p>
      <p></p>
    </div>
    <div v-for="(sejour, index) in sejours" :key="index">
      <HebergementDetail
        :hebergement="sejour"
        :statut="statut"
        :modifiable="props.modifiable"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import HebergementDetail from "../bilan/HebergementDetail.vue";

const props = defineProps({
  agrementId: { type: String, required: true },
  initialSejours: { type: Array, required: false, default: () => [] },
  statut: { type: String, required: false, default: "BROUILLON" },
});

const sejours = ref([...props.initialSejours]);
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  gap: 0 0.5rem;
  margin-bottom: 1rem;
}
.add-btn {
  width: 100%;
  justify-content: center;
}
.bg-light-blue {
  background: rgba(227, 227, 253, 0.4);
}
</style>
