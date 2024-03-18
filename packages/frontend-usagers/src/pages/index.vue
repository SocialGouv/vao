<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--left fr-py-5w">
      <h3>Bienvenue {{ userStore.user.prenom }} !</h3>
    </div>
    <div
      v-if="!organismeCourant || !organismeCourant.complet"
      class="fr-grid-row fr-grid-row--left"
    >
      <DsfrHighlight
        :text="libelleMessageAccueil"
        :large="true"
        style="background-color: #eeeeee"
        class="fr-col-12 fr-py-5v"
      >
        <div class="fr-grid-row fr-grid-row-left fr-pt-5v">
          <NuxtLink
            class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
            href="/organisme"
          >
            Renseigner ma fiche organisateur
          </NuxtLink>
        </div>
      </DsfrHighlight>
    </div>
    <div class="fr-grid-row">
      <div
        class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
      >
        <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
          <div class="fr-py-1v">
            <h3>Organisateur</h3>
          </div>
          <div class="fr-py-1v">
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              :href="
                organismeStore.organismeCourant
                  ? `/organisme/${organismeStore.organismeCourant.organismeId}`
                  : '#'
              "
            >
              Ma fiche organisateur
            </NuxtLink>
          </div>
          <div class="fr-py-1v"><p></p></div>
          <div class="fr-py-1v"><p></p></div>
        </div>
      </div>
      <div
        class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
      >
        <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
          <div class="fr-py-1v">
            <h3>Hébergements</h3>
          </div>
          <div class="fr-py-1v">
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="/hebergements"
              >Mes hébergements</NuxtLink
            >
          </div>
          <div class="fr-py-1v">
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="/hebergements/new"
              >Déclarer un hébergement</NuxtLink
            >
          </div>
          <div class="fr-py-1v"><p></p></div>
        </div>
      </div>
      <div
        v-if="
          organismeStore.organismeCourant &&
          organismeStore.organismeCourant.complet
        "
        class="fr-col-4 fr-col-sm-12 fr-col-md-6 fr-col-lg-4 fr-py-5v fr-pr-5v"
      >
        <div class="fr-col-12 fr-p-5v" style="background-color: #f5f5fe">
          <div>
            <h3 class="fr-py-1v">Déclarations de séjour</h3>
          </div>
          <div class="fr-py-1v">
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="/demande-sejour/liste"
              >Mes séjours déclarés</NuxtLink
            >
          </div>
          <div class="fr-py-1v">
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="/demande-sejour"
              >Déclarer un séjour</NuxtLink
            >
          </div>
          <div class="fr-py-1v">
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="#"
              >Déclarer un incident</NuxtLink
            >
          </div>
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
            <NuxtLink
              class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              href="#"
              >Mes messages</NuxtLink
            >
          </div>
          <div class="fr-py-1v"><p></p></div>
          <div class="fr-py-1v"><p></p></div>
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
const organismeStore = useOrganismeStore();

await organismeStore.setMyOrganisme();

const organismeCourant = computed(() => {
  return organismeStore.organismeCourant;
});

const libelleMessageAccueil =
  "Afin de profiter de toutes les fonctionnalités de ce site, nous vous invitons à renseigner votre fiche organisateur";
</script>

<style lang="scss" scoped></style>
