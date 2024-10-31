<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des territoires</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <div class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-2 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  v-model="search.regionObtention"
                  name="regionObtention"
                  label="Région d’obtention de l’agrément"
                  :options="regions"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <TableFull
      :headers="headers"
      :data="territoireStore.territoires ?? []"
      :search="search"
      @click-row="navigate"
    />
    <pre>{{territoireStore.territoires[0]}}</pre>
    <!--
    <dsfr-data-table-v2
      v-model:sort="sort"
      v-model:sort-direction="sortDirection"
      :titles="titles"
      table-title="Liste des territoires"
      :data="territoireStore.territoires"
      is-bordered
      is-selectable
      row-id="territoireId"
      is-sortable
    >
    </dsfr-data-table-v2>
    -->
  </div>
</template>

<script setup lang="ts">
import { TableFull } from "@vao/shared";
/*
import { DsfrDataTableV2 } from "@vao/shared";
import type { NestedKeys, Titles } from "@vao/shared/src/type";
import { ref } from "vue";

type InfoTerritoire = {
  id: number;
  value: string;
  text: string;
};


const titles: Titles<InfoTerritoire> = [
  {
    key: "value",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "text",
    label: "Prenom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "test.territoire",
    label: "Territoire",
    options: {
      isSortable: true,
    },
  },
];
//const selected = ref<InfoTerritoire["territoireId"][]>([]);
const sort = ref<NestedKeys<InfoTerritoire>>("nom");
const sortDirection = ref<"asc" | "desc">("asc");
*/
definePageMeta({
  middleware: ["is-connected"],
});

const regionStore = useRegionStore();
const territoireStore = useTerritoireStore();

let typeTerritoireField = competence.DEPARTEMENTALE;

regionStore.fetch();
territoireStore.fetch();

const regions = computed(() =>
  [{ text: "Toutes", value: "" }].concat(regionStore.regions),
);


const search = reactive({
  regionObtention: null,
});

const headers = [
  {
    column: "text",
    text: "Libellé",
    sort: true,
  },
  {
    column: "typeTerritoire",
    text: "Département/Région",
    sort: true,
    format: (item) =>
      item.typeTerritoire === "DEP" ? "Département" : "Région",
  },
  {
    column: "nbUsersBO",
    text: "Contacts",
    sort: false,
  },
  {
    column: "value",
    text: "Code",
    sort: true,
  },
  {
    column: "correspVaoNom",
    text: "Référént VAO",
    sort: true,
  },
  

];
/*
serviceTelephone: territoire.service_telephone,
            correspVaoNom: territoire.corresp_vao_nom,
            correspVaoPrenom: territoire.corresp_vao_prenom,

*/
const navigate = (territoire) => {
  navigateTo(`/territoires/${territoire.territoireId}`);
};
</script>
