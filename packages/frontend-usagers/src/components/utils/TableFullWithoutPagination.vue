<template>
  <div style="margin-bottom: 1em">
    <div>
      <DsfrTable
        style="display: table"
        :headers="h"
        :rows="displayedData"
        :no-caption="true"
      />
    </div>
  </div>
</template>

<script setup>
const log = logger("component/utils/TableFullWithoutPagination");
const props = defineProps({
  headers: { type: Object, required: true },
  data: { type: Object, required: true },
  selected: { type: String, required: true },
  indexToCompare: { type: String, required: true },
  dict: {
    type: Object,
    required: false,
    default() {
      return {};
    },
  },
  rowNavigate: { type: Function, required: false, default: () => {} },
});
const selectedColor = "#AACCEE";

const h = ref([]);

const displayedData = computed(() => {
  return props.data.map((item) => {
    const rowdata = h.value.map((header) => {
      if (header.component) {
        return header.component(item);
      }
      if (header.format) {
        return header.format(item) ?? "";
      }
      if (Array.isArray(item[header.column])) {
        return item[header.column]
          .map((val) => {
            return val[header.objectLabel];
          })
          .join(", ");
      }
      const data = item[header.column];
      return data ?? "";
    });
    const extendedData = rowdata.map((r) => {
      const maj = {
        text: r,
        cellAttrs: {
          bgcolor:
            props.selected === rowdata[props.indexToCompare]
              ? selectedColor
              : "",
        },
      };
      return maj;
    });
    const rowAttrs = { class: "pointer" };
    if (props.rowNavigate) rowAttrs.onClick = () => props.rowNavigate(item);
    return {
      rowData: extendedData,
      rowAttrs,
    };
  });
});

onMounted(() => {
  log.i("mounted comp");
  h.value = props.headers.map((h) => {
    return {
      ...h,
      headerAttrs: {
        class: "pointer",
      },
    };
  });
});
</script>

<style scoped></style>
