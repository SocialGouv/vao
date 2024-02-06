<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div>
      <div class="fr-grid-row fr-grid-row--center fr-my-5v">
        <div class="fr-col-12 fr-col-md-8 fr-col-lg-8">
          <div class="fr-container fr-mt-5v">
            <div class="fr-grid-row fr-grid-row--center">
              <form class="fr-col-12">
                <fieldset class="fr-fieldset">
                  <div class="fr-fieldset__element fr-col-6">
                    <DsfrTile
                      title="Demande d'agrément"
                      :img-src="encours"
                      description="En cours de construction"
                      :disabled="true"
                      :no-background="true"
                      :grey="false"
                    />
                  </div>
                  <div class="fr-fieldset__element fr-col-6">
                    <div class="fr-input-group">
                      <DsfrTile
                        title="Demande de séjour"
                        :img-src="sejour"
                        description="Je déclare un séjour"
                        :disabled="false"
                        to="/demande-sejour/operateur"
                        :icon="false"
                        :no-border="true"
                        :shadow="false"
                        :no-background="true"
                        :grey="false"
                      />
                    </div>
                  </div>
                </fieldset>
                <fieldset class="fr-fieldset">
                  <div class="fr-fieldset__element fr-col-6">
                    <DsfrTile
                      title="Contrôles"
                      :img-src="controle"
                      description="En cours de construction"
                      :disabled="true"
                      :small="true"
                      :no-background="true"
                      :grey="false"
                    />
                  </div>
                  <div class="fr-fieldset__element fr-col-6">
                    <div class="fr-input-group">
                      <DsfrTile
                        title="Mes demandes"
                        :img-src="info"
                        description="liste des demandes de séjour"
                        :disabled="false"
                        to="/demande-sejour/liste"
                        :small="true"
                        :no-border="true"
                        :no-background="true"
                        :grey="false"
                      />
                    </div>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import encours from "@/assets/E.jpg";
import sejour from "@/assets/B.jpg";
import controle from "@/assets/C.jpg";
import info from "@/assets/D.jpeg";
const nuxtApp = useNuxtApp();

definePageMeta({
  middleware: ["is-connected"],
});

const links = [
  {
    text: "Accueil",
  },
];
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
