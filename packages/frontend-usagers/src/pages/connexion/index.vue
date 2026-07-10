<template>
  <div class="fr-container fr-container--fluid fr-my-md-14v">
    <DsfrModal
      modal-ref="cgu-modal"
      name="cgu-modal"
      title="Conditions Générales d'Utilisation"
      :opened="openCgu"
      @close="refuseCgu"
    >
      <CguValidation
        :allow-validation="true"
        @refuse="refuseCgu"
        @validate="validateCgu"
      />
    </DsfrModal>

    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
        <div
          class="fr-container fr-px-md-0 fr-py-10v fr-py-md-14v"
          style="background-color: #f6f6f6"
        >
          <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
              <h1>Connexion à VAO</h1>

              <form id="login-form" novalidate @submit.prevent="login">
                <fieldset class="fr-fieldset">
                  <legend
                    id="login-fieldset-legend"
                    class="fr-fieldset__legend"
                  >
                    <h2>Se connecter avec son compte organisateur</h2>
                  </legend>

                  <div v-if="currentAlert" class="fr-grid-row">
                    <DsfrAlert
                      class="fr-my-3v"
                      :role="'alert'"
                      :title="currentAlert.title"
                      :description="currentAlert.description"
                      :type="currentAlert.type"
                      :closeable="false"
                    />
                  </div>

                  <div class="fr-fieldset__element">
                    <div class="fr-fieldset__element">
                      <span class="fr-hint-text">
                        Sauf mention contraire, tous les champs sont
                        obligatoires.
                      </span>
                    </div>
                    <div class="fr-fieldset">
                      <div class="fr-fieldset__element">
                        <DsfrInputGroup
                          v-model="email"
                          :error-message="emailError ?? undefined"
                          label="Identifiant"
                          :label-visible="true"
                          hint="Format attendu : nom@domaine.fr"
                        >
                          <template
                            #default="{ isInvalid, isValid, descriptionId }"
                          >
                            <DsfrInput
                              ref="emailInputFocusRef"
                              v-model="email"
                              autocomplete="username"
                              type="email"
                              name="email"
                              label="Identifiant"
                              :label-visible="true"
                              hint="Format attendu : nom@domaine.fr"
                              :is-invalid="isInvalid"
                              :is-valid="isValid"
                              :description-id="descriptionId"
                              aria-required="true"
                            />
                          </template>
                        </DsfrInputGroup>
                      </div>

                      <div class="fr-fieldset__element">
                        <div class="fr-password">
                          <div class="fr-input-wrap">
                            <PasswordInput
                              id="password"
                              ref="passwordInputFocusRef"
                              v-model="password"
                              class="password-input"
                              autocomplete="current-password"
                              label="Mot de passe"
                              name="password"
                              hint="Veuillez saisir votre mot de passe. Exemple: 3V@cancesAdaptées!"
                              :error-message="passwordError ?? undefined"
                              aria-required="true"
                            />
                          </div>
                          <p class="fr-mt-2v">
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
                    <div class="fr-btns-group">
                      <DsfrButton type="submit" :disabled="isLoggingIn">
                        {{ isLoggingIn ? "Connexion..." : "Se connecter" }}
                      </DsfrButton>
                    </div>
                  </div>
                </fieldset>
              </form>

              <div class="separator fr-mb-4v" />
              <h3>Vous n'avez pas de compte ?</h3>
              <div class="fr-btns-group">
                <DsfrButton
                  @click.prevent="navigateTo('/connexion/enregistrement')"
                >
                  Créer un compte
                </DsfrButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { USER_TARGET } from "@vao/shared-bridge";
import {
  PasswordInput,
  apiModel,
  CguValidation,
  useAuthentication,
  useLoginFormFocus,
} from "@vao/shared-ui";

const log = logger("pages/connexion");
const userStore = useUserStore();
const config = useRuntimeConfig();

const router = useRouter();
const route = useRoute();

const navigateTo = (route: string) => router.push(route);

useHead({
  title: "Connexion | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de connexion.",
    },
  ],
});

const organismeStore = useOrganismeStore();
const openCgu = computed(() => route.query.openCgu === "true");
const {
  email,
  password,
  displayType,
  isLoggingIn,
  login,
  validateCgu,
  refuseCgu,
  emailError,
  passwordError,
  submitAttempt,
} = useAuthentication(
  USER_TARGET.FO,
  config.public.backendUrl,
  userStore,
  navigateTo,
  organismeStore,
);

const { emailInputFocusRef, passwordInputFocusRef } = useLoginFormFocus(
  emailError,
  passwordError,
  submitAttempt,
);

const displayInfos = apiModel.connectionInfos;

const currentAlert = computed<{
  title: string;
  description: string;
  type: "error" | "success" | "warning" | "info";
} | null>(() => {
  if (!displayType.value) return null;

  if (displayType.value in displayInfos) {
    const alert = displayInfos[displayType.value as keyof typeof displayInfos];

    return {
      title: alert.title,
      description: alert.description,
      type: alert.type as "error" | "success" | "warning" | "info",
    };
  }

  return null;
});

onMounted(() => {
  if (userStore?.isConnected && !openCgu.value) {
    log.i("Utilisateur déjà connecté, redirection");
    navigateTo("/");
  }
});
</script>
