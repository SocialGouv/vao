<template>
  <div>
    <DsfrFieldset>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Destination</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            projetSejour.destinationOptions
              .filter((dest) => {
                return props.projet?.destination?.includes(dest.name);
              })
              .map((dest) => dest.label)
              .join(", ")
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Sports et loisirs</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.projet?.activitesSportives &&
            props.projet.activitesSportives.join(", ")
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Culture et découverte</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.projet?.activitesCulturelles &&
            props.projet.activitesCulturelles.join(", ")
          }}</span>
        </div>
      </div>
    </DsfrFieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  projet: { type: Object, required: true },
});
</script>

<style lang="scss" scoped></style>
