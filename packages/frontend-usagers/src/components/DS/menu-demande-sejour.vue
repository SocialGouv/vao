<template>
  <DsfrSideMenu heading-title="">
    <DsfrSideMenuList
      id="declaraton-sejour-menu-list"
      :menu-items="sommaireOptionsToDisplay"
    />
  </DsfrSideMenu>
</template>

<script setup>
const props = defineProps({
  activeId: {
    type: String,
    default: demandeSejourMenus[0].id,
    required: false,
  },
  demande: { type: Object, default: () => ({}) },
});

const demandeSejourStore = useDemandeSejourStore();
const declarationStatut = computed(() => {
  return demandeSejourStore.demandeCourante.statut;
});

const menus = demandeSejourMenus
  .filter((menu) => !menu.statutsMasques.includes(declarationStatut.value))
  .map((menu) => {
    return {
      ...menu,
      to: { hash: "#" + menu.id },
    };
  });

const sommaireOptionsToDisplay = computed(() => {
  if (!props.demande.id) {
    return [{ ...menus[0], active: true }];
  } else {
    return menus.map((s) => {
      return { ...s, active: s.id === props.activeId };
    });
  }
});
</script>

<style scoped></style>
