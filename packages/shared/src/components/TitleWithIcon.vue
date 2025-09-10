<template>
  <div class="title-with-icon" :class="[marginTopClass, marginBottomClass]">
    <span :class="iconClass" aria-hidden="true"></span>
    <slot name="title">
      <component :is="headingTag" :class="titleClass">
        <slot />
      </component>
    </slot>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  icon: { type: String, required: true },
  level: { type: [Number, String], default: 2 },
  marginTop: { type: String, default: "fr-mt-4v" },
  marginBottom: { type: String, default: "fr-mb-4v" },
  titleClass: { type: [String, Array, Object], default: "" },
});

const headingTag = computed(() => `h${props.level}`);
const iconClass = computed(() => props.icon);
const marginTopClass = computed(() => props.marginTop);
const marginBottomClass = computed(() => props.marginBottom);
</script>

<style scoped>
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
