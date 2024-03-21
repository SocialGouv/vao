<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Lieux d'hébergements déclarés</h1>
      </div>
    </div>
    <template v-if="hebergementStore.hebergements.length">
      <div class="fr-grid-row">
        <div class="fr-col">
          <form>
            <fieldset class="fr-fieldset">
              <div
                class="fr-fieldset__element fr-fieldset__element--inline fr-col fr-col-lg-6"
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
                class="fr-fieldset__element fr-fieldset__element--inline fr-col fr-col-lg-6"
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
      <div class="fr-grid-row">
        <div class="fr-col">
          <UtilsTableFull
            :headers="headers"
            :data="hebergementStore.hebergements"
            :search="search"
            :row-navigate="navigate"
          />
        </div>
      </div>
    </template>
    <p v-else>Aucun hébergement déclaré actuellement</p>
    <div class="fr-grid-row">
      <div class="fr-col">
        <form>
          <fieldset class="fr-fieldset">
            <DsfrButton>
              <NuxtLink to="/hebergements/creation">
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
const hebergementStore = useHebergementStore();
hebergementStore.fetchHebergements();

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Mes hébergements",
  },
];

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
