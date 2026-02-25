<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <h1 class="fr-mt-6v">
      <span
        aria-hidden="true"
        class="fr-icon--green fr-icon-checkbox-line fr-pr-2v"
      ></span
      >Demande de renouvellement d’agrément soumise avec succès
    </h1>
    <p>Votre demande a été transmise à la DREETS (Direction régionale de l'économie, de l'emploi, du travail et des solidarités) de la région de votre siège social.</p>
    <p>Un accusé de réception a été envoyé à {{ userStore.user?.email ?? "votre adresse email" }}.</p>
    <div class="flex fr-mt-10v">
      <div><img src="/assets/mon-agrement.svg" alt="" aria-hidden="true" /></div>
      <div class="fr-pt-10v">
        <h2>Prochaine étape : Analyse de votre dossier.</h2>
        <h3 class="fr-mb-2v">Suivez l’avancement de votre dossier depuis votre page Agrément.</h3>
          <NuxtLink
            to="/mon-agrement"
            class="fr-btn fr-btn--primary"
          >
            Accéder à ma page Agrément
          </NuxtLink>
          <p class="fr-mt-6v"><span class="fr-icon-mail-line fr-pr-2v" aria-hidden="true"></span>Vous recevrez un e-mail à chaque étape.</p>
      </div>
    </div>
  </div>

  <AgrementAideContact />
</template>

<script setup lang="ts">
const userStore = useUserStore();

useHead({
  title: "Demande d'agrément transmise | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Demande d'agrément transmise.",
    },
  ],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Renouvellement d'agrément",
  },
];


</script>
<style scoped>
.fr-icon--green {
  color: var(--dark-decisions-text-text-default-success, #27a658);
}
h1 {
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
}
h2 {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px;
}
h3 {
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px;
}
.flex {
  min-width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 46px;
}
@media (max-width: 768px) {
  .flex {
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
}
</style>
