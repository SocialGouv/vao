<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des territoires</h1>
    <TableFull
      :headers="headers"
      title=""
      :data="territoireStore.territoires ?? []"
    />
  </div>
</template>

<script setup>
import { TableFull } from "@vao/shared";

const DsfrButtonGroup = resolveComponent("DsfrButtonGroup");

definePageMeta({
  middleware: ["is-connected"],
});

const territoireStore = useTerritoireStore();
const userStore = useUserStore();

territoireStore.fetch();

const headers = [
  {
    column: "text",
    text: "Libellé",
    sort: true,
  },
  {
    column: "typeTerritoire",
    text: "Département/Région",
    sort: true,
    format: (item) =>
      item.typeTerritoire === "DEP" ? "Département" : "Région",
  },
  {
    column: "nbUsersBO",
    text: "Contacts",
    sort: false,
  },
  {
    column: "value",
    text: "Code",
    sort: true,
  },
  {
    column: "correspVaoNom",
    text: "Référent VAO",
    sort: true,
  },
  {
    column: "actions",
    component: (row) => {
      return {
        component: DsfrButtonGroup,
        align: "center",
        size: "md",
        inline: true,
        buttons: [
          {
            label: ["FRA", row.value, row.parent].includes(
              userStore.user.territoireCode,
            )
              ? "Editer la fiche territoire"
              : "Consulter la fiche territoire",
            iconOnly: true,
            icon: ["FRA", row.value, row.parent].includes(
              userStore.user.territoireCode,
            )
              ? "fr-icon-edit-fill"
              : "fr-icon-eye-fill",
            onClick: () => {
              navigateTo(`/territoires/${row.territoireId}`);
            },
          },
        ],
      };
    },
    text: "Actions",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>
