<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div v-for="(item, index) in props.personnes" :key="index">
          <div class="fr-col-12">
            <span class="read-only-value">{{
              `${item.nom} ${item.prenom}, ${item.fonction} : ${item.email}`
            }}</span>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  personnes: { type: Object, default: null, required: true },
});
</script>

<style scoped></style>
