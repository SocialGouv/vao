<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Gestion des cookies</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h4>A propos des cookies</h4>
        <span>
          Nous utilisons des cookies afin d'analyser la navigation des
          utilisateurs d'optimiser l'ergonomie du site internet et son
          fonctionnement.
        </span>
        <span
          >Aucune donnée à caractère personnel n'est collectée, c'est pourquoi
          nous sommes exemptés du recueil de votre consentement pour ces
          cookies.
        </span>
        <span>Cookies strictement nécessaires au fonctionnement du site</span>
        <span>
          Ce site utilise des cookies nécessaires à son bon fonctionnement qui
          ne peuvent pas être désactivés.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Cookies | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description de l'utilisation des cookies.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Gestion des cookies",
  },
];
</script>
