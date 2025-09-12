<template>
  <div style="margin-bottom: 1em">
    <div v-if="displayedData.length">
      <DsfrTable
        style="display: table"
        :title="title"
        :no-caption="noCaption"
        :headers="headers"
        :rows="rows"
      />
      <div v-if="pages" class="fr-grid-row fr-my-md-n1v fr-col-md-2">
        <span style="font-style: italic"
          >( {{ totalItems }} résultat{{ totalItems > 1 ? "s" : "" }} )</span
        >
      </div>
      <div class="fr-grid-row fr-col-md-12">
        <DsfrPagination
          v-if="pages"
          :current-page="currentPage"
          :pages="pages"
          :trunc-limit="5"
          @update:current-page="onUpdateCurrentPage"
        />
        <DsfrSelect
          v-if="pages"
          :model-value="itemsByPage"
          name="itemByPage"
          label=""
          :options="itemByPageOptions"
          @update:model-value="onUpdateItemByPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DsfrPagination, DsfrSelect, DsfrTable } from "@gouvminint/vue-dsfr";
import { computed } from "vue";

const emit = defineEmits(["click-row"]);

const props = defineProps({
  displayedData: { type: Array, required: true },
  title: { type: String, required: true },
  noCaption: { type: Boolean, default: false },
  headers: { type: Array, required: true },
  totalItems: { type: Number, required: true },
  currentPage: { type: Number, default: 0 },
  itemsByPage: { type: Number, required: true },
  onUpdateCurrentPage: { type: Function, required: true },
  onUpdateItemByPage: { type: Function, required: true },
});

const itemByPageOptions = [10, 20, 50, 100];

const pages = computed(() => {
  const numberOfPages = Math.ceil(props.totalItems / props.itemsByPage);
  if (numberOfPages <= 1) {
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

const rows = computed(() => {
  return props.displayedData.map((item, index) => {
    const rowdata = props.headers.map((header) => {
      if (header.component) {
        return header.component(item) ?? "";
      }
      if (header.format) {
        return header.format(item, index) ?? "";
      }
      if (header.objectLabel) {
        return item[header.column]?.[header.objectLabel] ?? "";
      }
      if (Array.isArray(item[header.column])) {
        return item[header.column]
          .map((val) => {
            return val[header.objectLabel] ?? "";
          })
          .join(", ");
      }
      const data = item[header.column]?.toString();
      return data ?? "";
    });
    const rowAttrs = { class: "pointer" };
    rowAttrs.onClick = () => {
      emit("click-row", item);
    };
    return {
      rowData: rowdata,
      rowAttrs,
    };
  });
});
</script>

<style scoped></style>
