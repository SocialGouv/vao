<template>
  <div class="fr-container fr-container--fluid fr-my-md-14v">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
        <div
          class="fr-container fr-px-md-0 fr-py-10v fr-py-md-14v"
          style="background-color: #f6f6f6"
        >
          <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
              <h1>Connexion à VAO</h1>
              <div>
                <form id="login-1760">
                  <fieldset
                    id="login-1760-fieldset"
                    class="fr-fieldset"
                    aria-labelledby="login-1760-fieldset-legend login-1760-fieldset-messages"
                  >
                    <legend
                      id="login-1760-fieldset-legend"
                      class="fr-fieldset__legend"
                    >
                      <h4>Se connecter avec son compte</h4>
                    </legend>

                    <div v-if="displayType" class="fr-grid-row">
                      <DsfrAlert
                        class="fr-my-3v"
                        :title="displayInfos[displayType].title"
                        :description="displayInfos[displayType].description"
                        :type="displayInfos[displayType].type"
                        :closeable="false"
                      />
                    </div>
                    <div class="fr-fieldset__element">
                      <fieldset
                        id="credentials"
                        class="fr-fieldset"
                        aria-labelledby="credentials-messages"
                      >
                        <div class="fr-fieldset__element">
                          <span class="fr-hint-text"
                            >Sauf mention contraire, tous les champs sont
                            obligatoires.</span
                          >
                        </div>
                        <div class="fr-fieldset__element">
                          <div class="fr-input-group">
                            <DsfrInput
                              autocomplete="Email"
                              :model-value="email"
                              type="text"
                              name="email"
                              label="Identifiant"
                              :label-visible="true"
                              hint="Format attendu : nom@domaine.fr"
                              @update:model-value="editMail"
                            />
                          </div>
                        </div>
                        <div class="fr-fieldset__element">
                          <div id="password-1758" class="fr-password">
                            <div class="fr-input-wrap">
                              <PasswordInput
                                id="password"
                                autocomplete="off"
                                :model-value="password"
                                :type="showPassword ? 'text' : 'password'"
                                label="Mot de passe"
                                name="password"
                                hint="Veuillez saisir votre mot de passe"
                                @update:model-value="editPwd"
                              ></PasswordInput>
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
                        </div>
                      </fieldset>
                    </div>
                    <div class="fr-fieldset__element">
                      <ul class="fr-btns-group">
                        <li>
                          <DsfrButton
                            :disabled="!canLogin"
                            @click.prevent="login"
                            >Se connecter</DsfrButton
                          >
                        </li>
                      </ul>
                    </div>
                  </fieldset>
                </form>
              </div>
              <hr />
              <h4>Vous n’avez pas de compte ?</h4>
              <ul class="fr-btns-group">
                <li>
                  <DsfrButton
                    @click.prevent="navigateTo('/connexion/enregistrement')"
                    >Créer un compte</DsfrButton
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const toaster = useToaster();

const config = useRuntimeConfig();

const log = logger("pages/connexion");

useHead({
  title: "Connexion | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de connexion.",
    },
  ],
});

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
  UnexpectedError: {
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
    const codeError = error?.data?.name;
    log.w("login", { error: codeError ?? error?.data ?? error });

    switch (codeError) {
      case "WrongCredentials":
        displayType.value = "WrongCredentials";
        break;
      case "NotValidatedAccount":
        displayType.value = "NotValidatedAccount";
        break;
      default:
        displayType.value = "UnexpectedError";
        break;
    }
  }
}
</script>

<style lang="scss" scoped></style>
