<template>
  <h1>Bienvenue {{ user.prenom }} {{ user.nom }}</h1>
</template>

<script setup>
const usersStore = useUserStore();
const user = usersStore.user;
definePageMeta({
  layout: "default",
  middleware: ["is-connected"],
});

onMounted(() => {
  document.querySelector("#header").focus();
});
</script>
