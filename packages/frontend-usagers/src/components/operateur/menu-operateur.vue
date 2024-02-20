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
  operateur: { type: Object, default: null, required: true },
});
// const log = logger("pages/component/operateur/menu-operateur");
const isUpdate = computed(() => {
  return !!route.params.idOperateur;
});

const sommaireOptions = computed(() => [
  {
    id: "1",
    text: "Renseignements généraux",
    to: isUpdate.value
      ? `/operateur/${route.params.idOperateur}#generales`
      : "/operateur/#1",
  },
  {
    id: "2",
    text: "Agrément",
    to: `/operateur/${route.params.idOperateur}#agrement`,
  },
  {
    id: "3",
    text: "Protocoles transport",
    to: `/operateur/${route.params.idOperateur}#transport`,
  },
  {
    id: "4",
    text: "Protocoles sanitaires",
    to: `/operateur/${route.params.idOperateur}#sanitaire`,
  },
  {
    id: "5",
    text: "Organisateurs",
    to: `/operateur/${route.params.idOperateur}#organisateurs`,
  },
  {
    id: "6",
    text: "Synthèse",
    to: `/operateur/${route.params.idOperateur}#synthese`,
  },
]);

const sommaireOptionsToDisplay = computed(() => {
  if (props.operateur.length === 0) {
    return [
      {
        id: 1,
        text: "1. Renseignements généraux",
        to: "/operateur",
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
