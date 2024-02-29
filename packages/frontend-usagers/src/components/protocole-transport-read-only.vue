<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Responsables du transport jusqu'au lieu de séjour</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.responsableTransportLieuSejour
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Modes de transport utilisés</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.modeTransport.join()
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Mode d’organisation retenu</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.precisionModeOrganisation
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Déplacements prévus durant le séjour</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.deplacementDurantSejour ? "Oui" : "Non"
          }}</span>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
const log = logger("components/protocole-transport-read-only");

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});
</script>

<style lang="scss" scoped></style>
