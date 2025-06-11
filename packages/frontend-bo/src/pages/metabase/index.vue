<template>
  <div>
    <h1>Metabase</h1>
    <div
      v-for="(url, idx) in iframeUrls"
      :key="idx"
      style="margin-bottom: 2rem"
    >
      <div v-if="loadingStates[idx]" style="text-align: center; padding: 2rem">
        <span>Chargement du tableau...</span>
      </div>
      <iframe
        v-if="url"
        :src="url"
        width="100%"
        height="800"
        allowfullscreen
        title="Metabase Board"
        @load="onIframeLoad(idx)"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const toaster = useToaster();

definePageMeta({
  middleware: ["is-connected"],
});

const boardIds = [30, 31];

const iframeUrls = ref(Array(boardIds.length).fill(null));
const loadingStates = ref(Array(boardIds.length).fill(true));

async function getIframe(boardId, idx) {
  try {
    const response = await $fetchBackend(`/metabase/board/${boardId}`, {
      method: "GET",
      credentials: "include",
    });
    iframeUrls.value[idx] = response.url;
  } catch (err) {
    toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors du chargement du tableau Metabase (ID: ${boardId})`,
    });
    console.error("Error fetching metabase board:", err);
  }
}

function onIframeLoad(idx) {
  loadingStates.value[idx] = false;
}

onMounted(() => {
  boardIds.forEach((id, idx) => {
    getIframe(id, idx);
  });
});
</script>
