<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row fr-py-5w">
      <h1>
        Mon agrément : {{ agrementStore.agrementEnTraitement?.numero }}
        <AgrementStatusBadge
          :statut="
            agrementStore?.agrementEnTraitement?.statut ??
            AGREMENT_STATUT.BROUILLON
          "
          type="fu"
        />
        <DsfrBadge
          v-if="agrementStore.isExpiryMedium || agrementStore.isExpirySoon"
          type="warning"
          :small="true"
          style="margin-left: 1ex"
          label="A RENOUVELLER"
        />
      </h1>
    </div>
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
        <AgrementAlertRenouvellement></AgrementAlertRenouvellement>
        <AgrementEtapesAvancement
          :init-agrement="agrementStore?.agrementEnTraitement ?? {}"
          :territoire="territoireStore.territoire ?? {}"
          :user="userStore.user ?? {}"
        />
        <p class="fr-mt-4v">
          <b>Déclarer vos séjours</b> 2 mois minimum avant la date de départ
        </p>
        <span
          v-if="
            agrementStore.agrementEnTraitement?.statut !==
            AGREMENT_STATUT.VALIDE
          "
        >
          <h2 class="fr-mb-0">
            Formulaire du renouvellement d’agrément ({{
              agrementAnneeRenouvellement
            }})
          </h2>
          <AgrementReadOnly
            class="fr-my-2w"
            :init-organisme="organismeStore.organismeCourant ?? {}"
            :init-agrement="agrementStore.agrementEnTraitement ?? {}"
            :modifiable="false"
            :cdn-url="`${config.public.backendUrl}/documents/`"
          />
        </span>
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="agrement-content-1"
        tab-id="agrement-tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <AgrementDocuments
          :init-agrement="agrementStore.agrementEnTraitement ?? {}"
          :cdn-url="`${config.public.backendUrl}/documents/`"
        ></AgrementDocuments>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-2"
        tab-id="agrement-tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <div class="tab-scroll">
          <Historique :history="agrementStore.history ?? []" />
        </div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-3"
        tab-id="agrement-tab-3"
        :selected="selectedTabIndex === 3"
        :asc="asc"
      >
        <div ref="messagerieScroll" class="tab-scroll">
          <AgrementMessagerie :messages="messages" />
        </div>
      </DsfrTabContent>
    </DsfrTabs>

    <AgrementAideContact />
  </div>
</template>

<script setup lang="ts">
import { getYear4k, AGREMENT_STATUT } from "@vao/shared-bridge";
import {
  AgrementStatusBadge,
  Historique,
  AgrementDocuments,
} from "@vao/shared-ui";

import { nextTick } from "vue";

const agrementStore = useAgrementStore();
const territoireStore = useTerritoireStore();
const organismeStore = useOrganismeStore();
const config = useRuntimeConfig();
const route = useRoute();
const userStore = useUserStore();

definePageMeta({
  middleware: [
    "is-connected",
    "check-organisme-is-complet",
    "check-feature-flags",
  ],
});

onMounted(async () => {
  log.i("Mounted");
  await territoireStore.fetchFicheByAgrementRegionUser();
  if (!agrementStore.agrementEnTraitement) {
    await agrementStore.getEnRenouvellement();
  }
  const agrementId = agrementStore.agrementEnTraitement?.id;
  if (!agrementId) {
    log.w("Aucun id d'agrément trouvé, impossible de récupérer l'historique.");
    return;
  }

  try {
    const history = await agrementStore.getHistory(agrementId);
    log.i("Historique de l'agrément récupéré avec succès", { history });
  } catch (error) {
    log.w("Erreur lors de la récupération de l'historique:", error);
  }
  try {
    await agrementStore.getMessages(String(agrementId));
    log.i("Messages de l'agrément récupérés avec succès");
  } catch (error) {
    log.w("Erreur lors de la récupération des messages:", error);
  }
});

const messagerieScroll = ref<HTMLElement | null>(null);
const messages = computed(() => agrementStore.messages ?? []);

watch(messages, async () => {
  if (selectedTabIndex.value === Tab.Messages) {
    await nextTick();

    const el = messagerieScroll.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
});
const unreadCount = computed(() => agrementStore.messagesUnreadCount ?? 0);

const agrementAnneeRenouvellement = computed(() => {
  return agrementStore.agrementEnTraitement?.dateDepot
    ? getYear4k(agrementStore.agrementEnTraitement?.dateDepot)
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
  [Tab.Messages]: async () => {
    if (agrementStore.agrementEnTraitement) {
      await agrementStore.patchMessagesAsRead(
        String(agrementStore.agrementEnTraitement?.id),
      );
      await agrementStore.getMessages(
        String(agrementStore.agrementEnTraitement?.id),
      );
    }
  },
};

const selectTab = async (idx: Tab) => {
  asc.value = selectedTabIndex.value < idx;
  await tabActions[idx]?.();

  if (idx === Tab.Messages) {
    await nextTick();

    const el = messagerieScroll.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
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
    title:
      unreadCount.value > 0
        ? `Messagerie (${unreadCount.value})`
        : "Messagerie",
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
.tab-scroll {
  height: calc(100vh); /* ajuste */
  overflow-y: auto;
}
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
