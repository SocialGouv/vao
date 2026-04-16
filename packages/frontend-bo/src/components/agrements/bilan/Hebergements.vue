<template>
  <div>
    <DsfrDataTableV2Wrapper
      v-model:limit="limit"
      v-model:offset="offset"
      :columns="columns"
      :data="props.hebergements || []"
      :total="props.hebergements?.length || 0"
      :total-pages="totalPages"
      row-id="nomHebergement"
    >
      <template #cell-mois="{ row }">
        {{ row.mois ? formatMois(row.mois) : "" }}
      </template>
    </DsfrDataTableV2Wrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Columns, NestedKeys } from "@vao/shared-ui";

import {
  DsfrDataTableV2Wrapper,
  usePagination,
  columnsTable,
} from "@vao/shared-ui";
import type { BilanHebergementDto } from "@vao/shared-bridge";
const route = useRoute();

const props = defineProps<{
  hebergements: BilanHebergementDto[] | null;
}>();
const optionType = columnsTable.optionType;

const { query } = route;

const defs: [string, string, string][] = [
  ["nomHebergement", "Nom de l'hébergement", optionType.NONE],
  ["adresse", "Adresse", optionType.NONE],
  ["mois", "Période", optionType.NONE],
  ["nbJours", "Nombre de jours", optionType.NONE],
];

const queryString: Record<string, string> = Object.fromEntries(
  Object.entries(query).map(([key, value]) => [
    key,
    Array.isArray(value)
      ? value.filter((v) => v != null).join(",")
      : value == null
        ? ""
        : String(value),
  ]),
);

const columns = columnsTable.buildColumns(
  defs,
) as unknown as Columns<BilanHebergementDto>;

const sortableColumns: NestedKeys<BilanHebergementDto>[] = [];

const { limit, offset } = usePagination<BilanHebergementDto>(
  {
    limit: queryString.limit,
    offset: queryString.offset,
    sort: queryString.sort,
    sortDirection: queryString.sortDirection as "asc" | "desc" | "",
  },
  sortableColumns,
);

const ITEMS_PER_PAGE = 10;
const currentPage = ref(0);

const totalPages = computed(() =>
  Math.ceil((props.hebergements?.length || 0) / ITEMS_PER_PAGE),
);

const paginatedHebergements = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  return (props.hebergements || []).slice(start, start + ITEMS_PER_PAGE);
});

function formatMois(mois: number[] | null): string {
  if (!mois || mois.length === 0) return "-";

  const moisLabels = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  return mois.map((m) => moisLabels[m - 1] || m).join(", ");
}
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr;
  gap: 0.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.row {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pagination-center {
  margin-top: 1rem;
}

button.active {
  font-weight: bold;
}
</style>
