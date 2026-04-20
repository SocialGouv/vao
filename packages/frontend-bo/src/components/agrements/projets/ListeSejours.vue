<template>
  <div>
    <DsfrDataTableV2Wrapper
      v-model:limit="limit"
      v-model:offset="offset"
      :columns="columns"
      :data="props.initialSejours || []"
      :total="props.initialSejours?.length || 0"
      row-id="nomHebergement"
    >
      <template #cell-mois="{ row }">
        {{ row.mois ? parseIntToMonthFR(row.mois) : "" }}
      </template>
      <template #cell-adresse="{ row }">
        {{ row.adresse.label || "" }}
      </template>
    </DsfrDataTableV2Wrapper>
  </div>
</template>

<script setup lang="ts">
import type { Columns, NestedKeys } from "@vao/shared-ui";

import {
  DsfrDataTableV2Wrapper,
  usePagination,
  columnsTable,
} from "@vao/shared-ui";
import type { BilanHebergementDto } from "@vao/shared-bridge";
import { parseIntToMonthFR } from "@vao/shared-bridge";

const route = useRoute();

const optionType = columnsTable.optionType;

const { query } = route;

const defs: [string, string, string][] = [
  ["nomHebergement", "Nom de l'hébergement", optionType.NONE],
  ["adresse", "Adresse", optionType.NONE],
  ["mois", "Période", optionType.NONE],
  ["nbVacanciers", "Nombre de vacanciers", optionType.NONE],
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

interface Sejour {
  [key: string]: any;
}

const props = defineProps({
  agrementId: { type: String, required: true },
  initialSejours: {
    type: Array as any as () => Sejour[],
    required: false,
    default: () => [],
  },
  statut: { type: String, required: false, default: "BROUILLON" },
});
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  gap: 0 0.5rem;
  margin-bottom: 1rem;
}
.add-btn {
  width: 100%;
  justify-content: center;
}
.bg-light-blue {
  background: rgba(227, 227, 253, 0.4);
}
</style>
