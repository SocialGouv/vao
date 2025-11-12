<script setup>
import { DsfrErrorPage } from "@gouvminint/vue-dsfr";

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 500, message: "Unknown error" }),
  },
});

const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) return "Page non trouvée";
  if (props.error?.statusCode === 500) return "Erreur inattendue";
  return "Une erreur est survenue";
});

const errorDescription = computed(() => {
  if (props.error?.statusCode === 404) {
    return "La page demandée n'existe pas ou a été déplacée.";
  }
  if (props.error?.statusCode === 500) {
    return "Une erreur interne est survenue. Veuillez réessayer plus tard.";
  }
  return "Cette page n'existe pas ou une erreur s'est produite.";
});
</script>

<template>
  <div class="flex-wrapper">
    <div class="fr-container">
      <slot name="header"></slot>
    </div>
    <div class="fr-container fr-my-2w fr-mt-12w">
      <DsfrErrorPage
        :title="errorTitle"
        :subtitle="`Erreur ${error?.statusCode}`"
        :description="errorDescription"
      >
        <template #default>
          <div class="links">
            <NuxtLink
              to="/"
              title="Retourner à la page d'accueil"
              class="fr-btn fr-btn--primary"
            >
              Page d'accueil
            </NuxtLink>
            <a
              class="fr-btn fr-btn--secondary"
              target="_blank"
              href="https://vao-assistance.atlassian.net/servicedesk/customer/portals"
              title="consulter le portail de l'Assistance utilisateur VAO"
            >
              Consulter l'aide
            </a>
          </div>
        </template>
      </DsfrErrorPage>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.flex-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
}
.links .fr-btn:last-child {
  margin-top: 1rem;
  @media screen and (min-width: 768px) {
    margin-left: 1rem;
    margin-top: 0;
  }
}
</style>
