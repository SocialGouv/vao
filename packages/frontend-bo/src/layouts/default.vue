<script setup>
const navItems = useMenuNavItems();

const log = logger("layouts/default");
const userStore = useUserStore();

const config = useRuntimeConfig();

const header = reactive({
  dimension: { height: "80px" },
  logoText: ["Republique", "française"],
  quickLinks: [
    {
      label: "Aide",
      href: "https://vao-assistance.atlassian.net/servicedesk/customer/portals",
      icon: "ri-question-line",
      iconRight: false,
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      label: "Mon compte",
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

const homeTo = computed(() => {
  return userStore.isConnected ? "/" : "/connexion/";
});

async function logout() {
  const sub = userStore.user.sub;
  log.i("logout - IN");
  await $fetchBackend("/bo-authentication/disconnect", {
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

const consentCookie = useCookie("VAO_BO_consent", {
  default: () => false,
});

function acceptAll() {
  consentCookie.value = true;
}

function onClickOnLogo() {
  navigateTo("/");
}
</script>

<template>
  <div>
    <DsfrToaster />
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
          <DsfrHeader
            service-title="Back-office : Vacances Adaptées Organisées (VAO)"
            service-description="La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées majeures"
            :home-to="homeTo"
            :quick-links="header.quickLinks"
            :show-search="false"
            :logo-text="header.logoText"
            @click="onClickOnLogo"
          >
            <template #mainnav>
              <DsfrNavigation :nav-items="userStore.isConnected && navItems" />
            </template>
          </DsfrHeader>
        </div>
      </div>
    </div>

    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
          <slot />
        </div>
      </div>
    </div>
    <div class="fr-container">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div class="fr-col-12">
          <DsfrFooter
            legal-link="/footer/mentions-legales"
            personal-data-link="/footer/donnees-personnelles"
            cookies-link="/footer/gestion-cookies"
            a11y-compliance-link="/footer/accessibilite"
          >
            <template #description>
              <p
                v-if="config.public.environment !== 'production'"
                class="fr-footer__content-desc"
              >
                Environnement : {{ config.public.environment }}
              </p>
              <p
                v-if="config.public.appVersion"
                class="fr-footer__content-desc"
              >
                Version : {{ config.public.appVersion }}
              </p>
            </template>
          </DsfrFooter>
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

<style></style>
