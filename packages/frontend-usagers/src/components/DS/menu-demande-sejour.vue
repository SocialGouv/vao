<template>
  <nav class="fr-sidemenu fr-sidemenu--sticky">
    <DsfrSideMenu heading-title="">
      <DsfrSideMenuList
        id="menuLateral"
        :menu-items="sommaireOptionsToDisplay"
      />
    </DsfrSideMenu>
  </nav>
</template>

<script setup>
const route = useRoute();
const props = defineProps({
  activeId: { type: Number, default: 1, required: false },
});
// const log = logger("pages/component/DS/menu-demande-sejour");
const isUpdate = computed(() => {
  return !!route.params.idDemande;
});

const sommaireOptions = computed(() => [
  {
    id: 1,
    text: "1. Informations générales",
    to: isUpdate.value
      ? `/demande-sejour/informations-generales/${route.params.idDemande}`
      : "/demande-sejour/informations-generales",
  },

  {
    id: 2,
    text: "2. Organisateurs du séjour",
    to: `/demande-sejour/organisateurs/${route.params.idDemande}`,
  },
  {
    id: 3,
    text: "3. Informations sur les vacanciers",
    to: `/demande-sejour/informations-vacanciers/${route.params.idDemande}`,
  },
  {
    id: 4,
    text: "4. Informations sur le personnel",
    to: `/demande-sejour/informations-personnel/${route.params.idDemande}`,
  },
  {
    id: 5,
    text: "5. Projet de séjour",
    to: `/demande-sejour/projet-sejour/${route.params.idDemande}`,
  },
  {
    id: 6,
    text: "6. Informations sur le transport",
    to: `/demande-sejour/informations-transport/${route.params.idDemande}`,
  },
  {
    id: 7,
    text: "7. Informations sanitaires",
    to: `/demande-sejour/informations-sanitaires/${route.params.idDemande}`,
  },
  {
    id: 8,
    text: "8. Sélection des hébergements",
    to: `/demande-sejour/hebergement/${route.params.idDemande}`,
  },
]);

const sommaireOptionsToDisplay = computed(() => {
  if (!isUpdate.value) {
    return [
      {
        id: 1,
        text: "1. Informations générales",
        to: "/demande-sejour/informations-generales",
        active: true,
      },
    ];
  } else {
    return sommaireOptions.value.map((s) => {
      return { ...s, active: s.id === props.activeId };
    });
  }
});
</script>

<style scoped></style>
