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
              <h2>Portail Administration</h2>
              <div>
                <form id="login-1760">
                  <div
                    id="login-1760-fieldset"
                    class="fr-fieldset"
                    aria-labelledby="login-1760-fieldset-legend login-1760-fieldset-messages"
                  >
                    <legend
                      id="login-1760-fieldset-legend"
                      class="fr-fieldset__legend"
                    >
                      <h2>Se connecter avec son compte agent de l'Etat</h2>
                    </legend>

                    <div v-if="displayType" class="fr-grid-row">
                      <DsfrAlert
                        class="fr-my-3v"
                        :role="displayType === 'Success' ? 'status' : 'alert'"
                        :title="displayInfos[displayType].title"
                        :description="displayInfos[displayType].description"
                        :type="displayInfos[displayType].type"
                        :closeable="false"
                      />
                    </div>
                    <div class="fr-fieldset__element">
                      <div
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
                              autocomplete="email"
                              :model-value="email"
                              type="text"
                              name="email"
                              label="Identifiant"
                              :label-visible="true"
                              hint="Format attendu : nom@domaine.fr"
                              required
                              @update:model-value="editMail"
                            />
                          </div>
                        </div>
                        <div class="fr-fieldset__element">
                          <div id="password-1758" class="fr-password">
                            <div class="fr-input-wrap">
                              <PasswordInput
                                id="password"
                                autocomplete="current-password"
                                :model-value="password"
                                :type="showPassword ? 'text' : 'password'"
                                label="Mot de passe"
                                name="password"
                                hint="Veuillez saisir votre mot de passe"
                                required
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
                      </div>
                    </div>
                    <div class="fr-fieldset__element">
                      <ul role="list" class="fr-btns-group">
                        <li role="listitem">
                          <DsfrButton
                            :disabled="!canLogin"
                            @click.prevent="login"
                            >Se connecter</DsfrButton
                          >
                        </li>
                      </ul>
                    </div>
                  </div>
                </form>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { ERRORS_LOGIN } from "@vao/shared-bridge";
import { PasswordInput, apiModel } from "@vao/shared-ui";

const toaster = useToaster();

const config = useRuntimeConfig();

const log = logger("pages/connexion/email");

useHead({
  title: "VAO - connexion",
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

const displayInfos = apiModel.connectionInfos;
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

onMounted(() => {
  if (userStore?.isConnected) navigateTo("/");
});

async function login() {
  log.i("login", { email: email.value });
  try {
    displayType.value = null;
    const response = await $fetch(
      config.public.backendUrl + "/bo-authentication/email/login",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { email: email.value, password: password.value },
      },
    );
    formStatus.value = formStates.SUBMITTED;
    const serviceCompetent =
      response.user.territoireCode === "FRA"
        ? "NAT"
        : /^\d+$/.test(response.user.territoireCode)
          ? "DEP"
          : "REG";
    userStore.user = { ...response.user, serviceCompetent };
    toaster.success({
      titleTag: "h2",
      description: `Authentification réalisée avec succès`,
    });
    displayType.value = "Success";
    return navigateTo("/");
  } catch (error) {
    formStatus.value = formStates.SUBMITTED;
    const codeError = error?.data?.name;
    log.w("login", { error: codeError ?? error?.data ?? error });

    switch (codeError) {
      case ERRORS_LOGIN.TooManyLoginAttempts:
      case ERRORS_LOGIN.WrongCredentials:
      case ERRORS_LOGIN.NeedEmailValidation:
        displayType.value = codeError;
        break;
      default:
        displayType.value = ERRORS_LOGIN.UnexpectedError;
        break;
    }
  }
}
</script>

<style lang="scss" scoped></style>
