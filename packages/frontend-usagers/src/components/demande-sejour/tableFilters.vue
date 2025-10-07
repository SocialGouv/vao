<template>
  <div class="fr-fieldset">
    <div :class="filedsetClass">
      <div class="fr-input-group">
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
    </div>
    <div :class="filedsetClass">
      <div class="fr-input-group">
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
    </div>
    <div :class="filedsetClass">
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="siretSync"
          type="text"
          name="siret"
          label="Établissement déclarant"
          placeholder="Établissement déclarant"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass">
      <DsfrMultiselectV2
        v-model="departementSuiviSync"
        label="Département d'instruction"
        search
        select-all
        id-key="value"
        :options="departementOptions"
        @update:model-value="filtersUpdate"
      />
    </div>
    <div :class="filedsetClass">
      <DsfrMultiselectV2
        v-model="seasonSync"
        label="Saison"
        search
        select-all
        :options="seasonOptions"
        @update:model-value="filtersUpdate"
      >
        <template #checkbox-label="{ option }">
          {{ option.charAt(0).toUpperCase() + option.slice(1) }}
        </template>
      </DsfrMultiselectV2>
    </div>
    <div :class="filedsetClass">
      <DsfrMultiselectV2
        v-model="statusSync"
        label="Statut"
        search
        select-all
        :options="defaultStatus"
        @update:model-value="filtersUpdate"
      />
    </div>
    <div :class="filedsetClass">
      <DsfrButton
        type="button"
        label="Extraire en CSV"
        primary
        @click="exportGet"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { status as statusUtils, DsfrMultiselectV2 } from "@vao/shared-ui";

const departementStore = useDepartementStore();

const props = defineProps<{
  idFonctionnelle: string;
  libelle: string;
  siret: string;
  status: string[];
  season: string[];
  departementSuivi: string[];
}>();

const defaultStatus = [
  ...Object.values(statusUtils.defaultStatus as Record<string, string>),
];

const seasonOptions = ["hiver", "printemps", "été", "automne"];

const departementOptions = computed(() => {
  return (
    departementStore.departements as { text: string; value: string }[]
  ).map((d) => {
    return { label: d.text, value: d.value };
  });
});

const emits = defineEmits<{
  "update:idFonctionnelle": [string];
  "update:libelle": [string];
  "update:siret": [string];
  "update:status": [string[]];
  "update:season": [string[]];
  "update:departementSuivi": [string[]];
  "filters-update": [];
  "export-get": [];
}>();

const filedsetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-4";

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
const siretSync = computed({
  get() {
    return props.siret;
  },
  set(value) {
    emits("update:siret", value);
  },
});
const statusSync = computed({
  get() {
    return props.status;
  },
  set(value) {
    emits("update:status", value);
  },
});
const departementSuiviSync = computed({
  get() {
    return props.departementSuivi;
  },
  set(value) {
    emits("update:departementSuivi", value);
  },
});
const seasonSync = computed({
  get() {
    return props.season;
  },
  set(value) {
    emits("update:season", value);
  },
});

const filtersUpdate = () => emits("filters-update");
const exportGet = () => emits("export-get");
</script>
