<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div v-if="organismeStore.organisme?.typeOrganisme === 'personne_morale'">
      <h4>Organisme</h4>
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
    <div v-if="organismeStore.organisme?.typeOrganisme === 'personne_physique'">
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.IPersonnePhysique)"
        :key="`organisme-${entry}`"
        :value="organismeStore.organisme.personnePhysique[entry]"
        :input="displayInput.IPersonnePhysique[entry]"
      />
    </div>
  </div>
</template>

<script setup>
import { useOrganismeStore } from "~/stores/organisme";

const organismeStore = useOrganismeStore();
const route = useRoute();

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/organismes/liste",
    text: "Organismes",
  },
  {
    text: route.params.organismeId,
  },
];

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

onMounted(async () => {
  try {
    await organismeStore.getOrganisme(route.params.organismeId);
    // if (!organismeStore.organisme) {
    //   navigateTo("/organismes/liste ");
    // }
  } catch (e) {
    navigateTo("/organismes/liste ");
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
