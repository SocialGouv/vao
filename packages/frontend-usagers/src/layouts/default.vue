<script setup>
import {
  Header,
  Footer,
  Skiplinks,
  useLayoutHeader,
  useToaster,
} from "@vao/shared-ui";

const userStore = useUserStore();
const organismeStore = useOrganismeStore();
const agrementStore = useAgrementStore();
const config = useRuntimeConfig();
const toaster = useToaster();

const { quickLinks, homeTo } = useLayoutHeader({
  logoutUrl: "/authentication/disconnect",
  accountPath: "/mon-compte",
  userStore,
});

watchEffect(async () => {
  if (
    userStore.isConnected &&
    organismeStore.organismeCourant?.organismeId &&
    !agrementStore.agrementCourant
  ) {
    try {
      await agrementStore.getByOrganismeId(
        organismeStore.organismeCourant.organismeId,
      );
    } catch (e) {
      toaster.error({
        titleTag: "h2",
        title: "Erreur lors du chargement de l'agrément",
        description: e?.message,
      });
      console.error("Erreur lors de la récupération de l'agrément :", e);
    }
  }
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
    <Toaster />
    <!-- <DsfrToaster /> -->
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
