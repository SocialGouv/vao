<template>
  <div>
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
      <div
        v-if="loadingStates[idx] && url"
        style="
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
        "
      >
        <span>Chargement du tableau...</span>
      </div>
      <div
        v-if="errorStates[idx]"
        style="
          width: 100%;
          height: 800px;
          background: #ffe5e5;
          color: #b00020;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ff0000;
          padding: 1rem;
          text-align: center;
        "
      >
        Erreur lors du chargement du tableau Metabase (ID:
        {{ boardIds[idx] }})
      </div>
    </div>
  </div>
</template>

<script setup>
//todo: revoir le style (couleurs en dur)
import { ref } from "vue";

const toaster = useToaster();

definePageMeta({
  middleware: ["is-connected"],
});

const boardIds = [30];

const iframeUrls = ref(Array(boardIds.length).fill(null));
const loadingStates = ref(Array(boardIds.length).fill(true));
const errorStates = ref(Array(boardIds.length).fill(false));

async function getIframe(boardId, idx) {
  try {
    const response = await $fetchBackend(`/metabase/board/${boardId}`, {
      method: "GET",
      credentials: "include",
    });
    iframeUrls.value[idx] = response.url;
  } catch (err) {
    errorStates.value[idx] = true;
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

boardIds.forEach((id, idx) => {
  getIframe(id, idx);
});
</script>
