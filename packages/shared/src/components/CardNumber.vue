<template>
  <component
    :is="wrapper"
    :to="redirect"
    class="card-number fr-p-2w"
    :title="htmlTitle"
    :class="{ 'card-number--has-hover-effect': redirect }"
  >
    <div class="card-number__title">
      {{ title }}
    </div>
    <div class="card-number__value">
      {{ value }}
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = withDefaults(
  defineProps<{
    title: string;
    value: number;
    redirect?: string;
    htmlTitle?: string;
  }>(),
  {
    redirect: "",
    htmlTitle: "",
  },
);

const wrapper = computed(() => (props.redirect ? "router-link" : "div"));
</script>

<style lang="scss">
.card-number {
  background-color: var(--blue-france-sun-113-625);
  color: var(--text-inverted-blue-france);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 10rem;
  flex: 1;
  background-image: none;
  &--has-hover-effect:hover {
    background-color: var(--blue-france-sun-113-625-hover) !important;
  }
  &__title {
    font-size: 1.5rem;
  }

  &__value {
    text-align: right;
    font-size: 3rem;
    line-height: 3rem;
    font-weight: 800;
  }
}
</style>
