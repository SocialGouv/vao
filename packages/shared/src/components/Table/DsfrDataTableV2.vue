<script setup lang="ts" generic="T extends Row, RowId extends keyof T & string">
import type { Component, StyleValue, VNode } from "vue";
import { computed } from "vue";

export type Primitive = string | number | boolean | bigint | null | symbol;

export type Row = {
  [key: PropertyKey]: Primitive | Row;
};

export type ValueFromNestedKey<
  T,
  K extends string,
> = K extends `${infer Key}-${infer Rest}`
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
        ? K | `${K}-${NestedKeys<T[K]>}`
        : never
    : never;
}[keyof T];

export type CustomKeys = `custom-${string}`;

export type Title<T> = {
  key: NestedKeys<T> | CustomKeys;
  label: string;
  options?: {
    isFixedLeft?: boolean;
    isFixedRight?: boolean;
    isSortable?: boolean;
    cellComponent?: Component;
  };
  style?: StyleValue;
};

export type Titles<T> = Title<T>[];

export type SlotProps<T> = {
  [K in Titles<T>[number] as `cell:${K["key"] & (NestedKeys<T> | CustomKeys)}`]?: (props: {
    row: T;
  }) => VNode;
};

const props = withDefaults(
  defineProps<{
    // Required
    data: T[];
    rowId: RowId;
    titles: Titles<T>;
    // Selection
    isSelectable?: boolean;
    selected?: Array<T[RowId]>;
    // Sort
    isSortable?: boolean;
    sort?: NestedKeys<T> | "";
    sortDirection?: "asc" | "desc" | "";
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
    sortDirection: "asc",
    emptyPlaceholder: "No data",
    isBordered: false,
    size: "md",
    tableTitle: "",
  },
);

const emits = defineEmits<{
  "update:sort": [NestedKeys<T> | ""];
  "update:sort-direction": ["asc" | "desc" | ""];
  "update:selected": [Array<T[RowId]>];
  sort: [{ sort: NestedKeys<T>; direction: "asc" | "desc" | "" }];
}>();

defineSlots<
  SlotProps<T> & {
    footer: () => VNode;
  }
>();

const getSlotName = (key: NestedKeys<T> | CustomKeys) => `cell:${key}`;

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
    const direction = props.sortDirection === "asc" ? "desc" : "";
    if (direction === "") {
      emits("update:sort", "");
    }
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
  obj: Primitive | Row,
): Primitive | Row => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return null;
  }
  if (string.startsWith("custom-")) {
    return obj;
  }
  const [key, ...rest] = string.split("-");
  if (rest.length) {
    return valueFromObject(rest.join("-"), obj[key]);
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
                  v-if="props.isSelectable"
                  class="fr-th fr-cell--fixed"
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
                    'fr-th': true,
                    'fr-cell--fixed-left': title?.options?.isFixedLeft,
                    'fr-cell--fixed-right': title?.options?.isFixedRight,
                    'fr-th--is-selectable': title?.options?.isSortable,
                  }"
                  :style="title?.style"
                  v-on="
                    props.isSortable && title.options?.isSortable
                      ? {
                          click: () => handleSort(title.key as NestedKeys<T>),
                        }
                      : {}
                  "
                >
                  <div class="fr-table__header">
                    {{ title.label }}
                    <span
                      v-if="props.isSortable && title.options?.isSortable"
                      :class="{
                        [title.key === sort
                          ? sortDirection === 'desc'
                            ? 'fr-icon-arrow-down-line'
                            : 'fr-icon-arrow-up-line'
                          : 'fr-icon-arrow-up-down-line']: true,
                        'fr-sort-icon': true,
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
                :key="row[props.rowId] as PropertyKey"
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
                <td
                  v-for="title in titles"
                  :key="title.key"
                  :style="title?.style"
                  :class="{
                    'fr-cell': true,
                    'fr-cell--fixed-left': title?.options?.isFixedLeft,
                    'fr-cell--fixed-right': title?.options?.isFixedRight,
                  }"
                >
                  <slot :name="getSlotName(title.key)" :row="row">
                    <component
                      :is="title.options.cellComponent"
                      v-if="title.options?.cellComponent"
                      :row="row"
                    />
                    <span v-else>{{
                      typeof title.key === "string" && title.key.includes("-")
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
    <slot name="footer" />
  </div>
</template>

<style scoped>
.fr-table .fr-table--is-not-sorted {
  color: var(--grey-625-425);
}
.fr-table .fr-icon-arrow-down-line {
  color: var(--blue-france-sun-113-625);
}
.fr-table .fr-icon-arrow-up-line {
  color: var(--blue-france-sun-113-625);
}
.fr-sort-icon {
  margin-left: 2rem;
}

.fr-table .fr-cell {
  word-wrap: break-word;
  white-space: normal;
}

.fr-table .fr-cell--empty {
  text-align: center;
}

.fr-table .fr-th {
  word-wrap: break-word;
  white-space: normal;
}

.fr-table .fr-th--is-selectable {
  cursor: pointer;
}

.fr-table__header {
  display: flex;
  justify-content: space-between;
}

.fr-table__content .fr-cell--fixed-left {
  background-color: var(--background-alt-grey);
  position: sticky;
  left: 0;
  z-index: 1;
}

.fr-table__content .fr-cell--fixed-right {
  background-color: var(--background-default-grey);
  background-image: linear-gradient(
      0deg,
      var(--border-contrast-grey),
      var(--border-contrast-grey)
    ),
    linear-gradient(
      0deg,
      var(--border-contrast-grey),
      var(--border-contrast-grey)
    );
  background-position:
    0px 100%,
    0px 0px !important;
  background-size:
    100% 1px,
    1px 100% !important;
  position: sticky;
  right: 0;
  z-index: 1;
}
</style>
