<template>
  <div>
    <DsfrSideMenu heading-title="">
      <DsfrSideMenuList
        id="menuLateral"
        :menu-items="sommaireOptionsToDisplay"
      />
    </DsfrSideMenu>
  </div>
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

const sommaireOptions = ref([
  {
    id: 1,
    text: "1. Informations générales",
    to: isUpdate
      ? `/demande-sejour/informations-generales/${route.params.idDemande}`
      : "/demande-sejour/informations-generales",
  },
  {
    id: 2,
    text: "2. Informations sur les vacanciers",
    to: isUpdate
      ? `/demande-sejour/informations-vacanciers/${route.params.idDemande}`
      : "/demande-sejour/informations-vacanciers",
  },
  {
    id: 3,
    text: "3. Informations sur le personnel",
    to: isUpdate
      ? `/demande-sejour/informations-personnel/${route.params.idDemande}`
      : "/demande-sejour/informations-personnel",
  },
  {
    id: 4,
    text: "4. Projet de séjour",
    to: isUpdate
      ? `/demande-sejour/projet-sejour/${route.params.idDemande}`
      : "/demande-sejour/projet-sejour",
  },
  {
    id: 5,
    text: "5. Informations sur le transport",
    to: isUpdate
      ? `/demande-sejour/informations-transport/${route.params.idDemande}`
      : "/demande-sejour/informations-transport",
  },
  {
    id: 6,
    text: "6. Informations sanitaires",
    to: isUpdate
      ? `/demande-sejour/informations-sanitaires/${route.params.idDemande}`
      : "/demande-sejour/informations-sanitaires",
  },
  {
    id: 7,
    text: "7. Sélection des hébergements",
    to: isUpdate
      ? `/demande-sejour/hebergement/${route.params.idDemande}`
      : "/demande-sejour/hebergement",
  },
]);

const sommaireOptionsToDisplay = computed(() => {
  return sommaireOptions.value.map((s) => {
    return { ...s, active: s.id === props.activeId };
  });
});
</script>

<style scoped></style>
