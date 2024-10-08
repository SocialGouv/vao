<template>
  <Dsfr-data-table-v2
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :table-title="props.title"
    :titles="titles"
    row-id="id"
    is-sortable
    is-bordered
    :data="users"
  >
    <template #statut="{ cell }">
      {{ cell }}
    </template>
  </Dsfr-data-table-v2>
</template>

<script setup lang="ts">
import { DsfrDataTableV2 } from "@vao/shared";
import type {
  NestedKeys,
  Titles,
} from "@vao/shared/src/types/DsfrDataTableV2.type";

const props = withDefaults(
  defineProps<{
    title: string;
    territoireCode?: string;
  }>(),
  {
    territoireCode: "FRA",
  },
);

type User = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  statut: string;
};

// const selected = ref<User["id"][]>([]);
const sort = ref<NestedKeys<User>>("nom");
const sortDirection = ref<"asc" | "desc">("asc");

const titles: Titles<User> = [
  {
    key: "nom",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "prenom",
    label: "Prenom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "email",
    label: "Courriel",
    options: {
      isSortable: true,
    },
  },
  {
    key: "statut",
    label: "Statut",
    options: {
      isSortable: true,
    },
  },
];

const users = [] as User[];
</script>
