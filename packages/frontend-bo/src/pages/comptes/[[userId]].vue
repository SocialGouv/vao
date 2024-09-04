<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <Compte v-if="isCallDone" :user="selectedUser" />
  </div>
</template>

<script setup>
import Compte from "~/components/user/Compte.vue";

const route = useRoute();
const log = logger("pages/comptes/");
const usersStore = useUserStore();
const selectedUser = computed(() => usersStore.userSelected);
const isCallDone = ref(false);

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

const userId = route.params.userId;

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/comptes/liste",
    text: "Comptes",
  },
  {
    text: "Création",
  },
];

onMounted(async () => {
  log.i("Mounted - IN");
  if (userId) {
    // Chargement des données à partir du store
    await usersStore.getUser(userId);
    isCallDone.value = true;
  } else {
    usersStore.userSelected = {};
    isCallDone.value = true;
  }
  log.i("Mounted - DONE");
});
</script>