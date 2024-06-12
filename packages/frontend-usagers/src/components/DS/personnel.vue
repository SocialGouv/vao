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
        <span class="fr-label"> 2. Coller des données depuis un tableur </span>
        <span class="fr-hint-text">
          Coller les cellules copiées directement depuis votre tableur (Excel,
          LibreOfficeCalc ...) en respectant bien l'ordre des colonnes
          suivants:</span
        >
        <span class="fr-hint-text"
          >nom ; prénom ; date de naissance ; compétences ; fonctions ; numéro
          téléphone
        </span>
        <span class="fr-hint-text">
          Attention, la ou les fonctions doivent être choisies parmi les
          propositions suivantes. S'il y en a plusieurs, les séparer par une
          virgule.
        </span>
        <ul>
          <ol>
            <span class="fr-hint-text">- Distribution des médicaments</span>
          </ol>
          <ol>
            <span class="fr-hint-text">- Transport des vacanciers</span>
          </ol>
          <ol>
            <span class="fr-hint-text">- Restauration</span>
          </ol>
          <ol>
            <span class="fr-hint-text">- Entretien des locaux</span>
          </ol>
          <ol>
            <span class="fr-hint-text">- Activités spécifiques</span>
          </ol>
          <ol>
            <span class="fr-hint-text">- Autre</span>
          </ol>
        </ul>
        <span class="fr-hint-text">
          <i><u>Exemple</u></i>
        </span>
        <span class="fr-hint-text"
          ><i
            >Durand;philippe;25/01/1977;infirmier;Distribution des
            médicaments,autre;0610203040</i
          ></span
        >
        <span class="fr-hint-text"
          ><i
            >dupont;Nathalie;15/07/1985;Cuisinière;Restauration;+33612345678</i
          >
        </span>
        <br />
        <DsfrInputGroup
          name="pasteFrom"
          :model-value="pasteFrom"
          :label-visible="true"
          :is-textarea="true"
          placeholder="Coller ici les colonnes copiées depuis votre tableur"
          @update:model-value="handlePaste"
        />
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <span class="fr-label">3. Liste du personnel ajouté</span>
      </div>
    </DsfrFieldset>
    <!-- Cette div sert a compenser le margin bottom par défault des dsfr-table qui est de 2.5rem.
          On cherche a rapprocher le bouton du tableau -->
    <div class="fr-fieldset__element">
      <UtilsTableFull
        :headers="headers"
        :data="personnesWithId"
        @click-row="editItem"
      />
    </div>
    <DsfrFieldset>
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
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

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

const personnesWithId = computed(() =>
  [...(props.personnes ?? [])].map((p, index) => ({ ...p, id: index })),
);

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
    personnes = [...personnesWithId.value].reduce((acc, curr) => {
      if (curr.id === indexCourant.value) {
        acc.push(data);
      } else {
        const tmp = { ...curr };
        delete tmp.id;
        acc.push(tmp);
      }
      return acc;
    }, []);
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
    const nom = fields[0]?.toLowerCase().trim() ?? "";
    const prenom = fields[1]?.toLowerCase().trim() ?? "";
    const dateNaissance =
      fields[2]?.trim().length === 10
        ? dayjs(fields[2]?.trim(), "DD/MM/YYYY").format("YYYY-MM-DD")
        : fields[2]?.trim().length === 8
          ? dayjs(fields[2]?.trim(), "DD/MM/YY").format("YYYY-MM-DD")
          : "format de date incorrecte";
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
