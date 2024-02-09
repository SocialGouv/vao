<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <h1>Identification</h1>
      <div v-if="displayType">
        <DsfrAlert
          class="fr-my-3v"
          :title="displayInfos[displayType].title"
          :description="displayInfos[displayType].description"
          :type="displayInfos[displayType].type"
          :closeable="false"
        />
      </div>
      <div class="fr-grid-row fr-grid-row--center fr-my-5v">
        <div class="fr-col-12 fr-col-md-9 fr-col-lg-9">
          <div class="fr-container fr-mt-5v">
            <div class="fr-grid-row fr-grid-row--center">
              <form class="fr-col-12">
                <fieldset class="fr-fieldset">
                  <div class="fr-fieldset__element fr-col-12">
                    <div class="fr-input-group">
                      <DsfrInputGroup
                        :model-value="email"
                        type="text"
                        name="email"
                        label="Email"
                        :label-visible="true"
                        placeholder="Veuillez saisir votre email"
                        @update:model-value="editMail"
                      />
                    </div>
                  </div>
                  <div class="fr-fieldset__element fr-col-12">
                    <div class="fr-input-group">
                      <DsfrInputGroup
                        :model-value="password"
                        :type="showPassword ? 'text' : 'password'"
                        label="Mot de passe"
                        name="password"
                        :label-visible="true"
                        placeholder="Veuillez saisir votre mot de passe"
                        @update:model-value="editPwd"
                      />
                    </div>

                    <div
                      class="fr-password__checkbox fr-checkbox-group fr-checkbox-group--sm"
                    >
                      <input
                        id="password-show"
                        v-model="showPassword"
                        aria-label="Afficher le mot de passe"
                        type="checkbox"
                        aria-describedby="password-show-messages"
                      />
                      <label
                        class="fr-password__checkbox fr-label"
                        for="password-show"
                      >
                        Afficher
                      </label>
                      <div
                        id="password-show-messages"
                        class="fr-messages-group"
                        aria-live="assertive"
                      ></div>
                    </div>
                    <p>
                      <NuxtLink
                        class="fr-link"
                        to="/connexion/mot-de-passe-oublie"
                      >
                        Mot de passe oublié ?
                      </NuxtLink>
                    </p>
                  </div>
                  <div class="fr-fieldset__element">
                    <DsfrButton :disabled="!canLogin" @click.prevent="login"
                      >Se connecter</DsfrButton
                    >
                  </div>
                </fieldset>
              </form>
            </div>
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

const config = useRuntimeConfig()

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
    await $fetch(config.public.backendUrl + "/authentication/email/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
      .then(async (response) => {
        log.i("login", response.user, userStore.user);
        userStore.user = response.user;
        toaster.success(`Authentification réalisée avec succès`);
        displayType.value = "Success";
        await userStore.refreshProfile();
        return navigateTo("/");
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.code;
        log.w("login", { body, codeError });

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
      });
  } catch (error) {
    log.w("login", { error });
    displayType.value = "DefaultError";
  } finally {
    log.i("finally");
    formStatus.value = formStates.SUBMITTED;
  }
}
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
