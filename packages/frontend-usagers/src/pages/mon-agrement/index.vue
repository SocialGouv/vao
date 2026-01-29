<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <DsfrTabs
      v-model="selectedTabIndex"
      tab-list-name="display-dossier"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @update:model-value="selectTab"
    >
      <DsfrTabContent
        panel-id="agrement-content-0"
        tab-id="agrement-tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <h2>Dossier</h2>
        <AgrementEtapesAvancement
          :init-agrement="agrementStore.agrementCourant ?? {}"
          :territoire="territoireStore.territoire ?? {}"
          :user="userStore.user ?? {}"
        />
        <p class="fr-mt-4v">
          <b>Déclarer vos séjours</b> 2 mois minimum avant la date de départ
        </p>
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="agrement-content-1"
        tab-id="agrement-tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-2"
        tab-id="agrement-tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <DSHistorique
          v-if="historique"
          :historique="historique.historique ?? []"
        ></DSHistorique>
        <DsfrAlert v-else-if="errorHistorique" type="error"
          >Une erreur est survenue durant la récupération de l'historique de la
          déclaration
        </DsfrAlert>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-3"
        tab-id="agrement-tab-3"
        :selected="selectedTabIndex === 3"
        :asc="asc"
      >
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-4"
        tab-id="agrement-tab-4"
        :selected="selectedTabIndex === 4"
        :asc="asc"
      >
      </DsfrTabContent>
    </DsfrTabs>

    <div class="aide-wrapper fr-p-5v">
      <h2 class="fr-h3 fr-mb-4v">Aide et contact</h2>
      <div class="aide-container">
        <div class="aide-image">
          <img
            src="../../assets/undraw_questions_g2px.svg"
            alt="Illustration questions"
          />
        </div>
        <div class="aide-contact-cards">
          <div class="fr-card fr-mb-3v flex-card">
            <div class="fr-card__body">
              <DsfrBadge label="Aide en ligne" type="info" small />
              <h3 class="fr-card__title">Portail d'assistance VAO</h3>
              <p class="fr-card__desc">
                Retrouvez les réponses à vos questions
              </p>
            </div>
            <div class="fr-card__footer">
              <a
                class="fr-link fr-link--icon-right"
                href="https://vao-assistance.atlassian.net/servicedesk/customer/portals"
                target="_blank"
              >
                Aide
              </a>
            </div>
          </div>

          <div class="fr-card flex-card">
            <div class="fr-card__body">
              <DsfrBadge label="Contact" type="info" small />
              <h3 class="fr-card__title">Contacter votre DREETS</h3>
              <p class="fr-card__desc">
                Téléphone : {{ territoireStore.territoire?.service_telephone }}
              </p>
              <p class="fr-card__desc">
                E-Mail : {{ territoireStore.territoire?.service_mail }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const agrementStore = useAgrementStore();
const route = useRoute();
const userStore = useUserStore();

useHead({
  title: "Déclaration de séjour détaillée | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description d'une déclaration de séjour.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Mon agrément",
  },
];

const log = logger("pages/mon-agrement/");

const initialSelectedIndex = parseInt(
  route.query?.defaultTabIndex ? route.query.defaultTabIndex : 0,
);

const selectedTabIndex = ref(initialSelectedIndex);
const asc = ref(true);

const selectTab = async (idx) => {
  asc.value = selectedTabIndex.value < idx;
  if (idx === 1) {
    // documents tab
  }
  if (idx === 2) {
    // historique tab
  }
  if (idx === 3) {
    //  messages tab
  }
};

const tabTitles = computed(() => [
  {
    title: "Dossier",
    tabId: "agrement-tab-0",
    panelId: "agrement-content-0",
  },
  {
    title: "Documents joints",
    tabId: "agrement-tab-1",
    panelId: "agrement-content-1",
  },
  {
    title: "Historique",
    tabId: "agrement-tab-2",
    panelId: "agrement-content-2",
  },
  {
    title: "Messagerie",
    tabId: "agrement-tab-3",
    panelId: "agrement-content-3",
  },
]);
const territoireStore = useTerritoireStore();

onMounted(async () => {
  log.i("Mounted");
  await territoireStore.fetchFicheByAgrementRegionUser();
});
</script>
<style scoped>
.aide-contact-cards {
  flex: 1; /* prend tout le reste de la largeur */
}
.aide-wrapper {
  background-color: #ececfe99;
  border-radius: 8px; /* optionnel */
}
.aide-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.aide-image img {
  max-width: 30em;
  width: 100%;
  height: auto;
}

.fr-card__footer .fr-link {
  padding-left: 0;
  margin-left: 2em;
}

/* Responsive */
@media (max-width: 768px) {
  .aide-container {
    flex-direction: column;
  }

  .aide-image {
    text-align: center;
  }
}
</style>
