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
const props = defineProps({
  activeId: { type: String, default: organismeMenus[0].id, required: false },
  organisme: { type: Object, required: true },
});

const isSiege = computed(() => {
  return (
    !props.organisme ||
    props.organisme.typeOrganisme === "personne_physique" ||
    props.organisme.personneMorale?.siegeSocial === true
  );
});

const menus = organismeMenus.map((menu) => {
  return {
    ...menu,
    to: { hash: "#" + menu.id },
  };
});

const sommaireOptionsToDisplay = computed(() => {
  if (!props.organisme) {
    return [{ ...menus[0], active: true }];
  } else {
    return menus
      .filter((m) => m.displayForEtabSecondaire || isSiege.value)
      .map((s) => {
        return { ...s, active: s.id === props.activeId };
      });
  }
});
</script>

<style scoped></style>
