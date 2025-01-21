<template>
  <DsfrSideMenu heading-title="Fiche organisateur">
    <DsfrSideMenuList
      id="organisme-menu-list"
      :menu-items="sommaireOptionsToDisplay"
    />
  </DsfrSideMenu>
</template>

<script setup>
const props = defineProps({
  activeId: { type: String, default: "info-generales", required: false },
  organisme: { type: Object, required: true },
});

const organismeStore = useOrganismeStore();

const menus = organismeMenus.menus(organismeStore.isSiegeSocial).map((menu) => {
  return {
    ...menu,
    to: { hash: "#" + menu.id },
  };
});

const sommaireOptionsToDisplay = computed(() => {
  if (!props.organisme.organismeId) {
    return [{ ...menus[0], active: true }];
  } else {
    return menus.reduce((accMenus, currentMenu) => {
      if (currentMenu.id !== "etablissement-secondaires") {
        accMenus.push({
          ...currentMenu,
          active: currentMenu.id === props.activeId,
        });
      } else {
        if (
          props.organisme.personneMorale.siegeSocial &&
          props.organisme.typeOrganisme === "personne_morale"
        ) {
          accMenus.push({
            ...currentMenu,
            active: currentMenu.id === props.activeId,
          });
        }
      }

      return accMenus;
    }, []);
  }
});
</script>

<style scoped></style>
