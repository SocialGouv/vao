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
  activeId: { type: String, default: organismeMenus[0].id, required: false },
  organisme: { type: Object, required: true },
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
    return menus.map((s) => {
      return { ...s, active: s.id === props.activeId };
    });
  }
});
</script>

<style scoped></style>
