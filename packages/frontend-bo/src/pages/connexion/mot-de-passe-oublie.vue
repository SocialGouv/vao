<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <h1>Mot de passe oublié</h1>
      <div v-if="displayType !== null">
        <DsfrAlert
          class="fr-my-3v"
          :role="displayType === 'Success' ? 'status' : 'alert'"
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
              <form
                class="fr-col-12"
                novalidate
                @submit.prevent="askNewPassword"
              >
                <fieldset class="fr-fieldset">
                  <legend class="fr-fieldset__legend fr-sr-only">
                    Demande de réinitialisation de mot de passe
                  </legend>

                  <div class="fr-fieldset__element fr-col-12">
                    <DsfrInputGroup :error-message="emailError ?? undefined">
                      <template
                        #default="{ isInvalid, isValid, descriptionId }"
                      >
                        <DsfrInput
                          ref="emailInputRef"
                          v-model="email"
                          autocomplete="username"
                          type="email"
                          name="email"
                          label="Adresse courriel"
                          :label-visible="true"
                          hint="Format attendu : nom@domaine.fr"
                          :is-invalid="isInvalid"
                          :is-valid="isValid"
                          :description-id="descriptionId"
                        />
                      </template>
                    </DsfrInputGroup>
                  </div>
                </fieldset>
                <div class="fr-fieldset__element fr-my-5v">
                  <DsfrButton type="submit" :disabled="isSubmitting">
                    Renouveler mon mot de passe
                  </DsfrButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  useForgottenPassword,
  useForgottenPasswordFocus,
} from "@vao/shared-ui";

const config = useRuntimeConfig();

const links = [
  { to: "/", text: "Accueil" },
  { to: "/connexion", text: "Connexion" },
  { text: "Mot de passe oublié" },
];

const {
  email,
  emailError,
  isSubmitting,
  submitAttempt,
  displayType,
  askNewPassword,
} = useForgottenPassword("bo", config.public.backendUrl);

const { emailInputRef } = useForgottenPasswordFocus(emailError, submitAttempt);

const displayInfos = {
  Success: {
    title: "Courriel envoyé",
    description:
      "Un courriel a été envoyé sur la boîte mail à l'adresse renseignée si un compte y est rattaché . Veuillez le consulter pour réinitialiser votre mot de passe",
    type: "success",
  },
  UnexpectedError: {
    title: "Une erreur est survenue",
    description:
      "Le service ne semble pas répondre. Veuillez réessayer ultérieurement",
    type: "error",
  },
};
</script>

<style lang="scss" scoped></style>
