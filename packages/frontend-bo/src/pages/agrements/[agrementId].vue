<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div v-if="agrementCourant">
      <div class="title-container fr-mb-4v">
        <h1>
          Agrément
          {{ agrementCourant?.numero ? ` n° ${agrementCourant.numero}` : "" }}
        </h1>
        <AgrementTypeDepotBadge
          v-if="agrementCourant.statut"
          :type-depot="typeDepot"
        />
        <AgrementStatusBadge
          v-if="agrementCourant.statut"
          :statut="agrementCourant.statut"
          type="bo"
        />
      </div>
      <div v-if="organismeStore.organisme?.personneMorale?.raisonSociale">
        <dl class="fr-text--lg fr-pl-0">
          <dt>Organisme :</dt>
          <dd>
            {{ organismeStore.organisme?.personneMorale?.raisonSociale }}
          </dd>
        </dl>
      </div>
      <div v-if="agrementCourant?.regionObtention">
        <dl class="fr-text--lg fr-pl-0">
          <dt>Région :</dt>
          <dd>
            {{ agrementCourant.regionObtention }}
          </dd>
        </dl>
      </div>
      <div v-if="agrementCourant?.dateDepot">
        <dl class="fr-text--lg fr-pl-0">
          <dt>
            {{
              typeDepot === AGREMENT_TYPE_DEPOT.RENOUVELLEMENT
                ? "Date de la demande de renouvellement"
                : "Date de la première demande"
            }}
            :
          </dt>
          <dd>
            {{ formatFR(agrementCourant.dateDepot) }}
          </dd>
        </dl>
      </div>
      <div class="fr-mt-2w"></div>
    </div>

    <DsfrTabs
      v-model="selectedTabIndex"
      tab-list-name="Dossier d'agrément"
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
        <AgrementsDossier
          :init-organisme="organismeStore.organisme ?? {}"
          :init-agrement="agrementStore.agrementCourant ?? {}"
          :cdn-url="`${config.public.backendUrl}/documents/admin`"
          :first-agrement="typeDepot === AGREMENT_TYPE_DEPOT.PREMIER"
        ></AgrementsDossier>
        <AgrementsActionsStatut
          :cdn-url="`${config.public.backendUrl}/documents/admin`"
        ></AgrementsActionsStatut>
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="agrement-content-1"
        tab-id="agrement-tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <div class="tab-scroll">
          <AgrementDocuments
            :agrement-courant="agrementStore.agrementCourant ?? {}"
            :cdn-url="`${config.public.backendUrl}/documents/admin`"
          ></AgrementDocuments>
        </div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-2"
        tab-id="agrement-tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
        ><div class="tab-scroll">
          <Historique :history="agrementStore.history ?? []" />
        </div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-3"
        tab-id="agrement-tab-3"
        :selected="selectedTabIndex === 3"
        :asc="asc"
        ><div ref="messagerieScroll" class="tab-scroll">
          <AgrementsMessagerie :messages="messages" />
        </div>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup lang="ts">
import { useAgrementStore } from "~/stores/agrement";
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  Historique,
  AgrementDocuments,
  AgrementStatusBadge,
  AgrementTypeDepotBadge,
  useAgrementPageTitle,
} from "@vao/shared-ui";
import { useOrganismeStore } from "~/stores/organisme";
import { formatFR, AGREMENT_TYPE_DEPOT } from "@vao/shared-bridge";

const TAB_PAGE_TITLES = [
  "Dossier",
  "Documents",
  "Historique",
  "Messagerie",
] as const;

const organismeStore = useOrganismeStore();

const route = useRoute();
const agrementStore = useAgrementStore();
const messagerieScroll = ref<HTMLElement | null>(null);
const agrementId = computed(() => Number(route.params.agrementId));
const agrementCourant = computed(() => agrementStore.agrementCourant);
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

onMounted(async () => {
  if (agrementId.value) {
    await agrementStore.getAgrementById(agrementId.value);

    try {
      await agrementStore.getHistory(String(agrementId.value));
      log.i("Historique de l'agrément récupéré avec succès");
    } catch (error) {
      log.w("Erreur lors de la récupération de l'historique:", error);
    }

    try {
      await agrementStore.getMessages(String(agrementId.value));
      log.i("Messages de l'agrément récupérés avec succès");
    } catch (error) {
      log.w("Erreur lors de la récupération des messages:", error);
    }
  }
});

watch(
  () => agrementCourant.value?.organismeId,
  async (organismeId) => {
    if (organismeId) {
      await organismeStore.getOrganisme(organismeId);
    }
  },
  { immediate: true },
);

useHead({
  title: "Page agrément - Portail Administration | VAO",
  meta: [
    {
      name: "description",
      content: "Page de gestion des agréments.",
    },
  ],
});

const links = computed(() => [
  {
    to: "/agrements/liste",
    text: "Agréments",
  },
  {
    text: `Agrément n° ${agrementCourant.value?.numero || ""}`,
  },
]);

const log = logger("pages/agrements/");

const queryIndex = route.query.defaultTabIndex;

const initialSelectedIndex =
  typeof queryIndex === "string" ? parseInt(queryIndex, 10) : 0;

const selectedTabIndex = ref(initialSelectedIndex);
const config = useRuntimeConfig();

useAgrementPageTitle({
  agrementNumero: computed(() => agrementCourant.value?.numero),
  agrementLabel: "Mon agrément",
  appSuffix: "Portail Administration | VAO",
  selectedTabIndex,
  tabPageTitles: TAB_PAGE_TITLES,
});

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
    await agrementStore.patchMessagesAsRead(String(agrementId.value));
    await agrementStore.getMessages(String(agrementId.value));
  },
};

const selectTab = async (idx: Tab) => {
  asc.value = selectedTabIndex.value < idx;
  tabActions[idx]();
};

const unreadCount = computed(() => agrementStore.messagesUnreadCount ?? 0);

const typeDepot = computed(() =>
  organismeStore.organisme?.agrement?.numero
    ? AGREMENT_TYPE_DEPOT.RENOUVELLEMENT
    : AGREMENT_TYPE_DEPOT.PREMIER,
);

const tabTitles = computed(() => [
  {
    title: "Dossier",
    tabId: "agrement-tab-0",
    panelId: "agrement-content-0",
  },
  {
    title: "Documents",
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
</script>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
}
dl {
  display: grid;
  grid-template-columns: 220px 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;
  margin: 0;
}
dd {
  padding-left: 0;
}
dt {
  font-weight: bold;
}

.tab-scroll {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
  padding-bottom: 4rem;
}
/* fix un problème de hauteur au niveau des tabs > le dsfr injecte une classe --tabs-height pour calculer la hauteur du tab, mais cette valeur n'est pas correcte. On force donc la hauteur du tab à auto pour que la hauteur corresponde à son contenu */
.fr-tabs {
  height: auto !important;
}

.fr-tabs__panel {
  height: auto !important;
}
</style>
