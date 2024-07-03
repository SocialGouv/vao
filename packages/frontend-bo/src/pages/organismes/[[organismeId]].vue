<template>
  <div>
    <h4>Organisme</h4>

    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="0"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <div
          v-if="organismeStore.organisme?.typeOrganisme === 'personne_morale'"
        >
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
        </div>
        <div
          v-if="organismeStore.organisme?.typeOrganisme === 'personne_physique'"
        >
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
const organismeStore = useOrganismeStore();
const route = useRoute();
const log = logger("pages/organismes/[[organismeId]]");
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

const asc = ref(true);
const selectedTabIndex = ref(0);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
  if (idx === 2 && !historique.value) {
    execute();
  }
};

const tabTitles = [
  { title: "Informations" },
  { title: "Déclarations de séjour" },
];

const organismeName = computed(() => {
  if (organismeStore.organisme) {
    return organismeStore.organisme.typeOrganisme === "personne_morale"
      ? organismeStore.organisme.personneMorale.raisonSociale ?? ""
      : organismeStore.organisme.personnePhysique.nomUsage ?? "";
  }
});

onMounted(async () => {
  try {
    await organismeStore.getOrganisme(route.params.organismeId);
  } catch (e) {
    log.w("not authorized for this user", e);
    navigateTo("/organismes");
  }
});
</script>
<style scoped>
.header {
  padding: 1em 0em;
}
.container {
  display: flex;
  margin-top: 1rem;
  margin-bottom: 1rem;
  justify-content: right;
  gap: 1rem;
}
</style>
