<script setup>
import { Header, Footer, Skiplinks, useLayoutHeader } from "@vao/shared";

const navItems = useMenuNavItems();
const userStore = useUserStore();
const config = useRuntimeConfig();

const { quickLinks, homeTo } = useLayoutHeader({
  logoutUrl: "/bo-authentication/disconnect",
  accountPath: "/comptes/mon-compte",
  userStore,
});

const consentCookie = useCookie("VAO_BO_consent", {
  default: () => false,
});

function acceptAll() {
  consentCookie.value = true;
}
</script>

<template>
  <div>
    <DsfrToaster />
    <Skiplinks />
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
          <Header
            :home-to="homeTo"
            :quick-links="quickLinks"
            :nav-items="navItems"
            service-title="Back-office : Vacances Adaptées Organisées"
            service-description="La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées"
          ></Header>
        </div>
      </div>
    </div>

    <div id="content" class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
          <slot />
        </div>
      </div>
    </div>
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
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
      </div>
    </div>
  </div>
</template>
