<template>
  <div>
    <DsfrTooltip on-hover :content="content">
      <div class="fr-icon-mail-line"></div>
    </DsfrTooltip>
  </div>
</template>

<script setup>
import { DsfrTooltip } from "@gouvminint/vue-dsfr";

defineProps({
  content: { type: String, required: true },
});
</script>

<style scoped></style>
