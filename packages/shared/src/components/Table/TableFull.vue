<template>
  <TableUI
    :on-update-item-by-page="onUpdateItemByPage"
    :on-update-current-page="(p) => (currentPage = p)"
    :items-by-page="itemByPage"
    :total-items="filteredData?.length ?? 0"
    :headers="h"
    :displayed-data="displayedData"
    :current-page="currentPage"
    @click-row="onClickRow"
  />
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import createLogger from "../../utils/createLogger";
import TableUI from "./TableUI.vue";

const logger = createLogger("vao-shared");
const log = logger("components/TableFull");

const emit = defineEmits(["click-row"]);
const onClickRow = (item) => {
  emit("click-row", item);
};

const props = defineProps({
  headers: { type: Object, required: true },
  search: {
    type: Object,
    default() {
      return {};
    },
  },
  data: { type: Object, required: true },
  dict: {
    type: Object,
    required: false,
    default() {
      return {};
    },
  },
  currentPage: {
    type: Number,
    required: false,
    default() {
      return 0;
    },
  },
  sortByInit: { type: String, default: "id" },
  sortDirectionInit: { type: Number, default: 1 },
});

const itemByPage = ref(10);

const onUpdateItemByPage = (val) => {
  itemByPage.value = parseInt(val);
  currentPage.value = 0;
};

const sortBy = ref(props.sortByInit);
const sortDirection = ref(props.sortDirectionInit);
const h = ref([]);

const getValue = (row, key) => {
  const splitedProp = key.split(".");
  let currentValue = row;
  for (const propChunk of splitedProp) {
    if (currentValue && Object.hasOwnProperty.call(currentValue, propChunk)) {
      currentValue = currentValue[propChunk];
    } else {
      return null;
    }
  }
  return currentValue;
};

const sorter = (col) => () => {
  const column = col.objectLabel
    ? `${col.column}.${col.objectLabel}`
    : col.column;
  if (sortBy.value !== column) {
    sortBy.value = column;
    sortDirection.value = 1;
  } else {
    sortDirection.value = sortDirection.value * -1;
  }
};

const filteredData = computed(() => {
  log.d(props.search);
  const criterias = Object.entries(props.search).filter((criteria) => {
    const [key, value] = criteria;
    if (
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return null;
    }
    return [key, value];
  });

  // Permet la récupération des lignes user correspondant au critères
  // On filtre chaque ligne qu'on récupère si les critères sont respecter
  const rows = props.data.filter((item) => {
    // On va essayer de trouvé un critère qui n'est pas valide
    const firstUnmatchedCriteria = criterias.find(([key, values]) => {
      const rule = props.dict[key];
      if (typeof rule === "function") {
        return !rule(item, values);
      }

      let target;

      if (!rule) {
        target = item[key];
      } else if (typeof rule === "object") {
        target = Array.isArray(item[rule.obj])
          ? item[rule.obj].map((el) => el[rule.val])
          : item[rule.obj]?.[rule.val];
      } else {
        target = item[rule];
      }

      if (typeof values === "string") {
        const noMatch = Array.isArray(target)
          ? target.findIndex((item) =>
              values.toLowerCase().includes(item.toString().toLowerCase()),
            ) === -1
          : !target?.toString().toLowerCase().includes(values.toLowerCase());
        return noMatch;
      } else if (typeof rule === "object") {
        target = Array.isArray(item[rule.obj])
          ? item[rule.obj].map((el) => el[rule.val])
          : item[rule.obj]?.[rule.val];
      } else if (typeof values === "boolean") {
        const noMatch = Array.isArray(target)
          ? target.findIndex((item) => values !== item) === -1
          : values !== target;
        return noMatch;
      } else if (Array.isArray(values)) {
        const noMatch = Array.isArray(target)
          ? target.findIndex((item) => values.includes(item)) === -1
          : !values.includes(target);
        return noMatch;
      } else {
        log.i("Comportement anormal");
        const noMatch = !target
          .toString()
          .toLowerCase()
          .includes(values.toLowerCase());
        return noMatch;
      }
    });
    // Si tous les critères sont ok alors on conserve la ligne
    const isMatchedAllCriterias = firstUnmatchedCriteria === undefined;
    return isMatchedAllCriterias;
  });

  rows.sort((a, b) => {
    const valueA = getValue(a, sortBy.value);
    const valueB = getValue(b, sortBy.value);
    const type = typeof valueA;
    const direction = sortDirection.value;
    let res;
    if (valueB === null || valueB === undefined) {
      res = -1;
    } else if (valueA === null || valueA === undefined) {
      res = 1;
    } else if (type === "String") {
      res = valueB > valueA ? -1 : valueA > valueB ? 1 : 0;
    } else if (type === "Number") {
      res = Number(valueB) - Number(valueA);
    } else {
      res = valueB > valueA ? -1 : valueA > valueB ? 1 : 0;
    }
    return direction * res;
  });
  return rows;
});

const displayedData = computed(() => {
  return filteredData.value.slice(
    currentPage.value * (itemByPage.value ?? 10),
    (currentPage.value + 1) * (itemByPage.value ?? 10),
  );
});

const currentPage = ref(props.currentPage);

onMounted(() => {
  h.value = props.headers.map((h) => {
    if (h.sort) {
      return {
        ...h,
        headerAttrs: {
          class: "pointer",
          onClick: sorter(h),
        },
      };
    }
    if (h.sorter) {
      return {
        ...h,
        headerAttrs: {
          class: "pointer",
          onClick: sorter(h),
        },
      };
    }
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
