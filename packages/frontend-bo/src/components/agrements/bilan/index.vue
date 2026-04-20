<template>
  <div>
    <AgrementsBilanChangements
      ref="changementsRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
    />
    <AgrementsBilanSejours
      ref="sejoursRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
    />
    <AgrementsBilanQualitatif
      ref="qualitatifRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
    />
    <div class="separator fr-my-2w"></div>
    <AgrementsBilanFinancier
      ref="financierRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const changementsRef = ref(null);
const financierRef = ref(null);
const sejoursRef = ref(null);
const qualitatifRef = ref(null);
</script>
