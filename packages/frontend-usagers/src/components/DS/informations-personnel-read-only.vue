<template>
  <div>
    <DsfrFieldset>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nombre de personnes responsables </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.infoPersonnel?.nombreResponsable
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Procédure recrutement supplémentaire</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.infoPersonnel?.procedureRecrutementSupplementaire
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nombre d'accompagnants</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.infoPersonnel?.nombreAccompagnant
          }}</span>
        </div>
      </div>
    </DsfrFieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  infoPersonnel: { type: Object, required: true },
});
</script>

<style lang="scss" scoped></style>
