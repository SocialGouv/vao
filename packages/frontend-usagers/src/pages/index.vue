<template>
  <div>
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--left fr-col-12 fr-py-5w">
        <h3>Bienvenue {{ userStore.user.prenom }} !</h3>
      </div>
    </div>
    <div class="fr-container--fluid">
      <div v-if="!operateurCourant || !operateurCourant.complet">
        <div class="fr-grid-row fr-grid-row--left">
          <DsfrHighlight
            :text="libelleMessageAccueil"
            :large="true"
            style="background-color: #eeeeee"
            class="fr-col-12 fr-py-5v"
          >
            <div class="fr-grid-row fr-grid-row-left fr-pt-5v">
              <DsfrButton id="Suivant" @click="saisieFicheOperateur"
                >Renseigner ma fiche organisateur
              </DsfrButton>
            </div>
          </DsfrHighlight>
        </div>
      </div>
    </div>
    <div class="fr-container">
      <div class="fr-grid-row">
        <div
          class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
        >
          <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
            <div class="fr-py-1v">
              <h3>Organisateur</h3>
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                :href="
                  operateurStore.operateurCourant
                    ? `/operateur/${operateurStore.operateurCourant.operateurId}`
                    : '#'
                "
                >Ma fiche organisateur</a
              >
            </div>
            <div class="fr-py-1v"><p></p></div>
            <div class="fr-py-1v"><p></p></div>
          </div>
        </div>
        <div
          class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
        >
          <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
            <div>
              <h3 class="fr-py-1v">Déclaration de séjour</h3>
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                href="/demande-sejour/liste"
                >Mes séjours déclarés</a
              >
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                href="/demande-sejour/#info-generales"
                >Déclarer un séjour</a
              >
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                href="#"
                >Déclarer un incident</a
              >
            </div>
          </div>
        </div>
        <div
          class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
        >
          <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
            <div class="fr-py-1v">
              <h3>Hébergement</h3>
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                href="/hebergements"
                >Mes hébergements</a
              >
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                href="/hebergements/new"
                >Déclarer un hébergement</a
              >
            </div>
            <div class="fr-py-1v"><p></p></div>
          </div>
        </div>
        <div
          class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
        >
          <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
            <div class="fr-py-1v">
              <h3>Messagerie</h3>
            </div>
            <div class="fr-py-1v">
              <a
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
                href="#"
                >Mes messages</a
              >
            </div>
            <div class="fr-py-1v"><p></p></div>
            <div class="fr-py-1v"><p></p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});

const userStore = useUserStore();
const operateurStore = useOperateurStore();
const operateurCourant = computed(() => {
  return operateurStore.operateurCourant;
});

const libelleMessageAccueil =
  "Afin de profiter de toutes les fonctionnalités de ce site, nous vous invitons à renseigner votre fiche organisateur";

function saisieFicheOperateur() {
  return navigateTo("/operateur");
}
</script>

<style lang="scss" scoped></style>
