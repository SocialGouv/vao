<template>
  <div>
    <div v-if="props.personnes.length > 0">
      <DsfrTable :headers="headersToDisplay" :rows="personnesToDisplay" />
    </div>
    <DsfrButton
      ref="modalOrigin"
      label="Ajouter un élément"
      size="sm"
      :secondary="true"
      @click="addPersonne"
    />
    <DsfrModal
      ref="modal"
      name="test"
      :opened="modalPersonne.opened"
      :title="props.title"
      size="md"
      @close="onClose"
    >
      <Personne
        :personne="personne"
        :show-adresse="props.showAdresse"
        :show-telephone="props.showTelephone"
        :show-email="props.showEmail"
        @valid="updatePersonne"
      ></Personne>
    </DsfrModal>
  </div>
</template>

<script setup>
const props = defineProps({
  personnes: { type: Array, default: null, required: true },
  showAdresse: { type: Boolean, default: false, required: false },
  showTelephone: { type: Boolean, default: false, required: false },
  showEmail: { type: Boolean, default: false, required: false },
  titre: { type: String, default: null, required: false },
  headers: { type: Array, default: null, required: true },
});

const emit = defineEmits(["valid"]);
const log = logger("pages/component/personnes");

const modalPersonne = reactive({
  opened: false,
});
const localPersonnes = ref(props.personnes);

const headersToDisplay = computed(() => {
  const columns = props.headers.map((h) => h.label);
  columns.push("Actions");
  return columns;
});

const personnesToDisplay = computed(() => {
  const displayedFields = props.headers.map((h) => h.value);
  return localPersonnes.value.map((p, index) => {
    const row = [];
    displayedFields.forEach((f) => {
      row.push(p[f]);
    });
    row.push({
      component: "DsfrButton",
      class: "fr-icon-delete-fill",
      tertiary: true,
      noOutline: true,
      onClick: (event) => {
        event.stopPropagation();
        deleteItem(index);
      },
    });
    return {
      rowData: row,
      rowAttrs: { class: "pointer", onClick: () => editItem(index) },
    };
  });
});

function deleteItem(i) {
  log.i("deleteItem - In");
  localPersonnes.value.splice(i, 1);
}

const indexCourant = ref();
const personne = ref();

function addPersonne() {
  log.i("addPersonne");
  indexCourant.value = -1;
  personne.value = {};
  modalPersonne.opened = true;
}

function editItem(i) {
  log.i("editItem - In");
  indexCourant.value = i;
  personne.value = localPersonnes.value[indexCourant.value];
  modalPersonne.opened = true;
}

function updatePersonne(data) {
  log.i("updatePersonne", data);
  log.i(data);
  if (indexCourant.value === -1) {
    localPersonnes.value.push(data);
  } else {
    localPersonnes.value[indexCourant.value] = data;
  }
  indexCourant.value = null;
  modalPersonne.opened = false;
  emit("valid", localPersonnes.value);
}

function onClose() {
  modalPersonne.opened = false;
}
</script>

<style scoped></style>
