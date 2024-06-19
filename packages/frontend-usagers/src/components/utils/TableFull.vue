<template>
  <div style="margin-bottom: 2em; overflow-x: auto">
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
const log = logger("components/TableFull");

const itemByPageOptions = [10, 20, 50, 100];
const itemByPage = ref(50);

const emit = defineEmits(["click-row"]);

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

const sorter = (col) => () => {
  if (sortBy.value !== col) {
    sortBy.value = col;
    sortDirection.value = 1;
  } else {
    sortDirection.value = sortDirection.value * -1;
  }
};

const filteredData = computed(() => {
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
  const rows =
    criterias.length === 0
      ? [...props.data]
      : props.data.filter((item) => {
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
                : item[rule.obj][rule.val];
            } else {
              target = item[rule];
            }
            if (typeof values === "string") {
              const noMatch = Array.isArray(target)
                ? target.findIndex((item) =>
                    values
                      .toLowerCase()
                      .includes(item.toString().toLowerCase()),
                  ) === -1
                : !target
                    .toString()
                    .toLowerCase()
                    .includes(values.toLowerCase());
              return noMatch;
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
    const type = typeof a[sortBy.value];
    const col = sortBy.value;
    const direction = sortDirection.value;
    let res;
    if (b[col] === null || b[col] === undefined) {
      res = -1;
    } else if (a[col] === null || a[col] === undefined) {
      res = 1;
    } else if (type === "String") {
      res = b[col] > a[col] ? -1 : a[col] > b[col] ? 1 : 0;
    } else if (type === "Number") {
      res = Number(b[col]) - Number(a[col]);
    } else {
      res = b[col] > a[col] ? -1 : a[col] > b[col] ? 1 : 0;
    }
    return direction * res;
  });
  return rows;
});

const displayableData = computed(() => {
  return filteredData.value.map((item, index) => {
    const rowdata = h.value.map((header) => {
      if (header.component) {
        return header.component(item, index);
      }
      if (header.format) {
        return header.format(item, index) ?? "";
      }
      if (Array.isArray(item[header.column])) {
        return item[header.column]
          .map((val) => {
            return val[header.objectLabel] ?? val;
          })
          .join(", ");
      }
      const data = item[header.column]?.toString();
      return data ?? "";
    });
    const rowAttrs = { class: "pointer" };
    rowAttrs.onClick = () => emit("click-row", item, index);
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
          onClick: sorter(h.column),
        },
      };
    }
    if (h.sorter) {
      return {
        ...h,
        headerAttrs: {
          class: "pointer",
          onClick: sorter(h.sorter),
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
