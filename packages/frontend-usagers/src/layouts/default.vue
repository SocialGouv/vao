<script setup>
import { Header, Footer, Skiplinks, useLayoutHeader } from "@vao/shared";

const userStore = useUserStore();
const config = useRuntimeConfig();

const { quickLinks, homeTo } = useLayoutHeader({
  logoutUrl: "/authentication/disconnect",
  accountPath: "/mon-compte",
  userStore,
});

const consentCookie = useCookie("VAO_consent", {
  default: () => false,
});

function acceptAll() {
  consentCookie.value = true;
}

const navItems = useMenuNavItems();
</script>

<template>
  <div>
    <DsfrToaster />
    <Skiplinks />
    <Header
      :home-to="homeTo"
      :quick-links="quickLinks"
      :nav-items="navItems"
      service-title="Vacances Adaptées Organisées"
      service-description="La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées"
    ></Header>

    <main id="content" role="main">
      <slot />
    </main>

    <Footer
      :environment="config.public.environment"
      :app-version="config.public.appVersion"
    />

    <DsfrNotice
      v-if="!consentCookie"
      title="L'utilisation de cookies est nécessaire au bon fonctionnement de
     l'application. Ceux-ci ne sont transmis à aucun service tiers ni
     utilisés dans un cadre publicitaire."
      closeable
      @close="acceptAll"
    />
  </div>
</template>
