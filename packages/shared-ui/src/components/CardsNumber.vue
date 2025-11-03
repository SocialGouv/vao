<template>
  <div class="cards-number-wrapper fr-pb-3w">
    <card-number
      v-for="v in values"
      :key="v.title"
      :title="v.title"
      :value="v.value"
      :redirect="v.redirect"
      :html-title="v.htmlTitle"
      :clickable="v.clickable"
      @click="$emit('click', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import CardNumber from "./CardNumber.vue";

defineProps<{
  values: Array<{
    title: string;
    value: number;
    redirect?: string;
    htmlTitle?: string;
    clickable?: boolean;
  }>;
}>();

defineEmits<{ (e: "click", title: string) }>();
</script>

<style lang="scss">
.cards-number-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;

  @media screen and (min-width: 768px) {
    flex-direction: row;
  }
}
</style>
