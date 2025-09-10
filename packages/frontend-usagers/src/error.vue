<script setup>
import { Header, Footer, ErrorPage, useLayoutHeader } from "@vao/shared";

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 500, message: "Erreur inconnue" }),
  },
});

const navItems = useMenuNavItems();
const userStore = useUserStore();
const config = useRuntimeConfig();

const { quickLinks, homeTo } = useLayoutHeader({
  logoutUrl: "/authentication/disconnect",
  accountPath: "/mon-compte",
  userStore,
});
</script>

<template>
  <ErrorPage :error="props.error">
    <template #header>
      <Header
        :home-to="homeTo"
        :quick-links="quickLinks"
        :nav-items="navItems"
        service-title="Vacances Adaptées Organisées"
        service-description="La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées"
      />
    </template>
    <template #footer>
      <Footer
        :environment="config.public.environment"
        :app-version="config.public.appVersion"
      />
    </template>
  </ErrorPage>
</template>
