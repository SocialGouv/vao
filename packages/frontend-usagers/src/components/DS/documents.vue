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
        lien: {
          component: "a",
          text: f.name,
          href: `${config.public.backendUrl}/documents/${f.uuid}`,
          download: true,
        },
      };
    });
  }
  if (props.declaration?.organisme?.agrement?.file) {
    files.push({
      name: props.declaration.organisme.agrement.file.name,
      type: "agrement",
      createdAt: props.declaration.organisme.agrement.file.createdAt,
      uuid: props.declaration.organisme.agrement.file.uuid,
      lien: {
        component: "a",
        text: props.declaration.organisme.agrement.file.name,
        href: `${config.public.backendUrl}/documents/${props.declaration.organisme.agrement.file.uuid}`,
        download: true,
      },
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
          lien: {
            component: "a",
            text: f.name,
            href: `${config.public.backendUrl}/documents/${f.uuid}`,
            download: true,
          },
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
          lien: {
            component: "a",
            text: f.name,
            href: `${config.public.backendUrl}/documents/${f.uuid}`,
            download: true,
          },
        };
      },
    );
    files = files.concat(filesTransport);
  }
  if (props.declaration?.hebergement?.hebergements?.length > 0) {
    console.log("herbert leonard");
    const filesHebergement = props.declaration.hebergement?.hebergements?.map(
      (h) => {
        console.log(h);
        return {
          name: h.informationsLocaux.justificatifERP.name,
          type: `hebergement-${h.hebergementId}`,
          createdAt: h.informationsLocaux.justificatifERP.createdAt,
          uuid: h.informationsLocaux.justificatifERP.uuid,
          lien: {
            component: "a",
            text: h.informationsLocaux.justificatifERP.name,
            href: `${config.public.backendUrl}/documents/${h.informationsLocaux.justificatifERP.uuid}`,
            download: true,
          },
        };
      },
    );
    files = files.concat(filesHebergement);
  }
  return files ?? [];
});
</script>

<style scoped>
.pj-container {
  margin-bottom: 3em;
}
</style>
