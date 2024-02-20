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
  operateur: { type: Object, default: null, required: true },
});

const sommaireOptionsToDisplay = computed(() => {
  if (props.operateur.length === 0) {
    return [{ ...organismeMenus[0], active: true }];
  } else {
    return organismeMenus.map((s) => {
      return { ...s, active: s.id === props.activeId };
    });
  }
});
</script>

<style scoped></style>
