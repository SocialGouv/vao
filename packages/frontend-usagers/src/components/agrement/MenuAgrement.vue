<template>
  <DsfrSideMenu heading-title="">
    <DsfrSideMenuList
      id="agrement-menu-list"
      :menu-items="sommaireOptionsToDisplay"
    />
  </DsfrSideMenu>
</template>

<script setup>
const sommaireOptionsToDisplay = ref([
  { text: "Coordonnées à vérifier", to: "/", active: true },
  { text: "Dossier de candidature", to: "/" },
  { text: "Bilan des 4 années précédentes", to: "/" },
  { text: "Projets de séjours envisagés pour les 12 prochains mois", to: "/" },
  { text: "Synthèse", to: "/" },
]);
</script>

<style scoped></style>
