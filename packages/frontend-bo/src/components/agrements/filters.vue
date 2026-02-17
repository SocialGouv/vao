<template>
  <div class="fr-fieldset">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-md-2">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="nameSync"
            type="text"
            name="name"
            label="Nom de l'organisme"
            placeholder="Nom"
            :label-visible="true"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
      <div class="fr-col-md-4 fr-col-lg-3">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="siretSync"
            type="text"
            name="name"
            label="Siret"
            placeholder="Siret"
            :label-visible="true"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
      <div class="fr-col-md-4 fr-col-lg-3">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="numeroAgrementSync"
            type="text"
            label="Numéro agrément"
            placeholder="Numéro agrément"
            :label-visible="true"
            name="numeroAgrement"
            mode="tags"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
      <div class="fr-col-md-4 fr-col-lg-3">
        <div class="fr-input-group">
          <DsfrSelect
            v-model="statutSync"
            label="Statut"
            name="statut"
            mode="tags"
            :options="statutOptions"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
      <div class="fr-col-md-4 fr-col-lg-2">
        <div class="fr-btns-group">
          <DsfrButton
            type="button"
            label="Extraire en CSV"
            primary
            @click="getCsv"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AGREMENT_STATUT_OPTIONS } from "@vao/shared-bridge";

const statutOptions = [
  { text: "Aucun", value: null },
  ...AGREMENT_STATUT_OPTIONS,
];
const props = defineProps<{
  siret: string;
  name: string;
  numeroAgrement: string;
  statut: string;
}>();

const emit = defineEmits([
  "update:siret",
  "update:name",
  "update:numero-agrement",
  "update:statut",
  "filters-update",
]);

const siretSync = computed({
  get() {
    return props.siret;
  },
  set(value) {
    emit("update:siret", value);
  },
});
const nameSync = computed({
  get() {
    return props.name;
  },
  set(value) {
    emit("update:name", value);
  },
});
const numeroAgrementSync = computed({
  get() {
    return props.numeroAgrement;
  },
  set(value) {
    emit("update:numero-agrement", value);
  },
});
const statutSync = computed({
  get() {
    return props.statut;
  },
  set(value) {
    emit("update:statut", value);
  },
});

const filtersUpdate = () => emit("filters-update");
const getCsv = async () => {
  // TODO TICKET 1199
};
</script>
