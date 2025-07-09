<script setup>
import { computed } from "vue";
import {
  Header,
  Footer,
  ErrorPage,
  useLogout,
  useQuickLinks,
} from "@vao/shared";

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 500, message: "Erreur inconnue" }),
  },
});

const navItems = useMenuNavItems();
const userStore = useUserStore();
const config = useRuntimeConfig();
const isConnected = computed(() => userStore.isConnected);
const user = computed(() => userStore.user);

const { logout } = useLogout({
  apiUrl: "/bo-authentication/disconnect",
  getUserId: (user) => user?.id,
  user,
  resetUserStore: () => userStore.$reset(),
});

const quickLinks = useQuickLinks({
  isConnected,
  logout,
  accountPath: "/comptes/mon-compte",
});

const homeTo = computed(() => {
  return userStore.isConnected ? "/" : "/connexion/";
});
</script>

<template>
  <ErrorPage :error="props.error">
    <template #header>
      <Header
        :home-to="homeTo"
        :quick-links="quickLinks"
        :nav-items="navItems"
        service-title="Back-office : Vacances Adaptées Organisées"
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
