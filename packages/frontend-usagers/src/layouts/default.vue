<script setup>
import logo from "@/assets/LogoDGCS.png";
import { useUserStore } from "@/stores/user";

const log = logger("layouts/default");
const userStore = useUserStore();

const header = reactive({
  dimension: { height: "80px" },
  logoText: ["Republique", "française"],
  quickLinks: [
    {
      label: computed(() => userStore.user?.email),
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
  return userStore.isConnected ? "/mon-compte" : "/";
});

async function logout() {
  const sub = userStore.user.sub ?? null;
  log.i("logout - IN");
  await $fetch("/front-server/authentication/disconnect", {
    method: "POST",
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
    <DsfrHeader
      service-title="VAO : Vacances Adaptées Organisées"
      service-description="Portail des organisateurs"
      :home-to="homeTo"
      operator-img-alt="Logo du SI Honorabilité"
      :operator-img-src="logo"
      :operator-img-style="header.dimension"
      :logo-text="header.logoText"
      :quick-links="header.quickLinks"
    >
    </DsfrHeader>

    <slot />

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
