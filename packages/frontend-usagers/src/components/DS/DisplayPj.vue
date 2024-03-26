<template>
  <div>
    <UtilsTableFull :headers="headers" :data="files"> </UtilsTableFull>
    <!-- <DsfrTable
      style="display: table"
      :headers="headers"
      :rows="files"
      :no-caption="true"
    /> -->
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
  const files = props.declaration.files.files.map((f) => {
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
  return files;
  // props.declaration.files.files?.forEach((item) => {
  //   files.push([item.name, item.type, item.createdAt, item.uuid]);
  // });
  // files.push([
  //   props.declaration.organisme.agrement.file.name,
  //   "agrement",
  //   props.declaration.organisme.agrement.file.createdAt,
  //   props.declaration.organisme.agrement.file.uuid,
  // ]);
  // props.declaration.informationsTransport.files?.forEach((item) => {
  //   files.push([item.name, "protocole transport", item.createdAt, item.uuid]);
  // });
  // props.declaration.informationsSanitaires.files?.forEach((item) => {
  //   files.push([item.name, "protocole sanitaire", item.createdAt, item.uuid]);
  // });
  // props.declaration.hebergement.hebergements.forEach((item) => {
  //   files.push([
  //     item.informationsLocaux.justificatifERP.name,
  //     `justificatif ERP - ${item.hebergementId}`,
  //     item.informationsLocaux.justificatifERP.createdAt,
  //     item.informationsLocaux.justificatifERP.uuid,
  //   ]);
  // });
  // return files;
});
</script>

<style scoped>
.pj-container {
  margin-bottom: 3em;
}
</style>
