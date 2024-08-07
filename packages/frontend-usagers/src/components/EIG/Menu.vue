<template>
  <DsfrSideMenu heading-title="">
    <DsfrSideMenuList
      id="eig-menu-list"
      :menu-items="sommaireOptionsToDisplay"
    />
  </DsfrSideMenu>
</template>

<script setup>
const props = defineProps({
  activeId: { type: String, default: eigMenu[0].id, required: false },
  eigId: { type: Number, required: false, default: null },
});

const menus = eigMenu.map((menu) => {
  return {
    ...menu,
    to: { hash: "#" + menu.id },
  };
});

const sommaireOptionsToDisplay = computed(() => {
  if (!props.eigId) {
    return [{ ...menus[0], active: true }];
  } else {
    return menus.map((s) => {
      return { ...s, active: s.id === props.activeId };
    });
  }
});
</script>

<style scoped></style>
