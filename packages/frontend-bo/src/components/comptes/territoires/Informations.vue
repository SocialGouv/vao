<template>
  <div class="fr-grid-row">
    <div
      v-for="(datum, index) in props.data"
      :key="index"
      class="fr-col-12 information-row"
    >
      <span class="information-row__label"> {{ datum.label }} : </span>
      <span class="information-row__value">
        {{ datum.value }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: { label: string; value: string }[];
}>();
</script>

<style>
.information-row {
  margin-bottom: 0.5rem;
}
.information-row .information-row__label {
  font-weight: 700;
}
</style>
