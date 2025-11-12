<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-py-5w">
      <h1>Bienvenue {{ userStore.user.prenom }} {{ userStore.user.nom }}</h1>
    </div>
    <div v-if="isExpiryMedium" class="fr-alert fr-alert--info fr-mb-5v">
      <h2>Déposez votre dossier de renouvellement d’agrément</h2>
      <p>
        Votre agrément actuel expire le
        {{ formatLongDateFr(organismeCourant?.agrement?.dateFinValidite) }}. Une
        fois l’agrément renouvelé, vous pourrez déposer de nouvelles
        déclarations de séjours dans la continuité du précédent agrément.
      </p>
    </div>
    <div v-if="isExpirySoon" class="fr-alert fr-alert--warning fr-mb-5v">
      <h2>Votre agrément arrive à expiration.</h2>
      <p>
        Une fois l’agrément renouvelé, vous pourrez déposer une nouvelle
        déclaration de séjour dans la continuité du précédent.
      </p>
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

import { formatDateFr } from "../utils/dateFormat";
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

const organismeCourant = computed(() => {
  return organismeStore.organismeCourant;
});

const daysUntilExpiry = computed(() => {
  const organisme = organismeCourant.value;

  const expiry = organisme?.agrement?.dateFinValidite
    ? new Date(organisme.agrement.dateFinValidite)
    : null;

  if (!expiry) return null;

  const diffMs = expiry.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// 6 mois à partir d'aujourd'hui
const sixMonthsFromNow = computed(() => {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date;
});

const isExpirySoon = computed(() => {
  const days = daysUntilExpiry.value;
  return days !== null && days >= 0 && days <= 120;
});

const isExpiryMedium = computed(() => {
  const organisme = organismeCourant.value;
  const expiry = organisme?.agrement?.dateFinValidite
    ? new Date(organisme.agrement.dateFinValidite)
    : null;

  if (!expiry) return false;

  // Entre 120 jours et 6 mois (date réelle à +6 mois)
  const expiryMs = expiry.getTime();
  const sixMonthsMs = sixMonthsFromNow.value.getTime();
  const days = daysUntilExpiry.value;

  return days !== null && days > 120 && expiryMs <= sixMonthsMs;
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

onMounted(() => {
  document.querySelector("header").focus();
});
</script>

<style lang="scss" scoped></style>
