<template>
  <DsfrModal
    v-model:opened="modalDelete.opened"
    title="Suppression du représentant légal"
    is-alert
    @close="modalDelete.opened = false"
  >
    <template #default>
      <p>Êtes-vous sûr de vouloir supprimer ce représentant légal ?</p>
      <div class="btns-group">
        <DsfrButton
          label="Annuler"
          secondary
          @click="modalDelete.opened = false"
        />
        <DsfrButton label="Confirmer la suppression" @click="confirmDelete" />
      </div>
    </template>
  </DsfrModal>
  <div class="fr-mb-5w">
    <!-- Cette div sert a compenser le margin bottom par défault des dsfr-table qui est de 2.5rem.
        On cherche a rapprocher le bouton du tableau -->
    <div v-if="props.personnes.length > 0" class="fr-mb-n6v">
      <DsfrTable
        :key="'table-' + props.personnes.length"
        :title="props.titre"
        :headers="headersToDisplay"
        :rows="personnesToDisplay"
        :results-displayed="10"
        :current-page="currentPage"
        :pagination="(personnesToDisplay ?? []).length > 10"
      />
    </div>
    <DsfrButton
      v-if="props.modifiable"
      ref="modalOrigin"
      :label="props.labelBoutonAjouter"
      size="sm"
      :secondary="true"
      @click.prevent="addPersonne"
    />
    <DsfrModal
      ref="modal"
      name="test"
      :opened="modalPersonne.opened"
      :title="props.titre"
      size="md"
      @close="onClose"
    >
      <Personne
        :modifiable="props.modifiable"
        :personne="personne"
        :show-adresse="props.showAdresse"
        :show-attestation="props.showAttestation"
        :show-competence="props.showCompetence"
        :show-date-naissance="props.showDateNaissance"
        :show-email="props.showEmail"
        :show-fonction="props.showFonction"
        :show-liste-fonction="props.showListeFonction"
        :show-telephone="props.showTelephone"
        :show-button="props.modifiable"
        :validate-on-mount="!props.modifiable"
        @valid="updatePersonne"
      ></Personne>
    </DsfrModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { nextTick } from "vue";
const modalOrigin = ref(null);

const props = defineProps({
  personnes: { type: Array, required: true },
  modifiable: { type: Boolean, default: true },
  showAdresse: { type: Boolean, default: false, required: false },
  showAttestation: { type: Boolean, default: false, required: false },
  showCompetence: { type: Boolean, default: false, required: false },
  showDateNaissance: { type: Boolean, default: false, required: false },
  showFonction: { type: Boolean, default: false, required: false },
  showListeFonction: { type: Boolean, default: false, required: false },
  showTelephone: { type: Boolean, default: false, required: false },
  showEmail: { type: Boolean, default: false, required: false },
  titre: { type: String, default: null, required: false },
  headers: { type: Array, required: true },
  currentPage: { type: Number, default: 1 },
  labelBoutonAjouter: { type: String, required: true },
});

const emit = defineEmits(["valid"]);
const log = logger("pages/component/personnes");

const modalPersonne = reactive({
  opened: false,
});

const modalDelete = reactive({
  opened: false,
  index: null,
  personne: null,
});

function openDeleteModal(index) {
  modalDelete.opened = true;
  modalDelete.index = index;
  modalDelete.personne = props.personnes[index];
}

function confirmDelete() {
  deleteItem(modalDelete.index);
  modalDelete.opened = false;
  modalDelete.index = null;
  modalDelete.personne = null;
}

const headersToDisplay = computed(() => {
  const columns = props.headers.map((h) => h.label);
  if (props.modifiable) {
    columns.push("Actions");
  }
  return columns;
});

const personnesToDisplay = computed(() => {
  const displayedFields = props.headers.map((h) => h.value);
  return props.personnes.map((personne, index) => {
    const row = [];
    displayedFields.forEach((field) => {
      const fieldValue = personne[field];
      let valueFormatted = Array.isArray(fieldValue)
        ? fieldValue.join(",")
        : fieldValue;
      if (field === "dateNaissance" && valueFormatted) {
        valueFormatted = dayjs(valueFormatted).format("DD/MM/YYYY");
      }
      row.push(valueFormatted);
    });
    if (props.modifiable) {
      row.push({
        component: "PersonneActionsCell",
        personne,
        onEdit: () => editItem(index),
        onDelete: () => openDeleteModal(index),
      });
    } else row.push("");
    return {
      rowData: row,
    };
  });
});

function deleteItem(i) {
  log.i("deleteItem - In");
  const personnes = [
    ...props.personnes.slice(0, i),
    ...props.personnes.slice(i + 1),
  ];
  emit("valid", personnes, "delete", i);

  nextTick(() => {
    setTimeout(() => {
      const buttons = document.querySelectorAll("[data-delete-index]");

      if (buttons[i]) {
        buttons[i].focus();
      } else if (buttons[i - 1]) {
        buttons[i - 1].focus();
      } else if (modalOrigin.value?.$el) {
        modalOrigin.value.$el.focus();
      }
    }, 300);
  });
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
  personne.value = props.personnes[i];
  modalPersonne.opened = true;
}

function updatePersonne(data) {
  log.i("updatePersonne", data);
  let personnes;
  let action;
  if (indexCourant.value === -1) {
    personnes = [...props.personnes, data];
    action = "add";
  } else {
    personnes = [
      ...props.personnes.slice(0, indexCourant.value),
      data,
      ...props.personnes.slice(indexCourant.value + 1),
    ];
    action = "edit";
  }
  emit("valid", personnes, action, indexCourant.value);
  indexCourant.value = null;
  modalPersonne.opened = false;
}

function onClose() {
  modalPersonne.opened = false;
}
</script>

<style scoped>
.btns-group {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
