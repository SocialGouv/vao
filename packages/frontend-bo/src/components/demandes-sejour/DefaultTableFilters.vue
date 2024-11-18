<template>
  <div>
    <div class="fr-fieldset">
      <div :class="filedsetClass">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="idFonctionnelleSync"
            type="text"
            name="idFonmctionnelle"
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
      <div :class="filedsetClass">
        <dsfr-multi-select
          v-model="statusSync"
          label="Statut"
          search
          select-all
          :options="defaultStatus"
          @update:model-value="filtersUpdate"
        />
      </div>
      <div :class="filedsetClass">
        <div class="fr-input-group">
          <DsfrSelect
            label="Actions à faire"
            name="action"
            mode="tags"
            :options="todoActions"
            @update:model-value="handleTodoActionChange($event as string)"
          />
        </div>
      </div>
      <div :class="filedsetClass">
        <ul class="fr-btns-group">
          <li>
            <DsfrButton
              type="button"
              label="Extraire en CSV"
              primary
              @click="getCsv"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DsfrMultiSelect } from "@vao/shared";
const demandeSejourStore = useDemandeSejourStore();

const props = defineProps<{
  idFonctionnelle: string;
  libelle: string;
  organisme: string;
  status: string[];
}>();

const defaultStatus = [...Object.values(demandesSejours.statuts)];

const emits = defineEmits<{
  "update:idFonctionnelle": [string];
  "update:libelle": [string];
  "update:organisme": [string];
  "update:status": [string[]];
  "filters-update": [];
}>();

const todoActions = [
  { value: "ALL", text: "Toutes les déclarations" },
  { value: "A_TRAITER", text: "Déclarations à traiter" },
  { value: "EN_ATTENTE", text: "Déclarations en attente" },
];

const filedsetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2";

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
const statusSync = computed({
  get() {
    return props.status;
  },
  set(value) {
    emits("update:status", value);
  },
});

const filtersUpdate = () => emits("filters-update");

const handleTodoActionChange = (value: string) => {
  const options: Record<string, string[]> = {
    A_TRAITER: [
      demandesSejours.statuts.TRANSMISE,
      demandesSejours.statuts.TRANSMISE_8J,
      demandesSejours.statuts.EN_COURS,
      demandesSejours.statuts.EN_COURS_8J,
    ],
    EN_ATTENTE: [
      demandesSejours.statuts.A_MODIFIER,
      demandesSejours.statuts.A_MODIFIER_8J,
      demandesSejours.statuts.ATTENTE_8_JOUR,
    ],
    ALL: [],
  };
  statusSync.value = options[value] ?? [];
  filtersUpdate();
};

const getCsv = async () => {
  const response = await demandeSejourStore.exportSejours();
  exportCsv(response, "sejours.csv");
};
</script>
