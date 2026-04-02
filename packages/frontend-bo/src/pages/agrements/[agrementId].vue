<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div v-if="agrementCourant">
      <div class="title-container fr-mb-4v">
        <h1 class="fr-mb-0">Agrément n° {{ agrementCourant.numero }}</h1>
        <DemandeStatusBadge
          v-if="agrementCourant.statut"
          :statut="agrementCourant.statut"
          type="bo"
        />
      </div>
      <p v-if="organismeStore.organisme?.personneMorale?.raisonSociale">
        <b>Organisme :</b>
        {{ organismeStore.organisme.personneMorale.raisonSociale }}
      </p>
      <p v-if="agrementCourant.regionObtention">
        <b>Région :</b> {{ agrementCourant.regionObtention }}
      </p>
      <p v-if="agrementCourant.dateDepot">
        <b>Date de la demande de renouvellement :</b>
        {{ formatFR(agrementCourant.dateDepot) }}
      </p>
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
        <h1>Dossier</h1>
        <AgrementsDossier
          :init-organisme="organismeStore.organisme ?? {}"
          :init-agrement="agrementStore.agrementCourant ?? {}"
          :modifiable="false"
          cdn-url="sqs"
        ></AgrementsDossier>
        <AgrementsActionsStatut
          :cdn-url="`${config.public.backendUrl}/documents/`"
        ></AgrementsActionsStatut>
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
        <Historique :history="agrementStore.history ?? []" />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="agrement-content-3"
        tab-id="agrement-tab-3"
        :selected="selectedTabIndex === 3"
        :asc="asc"
      >
        <AgrementsMessagerie :messages="messages" />
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup lang="ts">
import { useAgrementStore } from "~/stores/agrement";
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  DemandeStatusBadge,
  Historique,
  AgrementDocuments,
} from "@vao/shared-ui";
import { useOrganismeStore } from "~/stores/organisme";
import { formatFR } from "@vao/shared-bridge";

const organismeStore = useOrganismeStore();

const route = useRoute();
const agrementStore = useAgrementStore();

const agrementId = computed(() => Number(route.params.agrementId));
const agrementCourant = computed(() => agrementStore.agrementCourant);

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

const messages = computed(() => agrementStore.messages ?? []);

const unreadCount = computed(() => agrementStore.messagesUnreadCount ?? 0);

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
</style>
