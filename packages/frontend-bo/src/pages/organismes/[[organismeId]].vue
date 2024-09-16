<template>
  <div>
    <h4>Organisme</h4>

    <DsfrTabs
      v-model="selectedTabIndex"
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="0"
      @update:model-value="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <div
          v-if="
            organismeStore.organisme?.typeOrganisme ===
            organisme.type.PERSONNE_MORALE
          "
        >
          <UtilsDisplayInput
            :value="organismeStore.organisme.complet"
            :input="displayInput.IPersonneMorale['complet']"
          />
          <UtilsDisplayInput
            :value="organismeStore.organisme.createdAt"
            :input="displayInput.IPersonneMorale['createdAt']"
          />
          <UtilsDisplayInput
            :value="organismeStore.organisme.editedAt"
            :input="displayInput.IPersonneMorale['editedAt']"
          />
          <UtilsDisplayInput
            v-for="entry in Object.keys(displayInput.IPersonneMorale)"
            :key="`organisme-${entry}`"
            :value="organismeStore.organisme.personneMorale[entry]"
            :input="displayInput.IPersonneMorale[entry]"
          />
          <h4>Responsable du séjour</h4>
          <UtilsDisplayInput
            v-for="entry in Object.keys(displayInput.IResponsableSejour)"
            :key="`organisme-responsableSejour-${entry}`"
            :value="
              organismeStore.organisme.personneMorale.responsableSejour[entry]
            "
            :input="displayInput.IResponsableSejour[entry]"
          />
          <DsfrTable
            title="Liste des comptes avec le numéro de siret de l'organisme"
            :headers="['Nom', 'Prenom', 'Email', 'Date inscription']"
            :rows="usersWithSiret"
          ></DsfrTable>
        </div>
        <div
          v-if="
            organismeStore.organisme?.typeOrganisme ===
            organisme.type.PERSONNE_PHYSIQUE
          "
        >
          <UtilsDisplayInput
            :value="organismeStore.organisme.complet"
            :input="displayInput.IPersonneMorale['complet']"
          />
          <UtilsDisplayInput
            :value="organismeStore.organisme.createdAt"
            :input="displayInput.IPersonneMorale['createdAt']"
          />
          <UtilsDisplayInput
            :value="organismeStore.organisme.editedAt"
            :input="displayInput.IPersonneMorale['editedAt']"
          />
          <UtilsDisplayInput
            v-for="entry in Object.keys(displayInput.IPersonnePhysique)"
            :key="`organisme-${entry}`"
            :value="organismeStore.organisme.personnePhysique[entry]"
            :input="displayInput.IPersonnePhysique[entry]"
          />
        </div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <DemandesSejourListe
          v-if="organismeName"
          :organisme="organismeName"
        ></DemandesSejourListe>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>
<script setup>
import { useOrganismeStore } from "~/stores/organisme";
import dayjs from "dayjs";

const organismeStore = useOrganismeStore();
const userStore = useUserStore();
const route = useRoute();
const log = logger("pages/organismes/[[organismeId]]");
definePageMeta({
  middleware: ["is-connected"],
});

const asc = ref(true);
const selectedTabIndex = ref(0);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
};

const usersWithSiret = computed(() =>
  userStore.usersFO.map((user) => [
    user.nom,
    user.prenom,
    user.email,
    dayjs(user.dateCreation).format("DD/MM/YYYY HH:MM"),
  ]),
);

const tabTitles = [
  {
    title: "Informations",
    tabId: "tab-0",
    panelId: "tab-content-0",
  },
  {
    title: "Déclarations de séjour",
    tabId: "tab-1",
    panelId: "tab-content-1",
  },
];

const organismeName = computed(() => {
  if (organismeStore.organisme) {
    return organismeStore.organisme.typeOrganisme ===
      organisme.type.PERSONNE_MORALE
      ? (organismeStore.organisme.personneMorale.raisonSociale ?? "")
      : (organismeStore.organisme.personnePhysique.nomUsage ?? "");
  }
});

onMounted(async () => {
  try {
    await organismeStore.getOrganisme(route.params.organismeId);
    if (organismeStore.organisme?.personneMorale) {
      await userStore.fetchUsersOrganisme({
        search: { siret: organismeStore.organisme.personneMorale.siret },
      });
    }
  } catch (e) {
    if (e.response?.status === 403) {
      log.w("not authorized for this user", e);
      navigateTo("/organismes");
    }
    throw e;
  }
});
</script>
