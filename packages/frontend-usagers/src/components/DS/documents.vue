<template>
  <div v-if="files.length > 0">
    <UtilsTableFull :headers="headers" :data="files"> </UtilsTableFull>
  </div>
  <div v-else>
    <span>Aucun document joint à la demande</span>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
const config = useRuntimeConfig();
const NuxtLink = resolveComponent("NuxtLink");
const props = defineProps({
  declaration: { type: Object, required: true },
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

const files = computed(() => {
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
  if (props.declaration?.organisme?.agrement?.file) {
    files.push({
      name: props.declaration.organisme.agrement.file.name,
      type: "agrement",
      createdAt: props.declaration.organisme.agrement.file.createdAt,
      uuid: props.declaration.organisme.agrement.file.uuid,
    });
  }
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
    const filesHebergement = props.declaration.hebergement?.hebergements
      ?.filter((h) => h.informationsLocaux?.justificatifERP?.uuid)
      .map((h) => {
        return {
          name: h.informationsLocaux.justificatifERP.name,
          type: `justificatif-${h.nom}`,
          createdAt: h.informationsLocaux.justificatifERP.createdAt,
          uuid: h.informationsLocaux.justificatifERP.uuid,
        };
      });
    files = files.concat(filesHebergement);
  }
  return files;
});
</script>
