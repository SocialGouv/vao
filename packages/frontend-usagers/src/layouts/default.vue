<script setup>
const log = logger("layouts/default");
const userStore = useUserStore();

const config = useRuntimeConfig();

const logoText = ["Republique", "française"];

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

async function logout() {
  const sub = userStore.user.sub;
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
    <DsfrHeader
      id="header"
      service-title="Vacances Adaptées Organisées (VAO)"
      service-description="La plateforme de déclaration et suivi des séjours organisés pour les personnes handicapées majeures"
      :home-to="homeTo"
      :quick-links="quickLinks"
      :show-search="false"
      :logo-text="logoText"
    >
      <template #mainnav>
        <DsfrNavigation
          id="menu"
          :nav-items="navItems"
          style="box-shadow: inset 0 1px 0 0 #ddd"
        />
      </template>
    </DsfrHeader>

    <main id="content" role="main">
      <slot />
    </main>

    <DsfrFooter
      id="footer"
      legal-link="/footer/mentions-legales"
      personal-data-link="/footer/donnees-personnelles"
      cookies-link="/footer/gestion-cookies"
      a11y-compliance-link="/footer/accessibilite"
      class="fr-mt-2w"
      home-title="Retour à l'accueil Vacances Adaptées Organisés, République Française"
    >
      <template #description>
        <p
          v-if="config.public.environment !== 'production'"
          class="fr-footer__content-desc"
        >
          Environnement : {{ config.public.environment }}
        </p>
        <a
          v-if="config.public.appVersion"
          href="https://vao-assistance.atlassian.net/wiki/spaces/IS/pages/91095041/MISE+A+JOUR+DE+LA+PLATEFORME+VAO"
          class="fr-footer__content-desc"
          title="assistance, nouvelle page"
          target="_blank"
          rel="noopener external"
        >
          Version : {{ config.public.appVersion }}
        </a>
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
</template>
