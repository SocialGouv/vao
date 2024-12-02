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
      <DsfrTabContent panel-id="tab-content-0" tab-id="tab-0">
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
      <DsfrTabContent panel-id="tab-content-1" tab-id="tab-1">
        <div v-if="organismeStore.organisme?.agrement">
          <UtilsDisplayInput
            :value="organismeStore.organisme.agrement.numero"
            :input="displayInput.IAgrement.numero"
          />
          <UtilsDisplayInput
            :value="organismeStore.organisme.agrement.dateObtention"
            :input="displayInput.IAgrement.dateObtention"
          />
          <UtilsDisplayInput
            :value="organismeStore.organisme.agrement.regionObtention"
            :input="displayInput.IAgrement.regionObtention"
          >
            <template #default="{ value }">
              {{ regionDisplay(value) }}
            </template>
          </UtilsDisplayInput>
          <UtilsDisplayInput
            :value="organismeStore.organisme.agrement.regionObtention"
            :input="displayInput.IAgrement.regionObtention"
          >
            <template #default="{ value }">
              {{ regionDisplay(value) }}
            </template>
          </UtilsDisplayInput>
          <UtilsDisplayInput
            :value="organismeStore.organisme.agrement.file"
            :input="displayInput.IAgrement.file"
          >
            <template #default="{ value }">
              <a
                class="file-link"
                :href="`${config.public.backendUrl}/documents/admin/${value.uuid}`"
              >
                {{ value.name }}
              </a>
              créé le {{ formatDate(value.createdAt) }}
            </template>
          </UtilsDisplayInput>
        </div>
      </DsfrTabContent>
      <DsfrTabContent panel-id="tab-content-2" tab-id="tab-2">
        <DemandesSejourListe
          v-if="organismeName"
          display="Organisme"
          :organisme="organismeName"
          :organisme-id="route.params.organismeId"
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
const regionStore = useRegionStore();
const route = useRoute();
const config = useRuntimeConfig();
const log = logger("pages/organismes/[[organismeId]]");
definePageMeta({
  middleware: ["is-connected"],
});

regionStore.fetch();

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

const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

const regionDisplay = (region) =>
  regionStore.regions.find(({ value }) => value === region)?.text;

const tabTitles = [
  {
    title: "Informations",
    tabId: "tab-0",
    panelId: "tab-content-0",
  },
  {
    title: "Agrément",
    tabId: "tab-1",
    panelId: "tab-content-1",
  },
  {
    title: "Déclarations de séjour",
    tabId: "tab-2",
    panelId: "tab-content-2",
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
    if (
      organismeStore.organisme?.typeOrganisme === organisme.type.PERSONNE_MORALE
    ) {
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

<style scoped>
.file-link {
  margin-right: 2rem;
}
</style>
