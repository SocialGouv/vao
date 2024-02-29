<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <h1>Connexion au compte</h1>
      <div v-if="displayType">
        <DsfrAlert
          class="fr-my-3v"
          :title="displayInfos[displayType].title"
          :description="displayInfos[displayType].description"
          :type="displayInfos[displayType].type"
          :closeable="false"
        />
      </div>
      <div class="fr-container fr-mt-5v">
        <div class="fr-grid-row fr-grid-row--gutters">
          <form class="fr-col-6">
            <h2 class="form-title">Se connecter</h2>
            <p>Tous les champs sont obligatoires</p>
            <DsfrFieldset>
              <DsfrInputGroup
                autocomplete="off"
                :required="true"
                :model-value="email"
                type="text"
                name="email"
                label="Adresse électronique"
                :label-visible="true"
                hint="Veuillez saisir votre email"
                @update:model-value="editMail"
              />
              <PasswordInput
                id="password"
                autocomplete="off"
                :required="true"
                :model-value="password"
                :type="showPassword ? 'text' : 'password'"
                label="Mot de passe"
                name="password"
                hint="Veuillez saisir votre mot de passe"
                @update:model-value="editPwd"
              ></PasswordInput>
              <p>
                <NuxtLink class="fr-link" to="/connexion/mot-de-passe-oublie">
                  Mot de passe oublié ?
                </NuxtLink>
              </p>
            </DsfrFieldset>
            <DsfrButton :disabled="!canLogin" @click.prevent="login"
              >Se connecter</DsfrButton
            >
          </form>
          <div class="fr-col-6">
            <DsfrCallout
              title="Créer un compte"
              content="Vous êtes responsable dans un organisme ?"
              :button="buttonAttrs"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const config = useRuntimeConfig();

const log = logger("pages/connexion/email");

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/connexion",
    text: "Connexion",
  },
  {
    text: "Identification",
  },
];

const formStates = {
  CREATION: 1,
  SUBMITTED: 2,
};

const formStatus = ref(formStates.CREATION);

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const editMail = (v) => (email.value = v);
const editPwd = (v) => (password.value = v);

const displayInfos = {
  Success: {
    title: "Authentification réussie",
    description: "Vous allez être redirigé.",
    type: "success",
  },
  NotValidatedAccount: {
    title: "Erreur d'authentification",
    description: "Ce compte n'a pas été validé et n'est donc pas actif.",
    type: "error",
  },
  WrongCredentials: {
    title: "Erreur d'authentification",
    description: "Votre email ou votre mot de passe sont incorrects.",
    type: "error",
  },
  DefaultError: {
    title: "Une erreur est survenue",
    description:
      "Le service ne semble pas répondre. Veuillez réessayer ultérieurement",
    type: "error",
  },
};
const displayType = ref(null);

const buttonAttrs = {
  label: "Créer un compte",
  onClick: () => {
    return navigateTo("/connexion/enregistrement");
  },
};

const canLogin = computed(() => {
  return (
    email.value !== null &&
    email.value !== "" &&
    password.value !== null &&
    password.value !== ""
  );
});

const userStore = useUserStore();

async function login() {
  log.i("login", { email: email.value });
  try {
    displayType.value = null;
    const response = await $fetch(
      config.public.backendUrl + "/authentication/email/login",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.value, password: password.value }),
      },
    );
    formStatus.value = formStates.SUBMITTED;
    userStore.user = response.user;
    toaster.success(`Authentification réalisée avec succès`);
    displayType.value = "Success";
    return navigateTo("/");
  } catch (error) {
    formStatus.value = formStates.SUBMITTED;
    const codeError = error?.data?.code;
    log.w("login", { error: codeError ?? error?.data ?? error });

    switch (codeError) {
      case "WrongCredentials":
        displayType.value = "WrongCredentials";
        break;
      case "NotValidatedAccount":
        displayType.value = "NotValidatedAccount";
        break;
      default:
        displayType.value = "DefaultError";
        break;
    }
  }
}
</script>

<style lang="scss" scoped></style>
