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
        <h1>Dossier</h1>
        <AgrementEtapesAvancement
          :init-agrement="agrementStore.agrementCourant ?? {}"
          :territoire="territoireStore.territoire ?? {}"
          :user="userStore.user ?? {}"
        />
        <p class="fr-mt-4v">
          <b>Déclarer vos séjours</b> 2 mois minimum avant la date de départ
        </p>
        <h2 class="fr-mb-0">
          Formulaire du renouvellement d’agrément ({{
            agrementAnneeRenouvellement
          }})
        </h2>
        <AgrementReadOnly
          class="fr-my-2w"
          :init-organisme="organismeStore.organismeCourant ?? {}"
          :init-agrement="agrementStore.agrementCourant ?? {}"
          :modifiable="false"
          :cdn-url="`${config.public.backendUrl}/documents/`"
        />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="agrement-content-1"
        tab-id="agrement-tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <AgrementDocuments
          :init-agrement="agrementStore.agrementCourant ?? {}"
        ></AgrementDocuments>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-2"
        tab-id="agrement-tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <AgrementHistorique :history="agrementStore.history ?? []" />
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

    <AgrementAideContact />
  </div>
</template>

<script setup lang="ts">
import { getYear4k } from "@vao/shared-bridge";

const agrementStore = useAgrementStore();
const territoireStore = useTerritoireStore();
const organismeStore = useOrganismeStore();
const config = useRuntimeConfig();
const route = useRoute();
const userStore = useUserStore();

onMounted(async () => {
  log.i("Mounted");
  await territoireStore.fetchFicheByAgrementRegionUser();

  const agrementId = agrementStore.agrementCourant?.id;
  if (!agrementId) {
    log.w("Aucun id d'agrément trouvé, impossible de récupérer l'historique.");
    return;
  }

  try {
    const history = await agrementStore.getHistory(String(agrementId));
    log.i("Historique de l'agrément récupéré avec succès", { history });
  } catch (error) {
    log.w("Erreur lors de la récupération de l'historique:", error);
  }
});

const agrementAnneeRenouvellement = computed(() => {
  return agrementStore.agrementCourant?.dateDepot
    ? getYear4k(agrementStore.agrementCourant?.dateDepot)
    : "Non déposé";
});

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

const queryIndex = route.query.defaultTabIndex;

const initialSelectedIndex =
  typeof queryIndex === "string" ? parseInt(queryIndex, 10) : 0;

const selectedTabIndex = ref(initialSelectedIndex);

const asc = ref(true);

enum Tab {
  Documents = 1,
  Historique = 2,
  Messages = 3,
}

const tabActions: Record<Tab, () => void> = {
  [Tab.Documents]: () => {},
  [Tab.Historique]: () => {},
  [Tab.Messages]: () => {},
};

const selectTab = async (idx: Tab) => {
  asc.value = selectedTabIndex.value < idx;
  tabActions[idx]();
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
