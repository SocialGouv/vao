<template>
  <nav class="fr-sidemenu fr-sidemenu--sticky">
    <DsfrSideMenu heading-title="Fiche organisme">
      <DsfrSideMenuList
        id="organisme-menu-list"
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
  if (!props.organisme.organismeId) {
    return [{ ...menus[0], active: true }];
  } else {
    return menus
      .filter((m) => isSiege.value || m.displayForEtabSecondaire)
      .map((s) => {
        return { ...s, active: s.id === props.activeId };
      });
  }
});
</script>

<style scoped></style>
