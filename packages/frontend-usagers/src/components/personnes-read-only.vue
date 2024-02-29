<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div v-for="(item, index) in props.personnes" :key="index">
          <div class="fr-col-12">
            <PersonneReadOnly :personne="item" />
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  personnes: { type: Array, required: true },
});
</script>

<style scoped></style>
