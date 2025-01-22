<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Lieux d'hébergements déclarés</h1>
      </div>
    </div>
    <HebergementsListe />
    <div class="fr-grid-row">
      <div class="fr-col">
        <form>
          <div class="fr-fieldset">
            <DsfrButton>
              <NuxtLink to="/hebergements">
                Déclarer un nouvel hébergement
              </NuxtLink>
            </DsfrButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Mes hébergements | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page listant les hébergements.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Mes hébergements",
  },
];
</script>
