<template>
  <AgrementsFilters
    v-model:name="name"
    v-model:siret="siret"
    v-model:numero-agrement="numeroAgrement"
    v-model:statut="statut"
    @filters-update="() => updateData(true)"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :columns="columns"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="id"
    is-sortable
    @update-data="() => updateData()"
  >
    <template #cell-name="{ row }">
      {{
        row.organisme?.typeOrganisme === "personne_morale"
          ? row.organisme?.personneMorale?.raisonSociale
          : row.organisme?.personnePhysique?.nomUsage
      }}
    </template>

    <template #cell-dateDepot="{ row }">
      {{ row.dateDepot ? formatFR(new Date(row.dateDepot)) : "" }}
    </template>

    <template #cell-siret="{ row }">
      {{
        row.organisme?.typeOrganisme === "personne_morale"
          ? row.organisme?.personneMorale?.siret
          : row.organisme?.personnePhysique?.siret
      }}
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="`/agrements/${String(row.id)}`"
        title="Naviguer vers l'agrément"
        class="no-background-image"
      >
        <DsfrButton
          icon="ri:arrow-right-s-line"
          icon-only
          primary
          size="small"
          type="button"
        />
      </NuxtLink>
    </template>
  </DsfrDataTableV2Wrapper>
</template>

<script setup lang="ts">
import {
  DsfrDataTableV2Wrapper,
  isValidParams,
  usePagination,
  columnsTable,
} from "@vao/shared-ui";

import type { AgrementDto, OrganismeDto } from "@vao/shared-bridge";
import { formatFR } from "@vao/shared-bridge";
import type { Columns, NestedKeys } from "@vao/shared-ui";
import { useAgrementStore } from "~/stores/agrement";

export type AgrementWithOrganismeDto = AgrementDto & {
  organisme: OrganismeDto;
};

type CellSlotProps = {
  row: AgrementWithOrganismeDto;
};

defineSlots<{
  "cell-name": (props: CellSlotProps) => any;
  "cell-dateDepot": (props: CellSlotProps) => any;
  "cell-siret": (props: CellSlotProps) => any;
  "cell-custom:edit": (props: CellSlotProps) => any;
}>();

const optionType = columnsTable.optionType;
const agrementStore = useAgrementStore();

const route = useRoute();

const data = computed<AgrementWithOrganismeDto[]>(
  () => agrementStore.agrements ?? [],
);
const total = computed<number>(() => agrementStore.agrementsTotal ?? 0);

const { query } = route;

// Convert LocationQuery to Record<string, string>
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

const defs = [
  ["name", "Nom", optionType.SORTABLE],
  ["siret", "Siret", optionType.SORTABLE],
  ["numero", "Agrément", optionType.SORTABLE],
  ["statut", "Statut agrément", optionType.SORTABLE],
  ["dateDepot", "Date de la demande", optionType.SORTABLE],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];
const columns: Columns<AgrementWithOrganismeDto> =
  columnsTable.buildColumns(defs);

const title = computed<string>(
  () => `Liste des Agréments (${agrementStore.agrementsTotal ?? 0})`,
);

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
) as NestedKeys<AgrementWithOrganismeDto>[];

const name = ref<string>(String(query.name ?? ""));
const numeroAgrement = ref<string>(String(query.numeroAgrement ?? ""));
const siret = ref<string>(String(query.siret ?? ""));
const statut = ref<string>(String(query.statut ?? ""));

const { limit, offset, sort, sortDirection } =
  usePagination<AgrementWithOrganismeDto>(
    {
      limit: queryString.limit,
      offset: queryString.offset,
      sort: queryString.sort,
      sortDirection: queryString.sortDirection as "asc" | "desc" | "",
    },
    sortableColumns,
  );

const getSearchParams = () => ({
  ...(isValidParams(name.value) ? { name: name.value } : {}),
  ...(isValidParams(numeroAgrement.value)
    ? { numero: numeroAgrement.value }
    : {}),
  ...(isValidParams(siret.value) ? { siret: siret.value } : {}),
  ...(isValidParams(statut.value) ? { statut: statut.value } : {}),
});

const updateData = (resetOffset = false) => {
  if (resetOffset) {
    offset.value = 0;
  }
  const queryFilter = {
    limit: limit.value,
    offset: offset.value,
    ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
    ...(isValidParams(sortDirection.value)
      ? { sortDirection: sortDirection.value.toUpperCase() }
      : {}),
    ...getSearchParams(),
  };
  agrementStore.getListAgrements(queryFilter);
  navigateTo({ query: queryFilter });
};

updateData();
</script>
