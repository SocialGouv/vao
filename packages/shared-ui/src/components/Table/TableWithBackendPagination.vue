<template>
  <TableUI
    :on-update-item-by-page="onUpdateItemsByPage"
    :on-update-current-page="onUpdateCurrentPage"
    :items-by-page="itemsByPage"
    :total-items="totalItems"
    :headers="headers"
    :displayed-data="props.data"
    :current-page="currentPage"
    @click-row="onClickCell"
  />
</template>

<script setup>
import TableUI from "./TableUI.vue";

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
</script>
