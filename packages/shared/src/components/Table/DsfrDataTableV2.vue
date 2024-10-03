<script setup lang="ts" generic="T extends Row">
import type { Component } from "vue";
import { computed } from "vue";

export type Primitive = string | number | boolean | bigint | null | symbol;

export type Row = {
  [key: string]: Primitive | Row;
};

export type ValueFromNestedKey<
  T,
  K extends string,
> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? ValueFromNestedKey<T[Key], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

export type NestedKeys<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends Primitive
      ? K
      : T[K] extends Row
        ? K | `${K}.${NestedKeys<T[K]>}`
        : never
    : never;
}[keyof T];

export type SlotProps<T> = {
  [K in NestedKeys<T> as `cell-${K}`]?: (props: {
    cell: ValueFromNestedKey<T, K>;
    row: T;
  }) => any;
};

export type Titles<T> = {
  key: NestedKeys<T>;
  label: string;
  options?: {
    isSortable?: boolean;
    cellComponent?: Component;
  };
}[];

type RowId = keyof T;

const props = withDefaults(
  defineProps<{
    tableTitle?: string;
    data: T[];
    size?: "sm" | "md" | "sg";
    titles: Titles<T>;
    sortDirection?: "asc" | "desc";
    sort?: string;
    isSelectable?: boolean;
    isSortable?: boolean;
    isBordered?: boolean;
    rowId: keyof T;
    selected?: Array<T[RowId]>;
    emptyPlaceholder?: string;
  }>(),
  {
    sort: "",
    sortDirection: "asc",
    tableTitle: "",
    size: "md",
    isSelectable: false,
    isSortable: false,
    isBordered: false,
    selected: () => [],
    emptyPlaceholder: "No data",
  },
);

const emits = defineEmits<{
  "update:sort": [NestedKeys<T>];
  "update:sort-direction": ["asc" | "desc"];
  "update:selected": [Array<T[RowId]>];
  sort: [{ sort: NestedKeys<T>; direction: "asc" | "desc" }];
}>();

defineSlots<SlotProps<T>>();

const getSlotName = (key: NestedKeys<T>) => `cell-${key}`;

const selectedSync = computed({
  get() {
    return props.selected;
  },
  set(value) {
    emits("update:selected", value);
  },
});

const handleSort = (key: NestedKeys<T>) => {
  if (props.sort === key) {
    const direction = props.sortDirection === "asc" ? "desc" : "asc";
    emits("update:sort-direction", direction);
    emits("sort", { sort: key, direction });
  } else {
    emits("update:sort", key);
    emits("update:sort-direction", "asc");
    emits("sort", { sort: key, direction: "asc" });
  }
};

const valueFromObject = (
  string: string,
  obj: unknown,
): string | boolean | number | null => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return null;
  }
  const [key, ...rest] = string.split(".");
  if (rest.length) {
    return valueFromObject(rest.join("."), obj[key]);
  }
  return obj[key] === undefined ? null : obj[key];
};

const isSelected = (id: T[RowId]) => props.selected.includes(id);

const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    const tr = target.closest("tr");
    if (tr) {
      const { height } = tr.getBoundingClientRect();
      tr.style.setProperty("--row-height", `${height}px`);
    }
  }
};
</script>

<template>
  <div
    class="fr-table fr-table"
    :style="{
      '--table-offset': 0,
    }"
    :class="{
      [`fr-table--${props.size}`]: true,
      'fr-table--bordered': props.isBordered,
    }"
    data-fr-js-table="true"
    data-fr-js-table-actionee="true"
  >
    <div
      class="fr-table__wrapper"
      data-fr-js-table-wrapper="true"
      :style="{
        '--table-offset': props.tableTitle ? 'calc(32px + 1rem)' : '1rem',
      }"
    >
      <div class="fr-table__container">
        <div class="fr-table__content">
          <table data-fr-js-table-element="true">
            <caption v-if="props.tableTitle">
              {{
                props.tableTitle
              }}
            </caption>
            <thead>
              <tr>
                <th
                  v-if="isSelectable"
                  class="fr-cell--fixed"
                  role="columnheader"
                  scope="col"
                >
                  <span class="fr-sr-only">Sélectionner</span>
                </th>
                <th
                  v-for="title in titles"
                  :key="title.key"
                  scope="col"
                  :class="{
                    'fr-th--is-selectable': props.isSortable,
                  }"
                  v-on="
                    props.isSortable && title.options?.isSortable
                      ? {
                          click: () => handleSort(title.key),
                        }
                      : {}
                  "
                >
                  <div class="fr-table__header">
                    {{ title.label }}
                    <span
                      v-if="props.isSortable && title.options?.isSortable"
                      :class="{
                        [title.key === sort && sortDirection === 'desc'
                          ? 'fr-icon-arrow-down-line'
                          : 'fr-icon-arrow-up-line']: true,
                        'fr-table--is-not-sorted': title.key !== sort,
                      }"
                      aria-hidden="true"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in data"
                :key="row[props.rowId] as RowId"
                :data-row-key="index + 1"
                :aria-selected="isSelected(row[props.rowId] as T[RowId])"
              >
                <th
                  v-if="props.isSelectable"
                  class="fr-cell--fixed"
                  scope="row"
                >
                  <div class="fr-checkbox-group fr-checkbox-group--sm">
                    <input
                      id="table-select-checkbox--${index}"
                      v-model="selectedSync"
                      :value="row[props.rowId] as T[RowId]"
                      type="checkbox"
                      name="row-select"
                      @change="handleCheckboxChange"
                    />
                    <label
                      class="fr-label"
                      for="table-select-checkbox--${index}"
                    >
                      Sélectionner la ligne {{ index + 1 }}
                    </label>
                  </div>
                </th>
                <td v-for="title in titles" :key="title.key">
                  <slot
                    :name="getSlotName(title.key)"
                    :cell="row[title.key]"
                    :row="row"
                  >
                    <component
                      :is="title.options.cellComponent"
                      v-if="title.options?.cellComponent"
                      :cell="row[title.key]"
                      :row="row"
                    />
                    <span v-else>{{
                      typeof title.key === "string" && title.key.includes(".")
                        ? valueFromObject(String(title.key), row)
                        : row[title.key]
                    }}</span>
                  </slot>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td
                  :colspan="titles.length + +isSelectable"
                  class="fr-cell--empty"
                >
                  {{ emptyPlaceholder }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fr-table .fr-table--is-not-sorted {
  color: var(--grey-625-425);
}
.fr-table .fr-cell--empty {
  text-align: center;
}

.fr-table .fr-th {
  display: flex;
  justify-content: space-between;
}
.fr-table .fr-th--is-selectable {
  cursor: pointer;
}

.fr-table__header {
  display: flex;
  justify-content: space-between;
}
</style>
