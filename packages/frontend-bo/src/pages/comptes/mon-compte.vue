<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <Compte v-if="isCallDone" :user="currentUser" />
  </div>
</template>

<script setup>
import Compte from "~/components/user/Compte.vue";

const log = logger("pages/mon-compte/");
const usersStore = useUserStore();
const currentUser = computed(() => usersStore.user);

const isCallDone = ref(false);

definePageMeta({
  middleware: ["is-connected"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Mon compte",
  },
];

onMounted(async () => {
  log.i("Mounted - IN");
  isCallDone.value = true;
  log.i("Mounted - DONE");
});
</script>

<style lang="scss" scoped></style>
