<template>
  <div>
    <dsfr-data-table-v2
      v-model:sort="sortedSync"
      v-model:sort-direction="sortDirectionSync"
      v-model:selected="selectedSync"
      :titles="props.titles"
      :data="props.data"
      :row-id="props.rowId"
      :is-selectable="props.isSelectable"
      :is-bordered="props.isBordered"
      :is-sortable="props.isSortable"
      :table-title="props.tableTitle"
      :size="props.size"
      @update:sort-direction="updateData"
      @update:sort="updateData"
    >
      <template v-for="bodySlot in bodySlots" #[bodySlot]="slotScope">
        <slot
          :name="bodySlot"
          v-bind="slotScope as SlotProps<T>[typeof bodySlot]"
        />
      </template>
      <template #footer>
        <dsfr-pagination-v2
          v-model:offset="offsetSync"
          v-model:limit="limitSync"
          :total="props.total"
          @update:offset="updateData"
          @update:limit="updateData"
        />
      </template>
    </dsfr-data-table-v2>
  </div>
</template>

<script setup lang="ts" generic="T extends Row, RowId extends keyof T & string">
import { computed } from "vue";
import { DsfrDataTableV2, DsfrPaginationV2 } from "@vao/shared";
import type {
  Row,
  NestedKeys,
  Titles,
  SlotProps,
} from "@vao/shared/src/types/DsfrDataTableV2.type";

const props = withDefaults(
  defineProps<{
    // Required
    data: T[];
    rowId: RowId;
    titles: Titles<T>;
    // Selection
    isSelectable?: boolean;
    selected?: T[RowId][];
    // Sort
    isSortable?: boolean;
    sort?: NestedKeys<T> | "";
    sortDirection?: "asc" | "desc" | "";
    // Pagination
    limit: number;
    offset: number;
    total: number;
    // Style
    emptyPlaceholder?: string;
    isBordered?: boolean;
    size?: "sm" | "md" | "sg";
    tableTitle?: string;
  }>(),
  {
    isSelectable: false,
    selected: () => [],
    isSortable: false,
    sort: "",
    sortDirection: "",
    emptyPlaceholder: "No data",
    isBordered: false,
    size: "md",
    tableTitle: "",
  },
);

const slots = defineSlots<SlotProps<T>>();

const emits = defineEmits<{
  "update:selected": [Array<T[RowId]>];
  "update:sort": [NestedKeys<T> | ""];
  "update:sortDirection": ["asc" | "desc" | ""];
  "update:limit": [number];
  "update:offset": [number];
  updateData: [
    {
      limit: number;
      offset: number;
      sort: NestedKeys<T> | "";
      sortDirection: "asc" | "desc" | "";
    },
  ];
}>();

const selectedSync = computed({
  get() {
    return props.selected;
  },
  set(value) {
    emits("update:selected", value);
  },
});

const bodySlots = computed<(keyof SlotProps<T>)[]>(() =>
  Object.keys(slots)
    .filter((key) => key.startsWith("cell:"))
    .map((key) => key as keyof SlotProps<T>),
);

const sortedSync = computed({
  get() {
    return props.sort;
  },
  set(value) {
    emits("update:sort", value);
  },
});

const sortDirectionSync = computed({
  get() {
    return props.sortDirection;
  },
  set(value) {
    emits("update:sortDirection", value);
  },
});

const offsetSync = computed({
  get() {
    return props.offset;
  },
  set(value) {
    emits("update:offset", value);
  },
});

const limitSync = computed({
  get() {
    return props.limit;
  },
  set(value) {
    emits("update:offset", 0);
    emits("update:limit", value);
  },
});

const updateData = () => {
  emits("updateData", {
    sort: props.sort,
    sortDirection: props.sortDirection,
    offset: props.offset,
    limit: props.limit,
  });
};
</script>
