<template>
  <div class="fr-fieldset">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-4">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="nomSync"
            type="text"
            name="nom"
            label="Nom du lieu d'hébergement"
            placeholder="Nom"
            :label-visible="true"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
      <div class="fr-col-12 fr-col-md-4">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="adresseSync"
            type="text"
            name="adresse"
            label="Adresse"
            placeholder="Adresse"
            :label-visible="true"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
      <div class="fr-col-12 fr-col-md-4">
        <div class="fr-input-group">
          <DsfrSelect
            v-model="statutSync"
            label="Statut de l'hébergement"
            name="statut"
            mode="tags"
            :options="statusFiltre"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  nom: string;
  adresse: string;
  statut: string;
  statusFiltre: { value: string; text: string }[];
}>();
const emits = defineEmits<{
  "update:nom": [string];
  "update:adresse": [string];
  "update:statut": [string];
  "filters-update": [];
}>();

const nomSync = computed({
  get() {
    return props.nom;
  },
  set(value) {
    emits("update:nom", value);
  },
});
const adresseSync = computed({
  get() {
    return props.adresse;
  },
  set(value) {
    emits("update:adresse", value);
  },
});
const statutSync = computed({
  get() {
    return props.statut;
  },
  set(value) {
    emits("update:statut", value);
  },
});
const filtersUpdate = () => emits("filters-update");
</script>
