<template>
  <div class="fr-container">
    <DemandesSejourListe />
    <DsfrModal
      ref="modal"
      name="prend-en-charge"
      :opened="declarationAPrendreEnCharge != null"
      title="Prise en charge d'une déclaration de séjour"
      @close="closePrendEnChargeModal"
    >
      <article class="fr-mb-4v">
        Vous vous apprêtez a prendre en charge la déclaration du séjour : <br />
        - {{ declarationAPrendreEnCharge.libelle }}
      </article>
      <fieldset class="fr-fieldset">
        <div class="fr-col-4">
          <div class="fr-input-group">
            <DsfrButton
              id="previous-step"
              :secondary="true"
              @click.prevent="closePrendEnChargeModal"
              >Retour
            </DsfrButton>
          </div>
        </div>
        <div class="fr-col-8">
          <div class="fr-input-group">
            <DsfrButton id="next-step" @click.prevent="validatePriseEnCharge"
              >Valider la prise en charge
            </DsfrButton>
          </div>
        </div>
      </fieldset>
    </DsfrModal>
  </div>
</template>

<script setup>
import { DemandesSejourListe } from "#build/components";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const declarationAPrendreEnCharge = ref(null);

const closePrendEnChargeModal = () =>
  (declarationAPrendreEnCharge.value = null);
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
