<script setup>
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
const { logout } = useLogout({
  apiUrl: "/bo-authentication/disconnect",
  getUserId: (user) => user?.id,
  user: userStore.user,
  resetUserStore: () => userStore.$reset(),
});

const quickLinks = useQuickLinks({
  isConnected: userStore.isConnected,
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
