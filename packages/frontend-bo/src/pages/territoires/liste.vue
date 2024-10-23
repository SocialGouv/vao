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
                <!--
                <DsfrRadioButtonSet
                  name="Type territoire"
                  legend="Type de territoire (régional ou départemental)"
                  :options="competence"
                  :inline="true"
                />

                      <div class="fr-fieldset__element">
                <DsfrRadioButtonSet
                  name="dispositionsSpecifiques"
                  legend="Des dispositions d’ordre sanitaire spécifiques sont-elles prévues ?"
                  :disabled="!props.modifiable"
                  :model-value="dispositionsSpecifiques"
                  :options="ouiNonOptions"
                  :is-valid="dispositionsSpecifiquesMeta.valid"
                  :inline="true"
                  :error-message="dispositionsSpecifiquesErrorMessage"
                  @update:model-value="onDispositionsSpecifiquesChange"
                />
              </div>
                -->
                {{typeTerritoireField}}
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
  </div>
  <pre>{{territoireStore.territoires}}</pre>
</template>
<script setup>
import { TableFull } from "@vao/shared";

import dayjs from "dayjs";
import Compte from "~/components/user/Compte.vue";


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
    column: "typeTerritoire",
    text: "Département/Région",
    sort: true,
    format: (item) =>
      item.typeTerritoire === "DEP" ? "Département" : "Région",
  },
  {
    column: "value",
    text: "Code",
    sort: true,
  },
  {
    column: "text",
    text: "Libellé",
    sort: true,
  },
  {
    column: "nbUsersBO",
    text: "Nombre d'utilisateurs",
    sort: false,
  },
];

const navigate = (territoire) => {
  navigateTo(`/territoires/${territoire.territoireId}`);
};
</script>
