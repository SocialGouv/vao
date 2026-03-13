<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-py-5w">
      <h1>Bienvenue {{ userStore.user.prenom }} {{ userStore.user.nom }}</h1>
    </div>
    <AgrementAlertRenouvellement> </AgrementAlertRenouvellement>
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
    <div v-if="organismeCourant && organismeCourant.complet">
      <cards-number :values="topcards" />
      <cards-number :values="bottomCards" />
    </div>
    <DsfrTiles :tiles="tiles" class="fr-grid-row--center fr-py-5v" />
  </div>
</template>

<script setup>
import { CardsNumber } from "@vao/shared-ui";
import NationalIdentityCard from "@gouvfr/dsfr/dist/artwork/pictograms/document/national-identity-card.svg";
import House from "@gouvfr/dsfr/dist/artwork/pictograms/buildings/house.svg";
import Contract from "@gouvfr/dsfr/dist/artwork/pictograms/document/contract.svg";

definePageMeta({
  middleware: ["is-connected"],
});

useHead({
  title: "Accueil | Vacances Adaptées Organisées",
  meta: [{ name: "description", content: "Page d'accueil." }],
});

const userStore = useUserStore();
const demandeSejourStore = useDemandeSejourStore();
const organismeStore = useOrganismeStore();
const agrementStore = useAgrementStore();

const organismeCourant = computed(() => {
  return organismeStore.organismeCourant;
});
demandeSejourStore.getStats();

const topcards = computed(() => [
  {
    title: "Déclarations en brouillon",
    value: demandeSejourStore.stats?.countBrouillon ?? 0,
    redirect: `/demande-sejour/liste?statut=${DeclarationSejour.statuts.BROUILLON}`,
  },
  {
    title: "Déclarations à compléter",
    value: demandeSejourStore.stats?.countDeclarationAcompleter ?? 0,
    redirect: `/demande-sejour/liste?statut=${DeclarationSejour.statuts.A_MODIFIER_8J},${DeclarationSejour.statuts.ATTENTE_8_JOUR},${DeclarationSejour.statuts.A_MODIFIER}`,
  },
  {
    title: "Déclarations en instruction",
    value: demandeSejourStore.stats?.countDeclarationEnInstruction ?? 0,
    redirect: `/demande-sejour/liste?statut=${DeclarationSejour.statuts.TRANSMISE},${DeclarationSejour.statuts.TRANSMISE_8J},${DeclarationSejour.statuts.EN_COURS},${DeclarationSejour.statuts.EN_COURS_8J}`,
  },
]);

const bottomCards = computed(() => [
  {
    title: "Déclarations finalisées",
    value: demandeSejourStore.stats?.countDeclarationFinalisee ?? 0,
    redirect: `/demande-sejour/liste?statut=${DeclarationSejour.statuts.VALIDEE_8J}`,
  },
  {
    title: "Séjours en cours",
    value: demandeSejourStore.stats?.countSejourEnCours ?? 0,
    redirect: `/demande-sejour/liste?statut=${DeclarationSejour.statuts.SEJOUR_EN_COURS}`,
  },
  {
    title: "Séjours terminés",
    value: demandeSejourStore.stats?.countTerminee ?? 0,
    redirect: `/demande-sejour/liste?statut=${DeclarationSejour.statuts.TERMINEE}`,
  },
]);

const libelleMessageAccueil =
  "Afin de profiter de toutes les fonctionnalités de ce site, nous vous invitons à renseigner votre fiche organisateur";

const tiles = computed(() => [
  {
    title: "Organisateur",
    to: organismeStore.organismeCourant
      ? `/organisme/${organismeStore.organismeCourant.organismeId}`
      : "/organisme/",
    imgSrc: NationalIdentityCard,
    titleTag: "h2",
    description:
      "Cette page vous permet de renseigner les informations sur l'organisme.",
  },
  ...(userStore.user.featureFlags?.RENOUVELLEMENT_AGREMENT
    ? [
        {
          title: "Agrément",
          to: organismeStore.agrement
            ? `/agrement/${agrementStore.agrement?.id}`
            : "/agrement/",
          imgSrc: NationalIdentityCard,
          titleTag: "h2",
          description:
            "Cette page vous permet de renseigner les informations sur l'agrément.",
        },
      ]
    : []),
  ...(organismeStore.organismeCourant && organismeStore.organismeCourant.complet
    ? [
        {
          title: "Hébergements",
          to: "/hebergements/liste",
          imgSrc: House,
          titleTag: "h2",
          description:
            "Cette page permet de gérer les informations sur les lieux d'hébergement de vos séjours.",
        },
        {
          title: "Déclarations de séjour",
          to: "/demande-sejour/liste",
          imgSrc: Contract,
          titleTag: "h2",
          description: "Cette page permet de gérer vos déclarations de séjour.",
        },
      ]
    : []),
]);

const onClickRenouvellement = async () => {
  await agrementStore.getEnRenouvellement();
  if (agrementStore.agrementEnTraitement) {
    return navigateTo(`/agrement/${agrementStore.agrementEnTraitement.id}`);
  } else {
    return navigateTo("/agrement/");
  }
};

onMounted(() => {
  document.querySelector("header").focus();
});
</script>

<style lang="scss" scoped></style>
