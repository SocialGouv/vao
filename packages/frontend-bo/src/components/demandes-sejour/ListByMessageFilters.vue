<template>
  <div class="fr-fieldset">
    <div :class="filesetClass">
      <DsfrInputGroup
        v-model="idFonctionnelleSync"
        type="text"
        name="idFonctionnelle"
        label="Numéro de déclaration"
        placeholder="Numéro de déclaration"
        :label-visible="true"
        @update:model-value="filtersUpdate"
      />
    </div>
    <div :class="filesetClass">
      <DsfrInputGroup
        v-model="libelleSync"
        type="text"
        name="libelle"
        label="Nom du séjour"
        placeholder="Nom du séjour"
        :label-visible="true"
        @update:model-value="filtersUpdate"
      />
    </div>
    <div :class="filesetClass">
      <DsfrInputGroup
        v-model="organismeSync"
        type="text"
        name="organisme"
        label="Organisme"
        placeholder="Organisme"
        :label-visible="true"
        @update:model-value="filtersUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  idFonctionnelle: string;
  libelle: string;
  organisme: string;
}>();

const emits = defineEmits<{
  "update:idFonctionnelle": [string];
  "update:libelle": [string];
  "update:organisme": [string];
  "filters-update": [];
}>();

const filesetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3";

const idFonctionnelleSync = computed({
  get() {
    return props.idFonctionnelle;
  },
  set(value) {
    emits("update:idFonctionnelle", value);
  },
});

const libelleSync = computed({
  get() {
    return props.libelle;
  },
  set(value) {
    emits("update:libelle", value);
  },
});

const organismeSync = computed({
  get() {
    return props.organisme;
  },
  set(value) {
    emits("update:organisme", value);
  },
});

const filtersUpdate = () => emits("filters-update");
</script>
