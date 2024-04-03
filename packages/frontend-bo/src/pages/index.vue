<template>
  <h1 >
    Bienvenue {{ user.prenom }} {{ user.nom }} 
  </h1>
</template>

<script setup>

import { useUserStore } from "~/stores/user";

const usersStore = useUserStore();
const user = usersStore.user
definePageMeta({
  layout: "default",
  middleware: ["is-connected"],
});
</script>
