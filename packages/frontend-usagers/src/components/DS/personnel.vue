<template>
  <div>
    <DsfrFieldset>
      <div v-if="props.modifiable">
        <span class="fr-hint-text fr-mb-2w"
          >Vous pouvez saisir les informations de chaque personne
          individuellement ou coller les données depuis un tableur. Les données
          importées peuvent être ensuite modifiées manuellement, notamment pour
          joindre des documents.</span
        >
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <span class="fr-label">1. Ajouter le personnel manuellement</span>
        <span class="fr-hint-text"
          >Cliquer sur le bouton et renseigner les champs un par un. Faire ceci
          autant de fois que nécessaire</span
        >
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <DsfrButton
          ref="modalOrigin"
          :label="props.labelBoutonAjouter"
          size="sm"
          :secondary="true"
          @click.prevent="addPersonne"
        />
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <DsfrInputGroup
          name="pasteFrom"
          :model-value="pasteFrom"
          label="2. Coller des données depuis un tableur"
          hint="Coller les cellules copiées directement depuis votre tableur (Excel, LibreOfficeCalc ...) en respectant bien l'ordre des colonnes suivants : nom ; prénom ; date de naissance ; compétences ; fonctions ; numéro téléphone"
          :label-visible="true"
          :is-textarea="true"
          placeholder="nom;prénom;date de naissance;compétences;fonctions (séparées par des virgules s'il y en a plusieurs);numéro téléphone"
          @update:model-value="handlePaste"
        />
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <span class="fr-label">3. Liste du personnel ajouté</span>
      </div>
    </DsfrFieldset>
    <DsfrFieldset>
      <!-- Cette div sert a compenser le margin bottom par défault des dsfr-table qui est de 2.5rem.
          On cherche a rapprocher le bouton du tableau -->
      <div class="fr-fieldset__element">
        <UtilsTableFull
          :headers="headers"
          :data="props.personnes"
          @click-row="editItem"
        />
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <DsfrButton
          ref="modalOrigin"
          label="Export CSV"
          size="sm"
          :secondary="true"
          @click.prevent="exportCSV"
        />
      </div>
    </DsfrFieldset>

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
        :personne="personnel"
        :show-adresse="props.showAdresse"
        :show-attestation="props.showAttestation"
        :show-competence="props.showCompetence"
        :show-date-naissance="props.showDateNaissance"
        :show-email="props.showEmail"
        :show-fonction="props.showFonction"
        :show-liste-fonction="props.showListeFonction"
        :show-telephone="props.showTelephone"
        :show-button="props.modifiable"
        :validate-on-mount="true"
        @valid="updatePersonne"
      ></Personne>
    </DsfrModal>
  </div>
</template>

<script setup>
import * as yup from "yup";
import dayjs from "dayjs";
import { DsfrFieldset } from "@gouvminint/vue-dsfr";

const DsfrBadge = resolveComponent("DsfrBadge");

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
  labelBoutonAjouter: { type: String, required: true },
});

const emit = defineEmits(["updatePersonne"]);
const log = logger("pages/component/personnel");

const modalPersonne = reactive({
  opened: false,
});

const headers = [
  {
    column: "erreurs",
    sorter: "erreurs",
    text: "Statut",
    format: (value) => {
      return {
        component: DsfrBadge,
        label: value.erreurs?.length > 0 ? "Incomplet" : "Complet",
        noIcon: true,
        type: value.erreurs?.length > 0 ? "warning" : "success",
      };
    },
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nom",
    sorter: "nom",
    text: "Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "prenom",
    sorter: "renom",
    text: "Prénom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateNaissance",
    sorter: "dateNaissance",
    format: (value) => dayjs(value.dateNaissance).format("DD/MM/YYYY"),
    text: "Date de naissance",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "competence",
    sorter: "competence",
    text: "Compétences",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "listeFonction",
    sorter: "listeFonction",
    objectLabel: "listeFonction",
    text: "Fonctions",
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
    column: "erreurs",
    text: "Suppression",
    format: (_item, index) =>
      props.modifiable && {
        component: "DsfrButton",
        class: "fr-icon-delete-fill",
        tertiary: true,
        noOutline: true,
        onClick: (event) => {
          event.stopPropagation();
          deleteItem(index);
        },
        headerAttrs: {
          class: "suivi",
        },
      },
  },
];

const pasteFrom = ref();
const indexCourant = ref();
const personnel = ref();

function deleteItem(index) {
  log.i("deleteItem - In");
  if (props.modifiable) {
    const personnes = [
      ...props.personnes.slice(0, index),
      ...props.personnes.slice(index + 1),
    ];
    emit("updatePersonne", personnes);
  }
}

function addPersonne() {
  log.i("addPersonne");
  indexCourant.value = -1;
  personnel.value = {};
  modalPersonne.opened = true;
}

function editItem(item, index) {
  log.i("editItem - In", item);
  if (props.modifiable) {
    personnel.value = item;
    indexCourant.value = index;
    modalPersonne.opened = true;
  }
}

function updatePersonne(data) {
  log.i("updatePersonne", data);
  let personnes;
  log.i(indexCourant.value);
  if (indexCourant.value === -1) {
    personnes = [...props.personnes, data];
  } else {
    personnes = [
      ...props.personnes.slice(0, indexCourant.value),
      data,
      ...props.personnes.slice(indexCourant.value + 1),
    ];
  }
  emit("updatePersonne", personnes);
  indexCourant.value = null;
  modalPersonne.opened = false;
}

function onClose() {
  modalPersonne.opened = false;
}

async function handlePaste(lignesCollees) {
  const lignes = lignesCollees.split(/\r?\n/);
  const encadrantsFromCsv = [];
  for (let index = 0; index < lignes.length; index++) {
    const erreurs = [];
    if (lignes[index] === "") continue;
    const fields = lignes[index].split(/\t|\n|;/);
    const nom = fields[0]?.toUpperCase().trim() ?? "";
    const prenom = fields[1]?.toUpperCase().trim() ?? "";
    const dateNaissance = dayjs(fields[2]?.trim()).format("YYYY-MM-DD") ?? "";
    const competence = fields[3]?.trim() ?? "";
    const fonctions = fields[4]?.toLowerCase().trim() ?? "";
    const listeFonction = fonctions
      .split(",")
      .map((fonction) => fonction.trim());
    const telephone = fields[5]?.trim().replaceAll(" ", "") ?? "";
    const schema = yup.object(
      personne.schema({
        showAdresse: false,
        showCompetence: true,
        showDateNaissance: true,
        showEmail: false,
        showFonction: false,
        showListeFonction: true,
        showTelephone: true,
      }),
    );

    await schema
      .validate(
        {
          nom,
          prenom,
          competence,
          listeFonction,
          dateNaissance,
          telephone,
        },
        {
          abortEarly: false,
          stripUnknown: true,
        },
      )

      .catch((validationError) => {
        validationError.inner.forEach((error) => {
          erreurs.push(`erreur ligne ${index + 1} : ${error}`);
        });
      });
    encadrantsFromCsv.push({
      nom,
      prenom,
      attestation: true,
      competence,
      listeFonction,
      dateNaissance,
      telephone,
      erreurs,
    });
  }
  emit("updatePersonne", encadrantsFromCsv);
  pasteFrom.value = null;
}

function exportCSV() {
  const rows = [
    "Nom;Prenom;Date de Naissance;Compétences;Fonctions;Téléphone\n",
  ];
  props.personnes.forEach((p) => {
    rows.push(
      `${p.nom};${p.prenom};${dayjs(p.dateNaissance).format("DD/MM/YYYY")};${p.competence};${p.listeFonction.join(",")};${p.telephone}\n`,
    );
  });
  const blob = new Blob(rows, { type: "text/csv;charset-utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "personnel.csv");
  link.click();
}
</script>
