<template>
  <div class="fr-container">
    <h1 class="header">Lieux d'hébergements déclarés</h1>
    <div v-if="hebergementStore.hebergements.length">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <form>
            <fieldset class="fr-fieldset">
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-lg-6"
              >
                <div class="fr-input-group">
                  <DsfrInputGroup
                    v-model="search.nom"
                    type="text"
                    name="nom"
                    label="Nom du lieu d'hébergement"
                    :label-visible="true"
                  />
                </div>
              </div>
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-lg-6"
              >
                <div class="fr-input-group">
                  <DsfrInputGroup
                    v-model="search.adresse"
                    type="text"
                    name="adresse"
                    label="Adresse"
                    :label-visible="true"
                  />
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <UtilsTableFull
        :headers="headers"
        :data="hebergementStore.hebergements"
        :search="search"
        :row-navigate="navigate"
      />
    </div>
    <p v-else>Aucun hébergement déclaré actuellement</p>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <fieldset class="fr-fieldset">
            <DsfrButton>
              <NuxtLink to="/hebergements/new">
                Déclarer un nouvel hébergement
              </NuxtLink>
            </DsfrButton>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DsfrButton, DsfrInputGroup } from "@gouvminint/vue-dsfr";

const hebergementStore = useHebergementStore();
hebergementStore.fetchHebergements();

const search = reactive({
  nom: null,
  departement: null,
  adresse: null,
});

const headers = [
  {
    column: "nom",
    text: "Nom",
    sort: true,
  },
  {
    format: (hebergement) =>
      geo.departements[hebergement.departement] ?? hebergement.departement,
    text: "Département",
    sorter: "departement",
  },
  {
    column: "adresse",
    text: "Adresse",
    sort: true,
  },
];
const navigate = (hebergement) => navigateTo(`/hebergements/${hebergement.id}`);
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
