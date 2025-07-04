<script setup>
const props = defineProps({
  environment: {
    type: String,
    default: "",
  },
  appVersion: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <DsfrFooter
    id="footer"
    legal-link="/footer/mentions-legales"
    personal-data-link="/footer/donnees-personnelles"
    cookies-link="/footer/gestion-cookies"
    a11y-compliance-link="/footer/accessibilite"
    home-title="Retour à l'accueil Vacances Adaptées Organisés, République Française"
  >
    <template #description>
      <p
        v-if="props.environment !== 'production'"
        class="fr-footer__content-desc"
      >
        Environnement : {{ props.environment }}
      </p>
      <a
        v-if="props.appVersion"
        href="https://vao-assistance.atlassian.net/wiki/spaces/IS/pages/91095041/MISE+A+JOUR+DE+LA+PLATEFORME+VAO"
        class="fr-footer__content-desc"
        title="assistance, nouvelle page"
        rel="noopener external"
        target="_blank"
      >
        Version : {{ props.appVersion }}
      </a>
    </template>
  </DsfrFooter>
</template>
