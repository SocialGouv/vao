<template>
  <div v-if="isNational">
    <h1>Metabase</h1>
    <div
      v-for="(url, idx) in iframeUrls"
      :key="idx"
      style="margin-bottom: 2rem; position: relative"
    >
      <iframe
        v-if="url"
        :src="url"
        width="100%"
        height="800"
        allowfullscreen
        title="Metabase Board"
        style="display: block"
        @load="onIframeLoad(idx)"
      ></iframe>
      <div v-if="loadingStates[idx] && url" class="loading-overlay">
        <span>Chargement du tableau...</span>
      </div>

      <div v-if="errorStates[idx]">
        <DsfrAlert
          role="alert"
          class="fr-grid-row fr-my-3v"
          :title="`Erreur lors du chargement du tableau Metabase (ID: ${boardIds[idx]})`"
          :description="`${errorStates[idx]}`"
          type="error"
          :closeable="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const userStore = useUserStore();

const isNational = userStore.user?.territoireCode === "FRA";

definePageMeta({
  middleware: ["is-connected"],
});

const boardIds = [30, 31];

const iframeUrls = ref(Array(boardIds.length).fill(null));
const loadingStates = ref(Array(boardIds.length).fill(true));
const errorStates = ref(Array(boardIds.length).fill(null));

async function getIframe(boardId, idx) {
  try {
    const response = await $fetchBackend(`/metabase/board/${boardId}`, {
      method: "GET",
      credentials: "include",
    });
    iframeUrls.value[idx] = response.url;
  } catch (err) {
    console.error(`Failed to fetch Metabase board with ID ${boardId}:`, err);
    errorStates.value[idx] = err?.message || String(err);
  }
}

function onIframeLoad(idx) {
  loadingStates.value[idx] = false;
}

boardIds.forEach((id, idx) => {
  getIframe(id, idx);
});
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 800px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
</style>
