<template>
  <div>
    <DsfrDataTableV2Wrapper
      v-model:limit="limit"
      v-model:offset="offset"
      :columns="columns"
      :data="paginatedData"
      :total="sejours.length"
      row-id="nomHebergement"
    >
      <template #cell-mois="{ row }">
        {{ row.mois ? parseIntToMonthFR(row.mois) : "" }}
      </template>

      <template #cell-adresse="{ row }">
        {{ row.adresse?.label || "" }}
      </template>
    </DsfrDataTableV2Wrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Columns } from "@vao/shared-ui";

import { DsfrDataTableV2Wrapper, columnsTable } from "@vao/shared-ui";
import type { BilanHebergementDto } from "@vao/shared-bridge";
import { parseIntToMonthFR } from "@vao/shared-bridge";

const props = defineProps<{
  initialSejours?: BilanHebergementDto[];
}>();

const sejours = computed(() => props.initialSejours ?? []);

const limit = ref(10);
const offset = ref(0);

const paginatedData = computed(() => {
  return sejours.value.slice(offset.value, offset.value + limit.value);
});

const defs: [string, string, string][] = [
  ["nomHebergement", "Nom de l'hébergement", columnsTable.optionType.NONE],
  ["adresse", "Adresse", columnsTable.optionType.NONE],
  ["mois", "Période", columnsTable.optionType.NONE],
  ["nbVacanciers", "Nombre de vacanciers", columnsTable.optionType.NONE],
];

const columns = columnsTable.buildColumns(
  defs,
) as unknown as Columns<BilanHebergementDto>;
</script>
