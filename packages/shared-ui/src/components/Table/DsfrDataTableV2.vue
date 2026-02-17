<script
  setup
  lang="ts"
  generic="Data extends Row, RowId extends keyof Data & string"
>
import {
  type Component,
  computed,
  type StyleValue,
  type VNode,
  ref,
  watch,
} from "vue";

export type Row = {
  [key: PropertyKey]: Primitive | Row;
};

export type Primitive = string | number | boolean | bigint | null | symbol;

export type ValueFromNestedKey<
  T,
  K extends string,
> = K extends `${infer Key}:${infer Rest}`
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
        ? K | `${K}:${NestedKeys<T[K]>}`
        : never
    : never;
}[keyof T];

export type CustomColumn = {
  key: `custom:${string}`;
  label: string;
  options?: {
    isFixedLeft?: boolean;
    isFixedRight?: boolean;
    isSortable?: boolean;
    cellComponent?: Component;
  };
  style?: StyleValue;
};

export type DefaultColumn<T> = {
  key: NestedKeys<T>;
  label: string;
  options?: {
    isFixedLeft?: boolean;
    isFixedRight?: boolean;
    isSortable?: boolean;
    cellComponent?: Component;
  };
  style?: StyleValue;
};

export type Columns<T> = (DefaultColumn<T> | CustomColumn)[];

export type DefaultSlots<T> = {
  [K in NestedKeys<T> as `cell-${K}`]?: (props: {
    row: T;
    cell: ValueFromNestedKey<T, K>;
  }) => VNode;
};

export type CustomSlots<T> = Partial<
  Record<`cell-${string}`, (props: { row: T }) => VNode>
>;

export type Slots<T> = DefaultSlots<T> &
  CustomSlots<T> & { footer: () => VNode };

const props = withDefaults(
  defineProps<{
    // Required
    data: Data[];
    rowId: RowId;
    columns: Columns<Data>;
    // Selection
    isSelectable?: boolean;
    selected?: Data[RowId][];
    // Sort
    isSortable?: boolean;
    sort?: Columns<Data>[number]["key"] | "";
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
  "update:sort": [Columns<Data>[number]["key"] | ""];
  "update:sort-direction": ["asc" | "desc" | ""];
  "update:selected": [Data[RowId][]];
  sort: [
    { sort: Columns<Data>[number]["key"]; direction: "asc" | "desc" | "" },
  ];
}>();

defineSlots<Slots<Data>>();

const sortAnnouncement = ref("");

watch(
  () => [props.sort, props.sortDirection],
  ([sortKey, direction]) => {
    if (!sortKey || !direction) {
      sortAnnouncement.value = "";
      return;
    }
    const column = props.columns.find((col) => col.key === sortKey);
    if (column) {
      const dirLabel =
        direction === "asc" ? "ordre croissant" : "ordre décroissant";
      sortAnnouncement.value = `Trié par ${column.label}, ${dirLabel}`;
    }
  },
);

const handleSort = (key: Columns<Data>[number]["key"]) => {
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

const selectedSync = computed({
  get() {
    return props.selected;
  },
  set(value) {
    emits("update:selected", value);
  },
});

const valueFromObject = (
  string: string,
  obj: Primitive | Row,
): Primitive | Row => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return null;
  }
  const [key, ...rest] = string.split(":");
  if (rest.length) {
    return valueFromObject(rest.join(":"), obj[key]);
  }
  return obj[key] === undefined ? null : obj[key];
};

const getSlotName = (column: DefaultColumn<Data> | CustomColumn) =>
  `cell-${column.key}` as keyof Slots<Data>;

const cellProps = (column: Columns<Data>[number], row: Data) => {
  if (column.key.startsWith("custom:")) {
    return { row };
  }
  return {
    row,
    cell: valueFromObject(String(column.key), row),
  };
};

const isSelected = (id: Data[RowId]) => props.selected.includes(id);

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
    <div aria-live="polite" aria-atomic="true" class="fr-sr-only">
      {{ sortAnnouncement }}
    </div>
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
                  v-for="column in columns"
                  :key="column.key"
                  scope="col"
                  :class="{
                    'fr-th': true,
                    'fr-cell--fixed-left': column?.options?.isFixedLeft,
                    'fr-cell--fixed-right': column?.options?.isFixedRight,
                    'fr-th--is-selectable': column?.options?.isSortable,
                  }"
                  :aria-sort="
                    column.key === sort
                      ? sortDirection === 'desc'
                        ? 'descending'
                        : 'ascending'
                      : 'none'
                  "
                  :style="column?.style"
                  v-on="
                    props.isSortable && column.options?.isSortable
                      ? {
                          click: () => handleSort(column.key),
                        }
                      : {}
                  "
                >
                  <div class="fr-table__header">
                    <template
                      v-if="props.isSortable && column.options?.isSortable"
                    >
                      <button
                        type="button"
                        class="fr-table__sort-btn"
                        :aria-label="`Trier par ${column.label}`"
                        @click="handleSort(column.key)"
                      >
                        {{ column.label }}
                        <span
                          :class="{
                            [column.key === sort
                              ? sortDirection === 'desc'
                                ? 'fr-icon-arrow-down-line'
                                : 'fr-icon-arrow-up-line'
                              : 'fr-icon-arrow-up-down-line']: true,
                            'fr-sort-icon': true,
                            'fr-table--is-not-sorted': column.key !== sort,
                          }"
                          aria-hidden="true"
                        />
                      </button>
                    </template>
                    <template v-else>
                      {{ column.label }}
                    </template>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in data"
                :key="row[props.rowId] as PropertyKey"
                :data-row-key="index + 1"
                :aria-selected="isSelected(row[props.rowId])"
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
                      :value="row[props.rowId]"
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
                  v-for="column in columns"
                  :key="column.key"
                  :style="column?.style"
                  :class="{
                    'fr-cell': true,
                    'fr-cell--fixed-left': column?.options?.isFixedLeft,
                    'fr-cell--fixed-right': column?.options?.isFixedRight,
                  }"
                >
                  <slot
                    v-if="$slots[getSlotName(column)]"
                    :name="getSlotName(column)"
                    v-bind="cellProps(column, row)"
                  />
                  <template v-else>
                    <component
                      :is="column.options.cellComponent"
                      v-if="column.options?.cellComponent"
                      :row="row"
                    />
                    <span v-else>{{
                      column.key.includes("custom:")
                        ? ""
                        : column.key.includes(":")
                          ? valueFromObject(column.key, row)
                          : row[column.key]
                    }}</span>
                  </template>
                </td>
              </tr>
              <tr v-if="data.length === 0">
                <td
                  :colspan="columns.length + +isSelectable"
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
  position: sticky;
  left: 0;
  z-index: 1;
}

.fr-table__content .fr-cell--fixed-right {
  background-image:
    linear-gradient(
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
.fr-table__sort-btn {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
}
.fr-table__sort-btn:hover {
  background-color: transparent;
}
</style>
