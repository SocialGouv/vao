<template>
  <DsfrButton @click="downloadPdf">{{ props.label }}</DsfrButton>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    url: string;
    filename: string;
    label?: string;
  }>(),
  {
    label: "Download PDF",
  },
);

const downloadPdf = () => {
  const link = document.createElement("a");
  link.href = props.url;
  link.download = props.filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
