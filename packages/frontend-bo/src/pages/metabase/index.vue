<template>
  <div>
    <h1>Metabase</h1>
    <iframe
      v-if="iframeUrl"
      :src="iframeUrl"
      width="100%"
      height="800"
      frameborder="0"
      allowfullscreen
      title="Metabase Board"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const toaster = useToaster();

definePageMeta({
  middleware: ["is-connected"],
});

const iframeUrl = ref(null);
const boardId = 30;

async function getIframe(boardId) {
  try {
    const response = await $fetchBackend(`/metabase/board/${boardId}`, {
      method: "GET",
      credentials: "include",
    });
    iframeUrl.value = response.url;
  } catch (err) {
    toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors du chargement du tableau Metabase`,
    });
    console.error("Error fetching metabase board:", err);
  }
}

onMounted(() => {
  getIframe(boardId);
});
</script>
