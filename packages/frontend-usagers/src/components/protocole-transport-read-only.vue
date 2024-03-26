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
            props.initData.responsableTransportLieuSejour.join(", ")
          }}</span>
        </div>
      </div>
      <div
        v-if="
          props.initData.responsableTransportLieuSejour.includes('organisateur')
        "
      >
        <div class="fr-fieldset__element">
          <div class="fr-col-12">
            <span class="read-only-label">Modes de transport utilisés</span>
          </div>
          <div class="fr-col-12">
            <span class="read-only-value">{{
              props.initData.modeTransport?.join(", ")
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
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Déplacements prévus durant le séjour</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.deplacementDurantSejour
              ? "Oui"
              : props.initData.deplacementDurantSejour === false
                ? "Non"
                : ""
          }}</span>
        </div>
      </div>
      <div
        v-if="
          props.initData.deplacementDurantSejour ||
          props.initData.modeTransport?.includes('Automobile') ||
          props.initData.modeTransport?.includes('Autobus, car')
        "
        class="fr-fieldset__element"
      >
        <div class="fr-col-12">
          <span class="read-only-label">Véhicules adaptés</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData.vehiculesAdaptes
              ? "Oui"
              : props.initData.vehiculesAdaptes === false
                ? "Non"
                : ""
          }}</span>
        </div>
      </div>
      <div
        v-if="
          props.initData.vehiculesAdaptes &&
          (props.initData.deplacementDurantSejour ||
            props.initData.modeTransport?.includes('Automobile') ||
            props.initData.modeTransport?.includes('Autobus, car'))
        "
      >
        <div class="fr-fieldset__element">
          <div class="fr-col-12">
            <span class="read-only-label">Spécificités des véhicules</span>
          </div>
          <div class="fr-col-12">
            <span class="read-only-value">{{
              props.initData.precisionVehiculesAdaptes
            }}</span>
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  initData: { type: Object, required: true },
});
</script>

<style lang="scss" scoped></style>
