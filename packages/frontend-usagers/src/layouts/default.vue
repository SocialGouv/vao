<script setup>
import { computed } from "vue";
import { Header, Footer, useLogout, useQuickLinks } from "@vao/shared";

const userStore = useUserStore();

const config = useRuntimeConfig();

const isConnected = computed(() => userStore.isConnected);

const user = computed(() => userStore.user);

const { logout } = useLogout({
  apiUrl: "/authentication/disconnect",
  getUserId: (user) => user?.id,
  user,
  resetUserStore: () => userStore.$reset(),
});

const quickLinks = useQuickLinks({
  isConnected,
  logout,
  accountPath: "/mon-compte",
});

const homeTo = computed(() => {
  return userStore.isConnected ? "/" : "/connexion/";
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
