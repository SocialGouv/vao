<template>
  <div class="fr-container">
    <h1 class="header">Liste des Organismes</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.siret"
                  type="text"
                  name="SIRET"
                  label="SIRET"
                  placeholder="numéro SIREN ou SIREN"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.raisonSociale"
                  type="text"
                  name="Raison sociale"
                  label="Raison sociale"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.nomPersonnePhysique"
                  type="text"
                  name="nom"
                  label="Nom"
                  placeholder="Nom personne physique"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  :model-value="search.regionObtention"
                  name="regionObtention"
                  label="Région d’obtention de l’agrément"
                  :options="regions"
                  @update:model-value="onRegionObtentionChange"
                />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
    <UtilsTableFull
      :headers="headers"
      :data="organismeStore.organismes ?? []"
      :dict="dict"
      :search="search"
      @click-row="navigate"
    >
    </UtilsTableFull>
  </div>
</template>
<script setup>
import dayjs from "dayjs";
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});
import { useOrganismeStore } from "~/stores/organisme";
import { useRegionStore } from "~/stores/referentiels";
const organismeStore = useOrganismeStore();
const regionStore = useRegionStore();
regionStore.fetch();
const regions = computed(() =>
  [{ text: "Toutes", value: "" }].concat(regionStore.regions),
);
const search = reactive({
  nomPersonnePhysique: null,
  siret: null,
  raisonSociale: null,
  regionObtention: null,
});
// Appel du store à l'ouverture
organismeStore.fetchOrganismes({
  search,
});
const dict = {
  regionObtention: {
    obj: "agrement",
    val: "regionObtention",
  },
};
const headers = [
  {
    column: "organismeId",
    text: "ID organisme",
    sort: true,
  },
  {
    column: "typeOrganisme",
    text: "Type",
    format: (u) => u.typeOrganisme?.replace("_", " "),
    sort: true,
  },
  {
    column: "editedAt",
    text: "Date de modification",
    format: (u) => dayjs(u.editedAt).format("DD/MM/YYYY HH:MM"),
    sort: true,
  },
  {
    column: "siren",
    text: "SIREN",
    sort: true,
  },
  {
    column: "siret",
    text: "SIRET",
    sort: true,
  },
  {
    column: "raisonSociale",
    text: "Raison sociale",
    sort: true,
  },
  {
    column: "nomPersonnePhysique",
    text: "Nom",
    sort: true,
  },
  {
    column: "agrement",
    objectLabel: "regionObtention",
    text: "Région d'agrémentation",
    sort: true,
  },
  {
    column: "agrement",
    objectLabel: "dateObtention",
    text: "Date d'obtention",
    sort: true,
  },
];
const onRegionObtentionChange = (region) => {
  search.regionObtention = region;
};
const navigate = (organisme) => {
  navigateTo(`/organismes/${organisme.organismeId}`);
};
</script>
<style scoped>
.header {
  padding: 1em 0em;
}
</style>
