<template>
  <div class="fr-fieldset">
    <div :class="filedsetClass">
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="nomSync"
          type="text"
          name="Nom"
          label="Nom"
          placeholder="Nom"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass">
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="prenomSync"
          type="text"
          name="Prénom"
          label="Prénom"
          placeholder="Prénom"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass">
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="emailSync"
          type="text"
          name="email"
          label="Adresse courriel"
          placeholder="Adresse courriel"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass">
      <div class="fr-input-group">
        <DsfrSelect
          v-model="statutSync"
          label="Actions à faire"
          name="action"
          mode="tags"
          :options="props.statusActions"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  nom: string;
  prenom: string;
  email: string;
  statut: string;
  statusActions: { value: string; text: string }[];
}>();

const emits = defineEmits<{
  "update:nom": [string];
  "update:prenom": [string];
  "update:email": [string];
  "update:statut": [string];
  "filters-update": [];
}>();

const filedsetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2";

const nomSync = computed({
  get() {
    return props.nom;
  },
  set(value) {
    emits("update:nom", value);
  },
});

const prenomSync = computed({
  get() {
    return props.prenom;
  },
  set(value) {
    emits("update:prenom", value);
  },
});

const emailSync = computed({
  get() {
    return props.email;
  },
  set(value) {
    emits("update:email", value);
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
