<script setup>
import { useUserStore } from "@/stores/user";
import { useLayoutStore } from "@/stores/layout";
const log = logger("layouts/demande-sejour");
const userStore = useUserStore();
const layoutStore = useLayoutStore();

const header = reactive({
  dimension: { height: "80px" },
  logoText: ["Republique", "française"],
  quickLinks: [
    {
      label: "mon compte",
      to: "/",
      icon: "ri-account-circle-line",
      iconRight: false,
      class: computed(() => (userStore.isConnected ? "" : "fr-hidden")),
    },
    {
      label: "Se déconnecter",
      onclick: logout,
      icon: "ri-logout-box-line",
      iconRight: false,
      button: true,
      class: computed(() => (userStore.isConnected ? "" : "fr-hidden")),
    },
  ],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/demande-sejour/liste",
    text: "Demande de séjour",
  },
];

const homeTo = computed(() => {
  return userStore.isConnected ? "/mon-compte" : "/";
});

async function logout() {
  const sub = userStore.user.sub ?? null;
  log.i("logout - IN");
  await $fetchBackend("/authentication/disconnect", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sub }),
  })
    .then(async () => {
      await navigateTo("/connexion");
      userStore.$reset();
      log.i("logout - Done");
    })
    .catch(() => {
      log.w("logout - Error");
    });
}

const consentCookie = useCookie("PP_consent", {
  default: () => false,
});

function acceptAll() {
  consentCookie.value = true;
}
</script>

<template>
  <div>
    <div class="fr-container">
      <div class="fr-grid-row fr-px-3w">
        <DsfrHeader
          service-title="Vacances Adaptées Organisées (VAO)"
          service-description="La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées majeures"
          :home-to="homeTo"
          :quick-links="header.quickLinks"
          :show-search="false"
          :logo-text="header.logoText"
          @click="navigateTo('/')"
        >
          <template #mainnav>
            <DsfrNavigation :nav-items="navItems" />
          </template>
        </DsfrHeader>

        <div class="fr-col-12 fr-mb-1w">
          <DsfrBreadcrumb :links="links" />
        </div>
      </div>
      <div class="fr-grid-row fr-px-3w">
        <div class="fr-col-3">
          <DSMenuDemandeSejour :active-id="layoutStore.stepperIndex">
          </DSMenuDemandeSejour>
        </div>

        <div class="fr-col-9 fr-py-3w">
          <DSStepper :step="layoutStore.stepperIndex"></DSStepper>
          <slot />
        </div>
      </div>
    </div>
    <DsfrFooter />
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

<style></style>
