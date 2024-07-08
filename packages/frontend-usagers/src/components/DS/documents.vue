<template>
  <DsfrFieldset
    legend="Documents générés par l'application : CERFA, Accusé de réception"
    legend-id="docs_generes"
  >
    <div v-if="filesGeneres.length > 0">
      <UtilsTableFull :headers="headers" :data="filesGeneres"></UtilsTableFull>
    </div>
    <div v-else>
      <span>Aucun document joint à la demande</span>
    </div>
  </DsfrFieldset>
  <DsfrFieldset
    legend="Documents téléversés par l'organisateur"
    legend-id="doc_televerses"
  >
    <div v-if="filesTeleverses.length > 0">
      <UtilsTableFull
        :headers="headers"
        :data="filesTeleverses"
      ></UtilsTableFull>
    </div>
    <div v-else>
      <span>Aucun document joint à la demande</span>
    </div>
  </DsfrFieldset>
</template>

<script setup>
import dayjs from "dayjs";
const config = useRuntimeConfig();
const NuxtLink = resolveComponent("NuxtLink");
const props = defineProps({
  declaration: { type: Object, required: true },
  messages: { type: Array, required: false, default: null },
});

const headers = [
  {
    column: "name",
    sorter: "name",
    text: "Nom du fichier",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "type",
    sorter: "type",
    messages: { type: Array, required: false, default: null },

    text: "Type de fichier",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "createdAt",
    sorter: "createdAt",
    format: (item) => dayjs(item.createdAt).format("DD/MM/YYYY HH:mm"),
    text: "Date de dépose",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    text: "téléchargement",
    component: (file) => {
      return {
        component: NuxtLink,
        to: `${config.public.backendUrl}/documents/${file.uuid}`,
        class: "fr-icon-file-download-fill",
      };
    },
  },
];

const filesGeneres = computed(() => {
  let files = [];
  if (props.declaration?.files?.files?.length > 0) {
    files = props.declaration?.files?.files?.map((f) => {
      return {
        name: f.name,
        type: f.type,
        createdAt: f.createdAt,
        uuid: f.uuid,
      };
    });
  }
  return files;
});

const filesTeleverses = computed(() => {
  let files = [];
  if (props.declaration?.informationsSanitaires?.files) {
    const filesSanitaires = props.declaration.informationsSanitaires.files.map(
      (f) => {
        return {
          name: f.name,
          type: "protocole sanitaire",
          createdAt: f.createdAt,
          uuid: f.uuid,
        };
      },
    );
    files = files.concat(filesSanitaires);
  }
  if (props.declaration?.informationsTransport?.files) {
    const filesTransport = props.declaration.informationsTransport.files.map(
      (f) => {
        return {
          name: f.name,
          type: "protocole transport",
          createdAt: f.createdAt,
          uuid: f.uuid,
        };
      },
    );
    files = files.concat(filesTransport);
  }
  if (props.declaration?.hebergement?.hebergements?.length > 0) {
    const hebergementFileNames = [
      "fileDernierArreteAutorisationMaire",
      "fileDerniereAttestationSecurite",
      "fileReponseExploitantOuProprietaire",
    ];

    for (const hebergement of props.declaration.hebergement?.hebergements ??
      []) {
      for (const fileName of hebergementFileNames) {
        if (hebergement.informationsLocaux?.[fileName]?.uuid) {
          files.push({
            name: hebergement.informationsLocaux[fileName].name,
            type: `justificatif-${hebergement.nom}`,
            createdAt: hebergement.informationsLocaux[fileName].createdAt,
            uuid: hebergement.informationsLocaux[fileName].uuid,
          });
        }
      }
    }
  }
  if (props.messages) {
    props.messages.map((m) => {
      if (m.file && m.file.uuid) {
        files.push({
          name: m.file.name ?? "fichier",
          type: "fichiers de messagerie ",
          createdAt: m.file.createdAt,
          uuid: m.file.uuid,
        });
      }
    });
  }
  return files;
});
</script>
