<template>
  <div style="margin-bottom: 1em">
    <div v-if="displayedData.length">
      <DsfrTable
        style="display: table"
        :headers="h"
        :rows="displayedData"
        :no-caption="true"
      />
      <div class="fr-grid-row fr-col-md-12">
        <DsfrPagination
          v-if="pages && pages !== 0"
          v-model:current-page="currentPage"
          :pages="pages"
          :trunc-limit="5"
          @update:current-page="(p) => (currentPage = p)"
        />
        <DsfrSelect
          v-if="pages && pages !== 0"
          :model-value="itemByPage"
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

import { ref, computed, onMounted } from "vue";

import createLogger from "../utils/createLogger";

const logger = createLogger("vao-shared");
const log = logger("components/TableFull");

const emit = defineEmits("click-row");

const itemByPageOptions = [10, 20, 50, 100];
const itemByPage = ref(50);

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
});

const onUpdateItemByPage = (val) => {
  itemByPage.value = val;
  currentPage.value = 0;
};

const sortBy = ref("id");
const sortDirection = ref(1);
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

const displayableData = computed(() => {
  return filteredData.value.map((item) => {
    const rowdata = h.value.map((header) => {
      if (header.component) {
        return header.component(item) ?? "";
      }
      if (header.format) {
        return header.format(item) ?? "";
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

const displayedData = computed(() => {
  return displayableData.value.slice(
    currentPage.value * (itemByPage.value ?? 10),
    (currentPage.value + 1) * (itemByPage.value ?? 10),
  );
});

const currentPage = ref(props.currentPage);
const pages = computed(() => {
  const numberOfPages = Math.ceil(
    displayableData.value.length / (itemByPage.value ?? 10),
  );
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

defineExpose({
  displayableData,
});
</script>

<style scoped></style>
