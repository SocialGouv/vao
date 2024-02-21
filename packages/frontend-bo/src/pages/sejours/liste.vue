<template>
  <div class="fr-container">
    <h1 class="header">
      Liste des séjours déclarés ({{ sejourStore.demandes.length }})
    </h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.libelle"
                  type="text"
                  name="libelle"
                  label="Identifiant Séjour"
                  placeholder="Nom du séjour"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.organisme"
                  type="text"
                  name="organisme"
                  label="Organisme"
                  placeholder="Organisme"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.dateDebut"
                  type="date"
                  name="libelle"
                  label="Voyage avant le"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <label class="fr-label"> Statut </label>
                <DsfrSelect
                  :model-value="search.statut"
                  name="status"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="[
                    'Tous les statuts',
                    ...Object.values(demandeSejourStatut),
                  ]"
                  @update:model-value="onStatutSelect"
                />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
    <UtilsTableFull
      :headers="headers"
      :data="sejourStore.demandes"
      :row-navigate="navigate"
      :search="search"
      :dict="dict"
    ></UtilsTableFull>
  </div>
</template>

<script setup>
import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { formatDate } from "date-fns/format";
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";
import Declaration from "~/components/demandes-sejour/Declaration.vue";
import { DsfrInputGroup, DsfrSelect } from "@gouvminint/vue-dsfr";
import { demandeSejourStatut } from "~/utils/demandes-sejour/enum";
import PointableLabel from "~/components/demandes-sejour/PointableLabel.vue";

const sejourStore = useDemandeSejourStore();

onMounted(() => {
  sejourStore.fetchDemandes();
});

const onStatutSelect = (value) => {
  if (value === "Tous les statuts") {
    search.statut = null;
  } else {
    search.statut = value;
  }
};

const search = reactive({
  libelle: null,
  dateDebut: null,
  organisme: null,
  statut: null,
});

const dict = {
  dateDebut: (item, value) => new Date(item.dateDebut) < new Date(value),
  organisme: (item, value = "") =>
    sejourStore
      .organismeTitle(item.demandeSejourId)
      .toLowerCase()
      .match(value.toLowerCase()),
};

const headers = [
  {
    sorter: "demandeSejourLibelle",
    text: "Libelle",
    component: ({ libelle }) => ({
      component: PointableLabel,
      label: libelle,
    }),
  },
  {
    sorter: "demandeSejourLibelle",
    text: "Dates (Début-fin)",
    component: (value) => ({
      component: PointableLabel,
      label: `${formatDate(value.dateDebut, "dd/MM/yyyy")} - ${formatDate(value.dateFin, "dd/MM/yyyy")}`,
    }),
  },
  {
    sorter: "demandeSejourSaison",
    text: "Saison",
    component: (value) => ({
      component: PointableLabel,
      label: sejourStore.saison(value.demandeSejourId),
    }),
  },
  {
    sorter: "demandeSejourOrganisme",
    text: "Organisme",
    component: (value) => ({
      component: PointableLabel,
      label: sejourStore.organismeTitle(value.demandeSejourId),
    }),
  },
  {
    column: "demandeSejourDeclaration",
    sorter: "demandeSejourDeclaration",
    text: "Declaration",
    component: ({ statut }) => ({
      component: Declaration,
      statut: statut,
    }),
  },
  {
    column: "demandeSejourStatut",
    sorter: "demandeSejourStatut",
    text: "Statut",
    component: ({ statut }) => ({
      component: DemandeStatusBadge,
      statut: statut,
    }),
  },
];
const navigate = (state) => navigateTo(`/sejours/${state.demandeSejourId}`);
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
