<template>
  <div class="card-number fr-p-2w">
    <div class="card-number__title">
      {{ title }}
    </div>
    <div class="card-number__value">
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: number;
}>();
</script>

<style lang="scss">
.card-number {
  background-color: var(--text-action-high-blue-france);
  color: var(--text-inverted-blue-france);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 10rem;
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
