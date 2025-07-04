<script setup>
import { Header, Footer, ErrorPage, useLogout } from "@vao/shared";

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
  apiUrl: "/authentication/disconnect",
  getUserId: (user) => user?.id,
  user: userStore.user,
  resetUserStore: () => userStore.$reset(),
});

const quickLinks = computed(() => {
  return [
    {
      label: "Aide",
      href: "https://vao-assistance.atlassian.net/servicedesk/customer/portals",
      icon: "ri:question-line",
      iconRight: false,
      target: "_blank",
      rel: "noopener noreferrer",
    },
    ...(userStore.isConnected
      ? [
          {
            label: "Mon compte",
            to: "/mon-compte",
            icon: "ri:account-circle-line",
            iconRight: false,
          },
        ]
      : []),
    ...(userStore.isConnected
      ? [
          {
            label: "Se déconnecter",
            onclick: logout,
            icon: "ri:logout-box-line",
            iconRight: false,
            button: true,
          },
        ]
      : []),
  ];
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
