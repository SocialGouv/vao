<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-py-5w">
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
    <DsfrTiles :tiles="tiles" class="fr-grid-row--center fr-py-5v" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});

useHead({
  title: "Accueil | Vacances Adaptées Organisées",
  meta: [{ name: "description", content: "Page d'accueil." }],
});

const userStore = useUserStore();
const organismeStore = useOrganismeStore();

await organismeStore.setMyOrganisme();

const organismeCourant = computed(() => {
  return organismeStore.organismeCourant;
});

const libelleMessageAccueil =
  "Afin de profiter de toutes les fonctionnalités de ce site, nous vous invitons à renseigner votre fiche organisateur";

import NationalIdentityCard from "@gouvfr/dsfr/dist/artwork/pictograms/document/national-identity-card.svg";
import House from "@gouvfr/dsfr/dist/artwork/pictograms/buildings/house.svg";
import Contract from "@gouvfr/dsfr/dist/artwork/pictograms/document/contract.svg";

const tiles = computed(() => [
  {
    title: "Organisateur",
    to: organismeStore.organismeCourant
      ? `/organisme/${organismeStore.organismeCourant.organismeId}`
      : "/organisme/",
    imgSrc: NationalIdentityCard,
    description:
      "Cette page vous permet de renseigner les informations sur l'organisme.",
  },
  {
    title: "Hébergements",
    to: "/hebergements/liste",
    imgSrc: House,
    description:
      "Cette page permet de gérer les informations sur les lieux d'hébergement de vos séjours.",
  },
  ...(organismeStore.organismeCourant && organismeStore.organismeCourant.complet
    ? [
        {
          title: "Déclarations de séjour",
          to: "/demande-sejour/liste",
          imgSrc: Contract,
          description: "Cette page permet de gérer vos déclarations de séjour.",
        },
      ]
    : []),
]);
</script>

<style lang="scss" scoped></style>
