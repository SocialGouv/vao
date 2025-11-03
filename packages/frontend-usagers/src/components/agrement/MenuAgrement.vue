<template>
  <DsfrSideMenu heading-title="">
    <DsfrSideMenuList
      id="agrement-menu-list"
      :menu-items="sommaireOptionsToDisplay"
      @select="onSelect"
    />
  </DsfrSideMenu>
</template>

<script setup>
const props = defineProps({
  activeId: { type: String, default: "coordonnees", required: false },
});

const emit = defineEmits(["select"]);

const menus = [
  {
    id: "coordonnees",
    text: "Coordonnées à vérifier",
    to: { hash: "#coordonnees" },
  },
  { id: "dossier", text: "Dossier de candidature", to: { hash: "#dossier" } },
  {
    id: "bilan",
    text: "Bilan des 4 années précédentes",
    to: { hash: "#bilan" },
  },
  {
    id: "projets",
    text: "Projets de séjours envisagés pour les 12 prochains mois",
    to: { hash: "#projets" },
  },
  { id: "synthese", text: "Synthèse", to: { hash: "#synthese" } },
];

const sommaireOptionsToDisplay = computed(() =>
  menus.map((menu) => ({
    ...menu,
    active: menu.id === props.activeId,
  })),
);

function onSelect(idx) {
  emit("select", menus[idx].id);
}
</script>
