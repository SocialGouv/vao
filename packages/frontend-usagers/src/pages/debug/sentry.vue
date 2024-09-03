<template>
  <div class="fr-container fr-container--fluid fr-my-md-14v">
    <button @click="testSentrySourceMaps">Test Sentry Source Maps</button>
  </div>
</template>

<script setup>
function testSentrySourceMaps() {
  const msg = "testing sentry source maps";
  console.log(msg);
  doTestSentry();
}

function doTestSentry() {
  throw new Error("Test sentry sourcemaps");
}
</script>

<style lang="scss" scoped></style>
