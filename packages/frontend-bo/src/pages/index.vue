<template>
  <div>Main</div>
</template>

<script setup>
definePageMeta({
  layout: "default",
  middleware: ["is-connected"],
});
</script>
