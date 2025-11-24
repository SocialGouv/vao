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
  activeId: { type: String, default: "agrement-coordonnees", required: false },
});

const emit = defineEmits(["select"]);

const menus = [
  {
    id: "agrement-coordonnees",
    text: "Coordonnées à vérifier",
    to: { hash: "#agrement-coordonnees" },
  },
  {
    id: "agrement-dossier",
    text: "Dossier de candidature",
    to: { hash: "#agrement-dossier" },
  },
  {
    id: "agrement-bilan",
    text: "Bilan des 4 années précédentes",
    to: { hash: "#agrement-bilan" },
  },
  {
    id: "projets",
    text: "Projets de séjours envisagés pour les 12 prochains mois",
    to: { hash: "#agrement-projets" },
  },
  {
    id: "agrement-synthese",
    text: "Synthèse",
    to: { hash: "#agrement-synthese" },
  },
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
