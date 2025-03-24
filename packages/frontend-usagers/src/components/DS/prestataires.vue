<template>
  <div class="fr-mb-5w">
    <!-- Cette div sert a compenser le margin bottom par défault des dsfr-table qui est de 2.5rem.
          On cherche a rapprocher le bouton du tableau -->
    <div class="fr-mb-n6v">
      <TableFull
        :headers="headers"
        :data="prestatairesWithId"
        @click-row="editPrestataire"
      />
    </div>
    <DsfrButton
      v-if="props.modifiable"
      ref="modalOrigin"
      label="Ajouter un prestataire"
      size="sm"
      :secondary="true"
      @click.prevent="addPrestataire"
    />

    <DsfrModal
      ref="modal"
      name="prestataire"
      :opened="modalPrestataire.opened"
      :title="props.titre"
      size="md"
      @close="onClose"
    >
      <DSPrestataireDetail
        :prestataire="prestataire"
        :modifiable="props.modifiable"
        :titre="props.titre"
        @update-prestataire="updatePrestataire"
      >
      </DSPrestataireDetail>
    </DsfrModal>
  </div>
</template>

<script setup>
import { TableFull } from "@vao/shared";
import dayjs from "dayjs";

const props = defineProps({
  prestataires: { type: Array, required: true },
  modifiable: { type: Boolean, default: true },
  titre: { type: String, required: true },
});

const emit = defineEmits(["updatePrestataire"]);
const log = logger("pages/component/prestataire");

const modalPrestataire = reactive({
  opened: false,
});

const headers = [
  {
    column: "nom",
    sorter: "nom",
    text: "Raison Sociale / Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "prenom",
    sorter: "prenom",
    text: "Nom Commercial / Prénom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "telephone",
    sorter: "telephone",
    text: "Téléphone",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "adresse",
    sorter: "adresse",
    text: "Adresse",
    format: (value) => value?.adresse?.label,
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateNaissance",
    sorter: "dateNaissance",
    format: (value) => {
      if (value.typePrestataire === "personne_morale") {
        return null;
      }
      return dayjs(value.dateNaissance).format("DD/MM/YYYY");
    },
    text: "Date de naissance",

    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "competence",
    sorter: "competence",
    text: "Compétence / Expérience",
    headerAttrs: {
      class: "suivi",
    },
  },

  {
    column: "",
    text: "Action",
    format: (item, index) =>
      props.modifiable && {
        component: "DsfrButton",
        class: "fr-icon-delete-fill",
        tertiary: true,
        noOutline: true,
        onClick: (event) => {
          event.stopPropagation();
          deletePrestataire(index);
        },
        headerAttrs: {
          class: "suivi",
        },
      },
  },
];

const indexCourant = ref();
const prestataire = ref();
const prestatairesWithId = computed(() => {
  if (Array.isArray(props.prestataires)) {
    return props.prestataires.map((p, index) => ({ ...p, id: index }));
  }
  return [];
});

function deletePrestataire(index) {
  log.i("deletePrestataire - In");
  if (props.modifiable) {
    const prestataires = [
      ...props.prestataires.slice(0, index),
      ...props.prestataires.slice(index + 1),
    ];
    emit("updatePrestataire", prestataires);
  }
}

function addPrestataire() {
  log.i("addPrestataire");
  indexCourant.value = -1;
  prestataire.value = {};
  modalPrestataire.opened = true;
}

function editPrestataire(item) {
  log.i("editPrestataire - In", item);
  if (props.modifiable) {
    prestataire.value = item;
    indexCourant.value = item.id;
    modalPrestataire.opened = true;
  }
}

function updatePrestataire(data) {
  log.i("updatePrestataire", data);
  log.i("indexCourant.value");
  log.i(indexCourant.value);

  const isNew = indexCourant.value === -1;

  const prestataires = isNew
    ? [...props.prestataires, data]
    : prestatairesWithId.value.map(({ id, ...rest }) =>
        id === indexCourant.value ? data : rest,
      );
  emit("updatePrestataire", prestataires);
  indexCourant.value = null;
  modalPrestataire.opened = false;
}

function onClose() {
  modalPrestataire.opened = false;
}
</script>
