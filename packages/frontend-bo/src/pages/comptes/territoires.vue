<template>
  <div class="fr-container">
    <h1>{{ user.territoire }}: {{ user.territoireCode }}</h1>

    <ComptesTerritoiresInformations :data="data" />
  </div>
</template>

<script setup>
const userStore = useUserStore();

const user = computed(() => userStore.user);

const data = [
  { label: "Nom responsable", value: "tutu" },
  { label: "Numéro de téléphone du service", value: "01.01.01.01.01" },
  { label: "Adresse email fonctionnelle VAO", value: "tutu@tutu.fr" },
  { label: "Nom responsable", value: "tutu" },
];
</script>
