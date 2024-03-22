<template>
  <div style="margin-bottom: 1em">
    <div>
      <DsfrTable :headers="headers" :rows="displayable" :no-caption="true" />
      <div class="fr-grid-row fr-my-md-n1v">
        <div class="fr-col-md-2">
          <span style="font-style: italic"
            >( {{ props.totalItems }} résultat{{
              props.totalItems > 1 ? "s" : ""
            }}
            )</span
          >
        </div>
      </div>
      <div class="fr-grid-row">
        <div class="fr-col-md-8">
          <DsfrPagination
            v-if="pages && pages !== 0"
            :current-page="props.currentPage"
            :pages="pages"
            :trunc-limit="5"
            @update:current-page="onUpdateCurrentPage"
          />
        </div>
        <div class="fr-col-md-1">
          <DsfrSelect
            v-if="pages && pages !== 0"
            :model-value="itemsByPage"
            name="itemsByPage"
            label=""
            :options="itemsByPageOptions"
            @update:model-value="onUpdateItemsByPage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DsfrPagination, DsfrSelect, DsfrTable } from "@gouvminint/vue-dsfr";

const props = defineProps({
  headers: { type: Object, required: true },
  data: { type: Object, required: true },
  totalItems: { type: Number, required: true },
  currentPage: { type: Number, default: 0 },
  sortBy: { type: String, default: null },
  sortDirection: { type: String, default: null },
  itemsByPage: { type: Number, required: true },
  onClickCell: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  "update-sort",
  "update-items-by-page",
  "update-current-page",
]);

const itemsByPageOptions = [10, 20, 50, 100];
const itemsByPage = ref(props.itemsByPage);

const onUpdateItemsByPage = (val) => {
  emit("update-items-by-page", val);
};

const onUpdateCurrentPage = (val) => {
  emit("update-current-page", val);
};

const sorter = (col) => () => {
  if (props.sortBy !== col) {
    emit("update-sort", {
      sortBy: col,
      sortDirection: "ASC",
    });
  } else {
    emit("update-sort", {
      sortBy: props.sortBy,
      sortDirection: props.sortDirection === "ASC" ? "DESC" : "ASC",
    });
  }
};

const headers = props.headers.map((h) => {
  const headerAttrs = {};
  if (h.sort) {
    headerAttrs.onClick = sorter(h.column);
    headerAttrs.class = "pointer";
  }
  return {
    ...h,
    headerAttrs,
  };
});

const pages = computed(() => {
  const numberOfPages = Math.ceil(props.totalItems / props.itemsByPage);
  if (numberOfPages < 2) {
    return null;
  }
  return new Array(numberOfPages).fill().map((_p, index) => {
    return {
      label: `${index + 1}`,
      title: `Page ${index + 1}`,
      href: "",
    };
  });
});

const displayable = computed(() => {
  return props.data.map((item) => {
    return {
      rowAttrs: {
        ...(props.onClickCell && {
          class: "pointer",
          onClick: () => props.onClickCell(item),
        }),
      },
      rowData: headers.map((header) => {
        if (header.component) {
          return header.component(item);
        }
        const data = header.format ? header.format(item) : item[header.column];
        return {
          text: data?.toString() ?? "",
          ...(props.onClickCell && {}),
        };
      }),
    };
  });
});
</script>
