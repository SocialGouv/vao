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
              <h2>Portail Administration</h2>

              <form id="login-form" @submit.prevent="login">
                <div
                  class="fr-fieldset"
                  aria-labelledby="login-fieldset-legend login-fieldset-messages"
                >
                  <legend
                    id="login-fieldset-legend"
                    class="fr-fieldset__legend"
                  >
                    <h2>Se connecter avec son compte agent de l'État</h2>
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
                    <div
                      class="fr-fieldset"
                      aria-labelledby="credentials-messages"
                    >
                      <div class="fr-fieldset__element">
                        <span class="fr-hint-text">
                          Sauf mention contraire, tous les champs sont
                          obligatoires.
                        </span>
                      </div>

                      <div class="fr-fieldset__element">
                        <div class="fr-input-group">
                          <DsfrInput
                            v-model="email"
                            autocomplete="email"
                            type="text"
                            name="email"
                            label="Identifiant"
                            :label-visible="true"
                            hint="Format attendu : nom@domaine.fr"
                            required
                          />
                        </div>
                      </div>

                      <div class="fr-fieldset__element">
                        <div class="fr-password">
                          <div class="fr-input-wrap">
                            <PasswordInput
                              id="password"
                              v-model="password"
                              autocomplete="current-password"
                              label="Mot de passe"
                              name="password"
                              hint="Veuillez saisir votre mot de passe"
                              required
                            />
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
                          type="submit"
                          :disabled="!canLogin || isLoggingIn"
                        >
                          {{ isLoggingIn ? "Connexion..." : "Se connecter" }}
                        </DsfrButton>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>

              <hr />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import {
  PasswordInput,
  apiModel,
  CguValidation,
  useAuthentication,
} from "@vao/shared-ui";

const log = logger("pages/bo/connexion");
const userStore = useUserStore();
const config = useRuntimeConfig();

useHead({
  title: "VAO - Connexion Portail Administration",
  meta: [
    {
      name: "description",
      content: "Page de connexion au portail administration.",
    },
  ],
});

const {
  email,
  password,
  displayType,
  openCgu,
  isLoggingIn,

  canLogin,

  login,
  validateCgu,
  refuseCgu,
} = useAuthentication("bo", config.public.backendUrl);

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
  if (userStore?.isConnected) {
    log.i("Utilisateur déjà connecté, redirection");
    navigateTo("/");
  }
});
</script>
