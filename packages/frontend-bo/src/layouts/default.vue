<script setup>
import { computed } from "vue";
import { Header, Footer, useLogout, useQuickLinks } from "@vao/shared";

const navItems = useMenuNavItems();

const config = useRuntimeConfig();

const isConnected = computed(() => userStore.isConnected);

const user = computed(() => userStore.user);

const userStore = useUserStore();

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
    <div class="fr-skiplinks">
      <nav class="fr-container" role="navigation" aria-label="Accès rapide">
        <ul class="fr-skiplinks__list" role="list">
          <li role="listitem">
            <a class="fr-link" href="#menu">Menu</a>
          </li>
          <li role="listitem">
            <a class="fr-link" href="#content">Contenu</a>
          </li>
          <li role="listitem">
            <a class="fr-link" href="#footer">Pied de page</a>
          </li>
        </ul>
      </nav>
    </div>
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
