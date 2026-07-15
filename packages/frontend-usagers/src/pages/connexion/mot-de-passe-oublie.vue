<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <h1>Demande de réinitialisation de mot de passe</h1>
      <div v-if="displayType !== null">
        <DsfrAlert
          class="fr-my-3v"
          :role="displayType === 'Success' ? 'status' : 'alert'"
          :title="displayInfos[displayType].title"
          :description="displayInfos[displayType].description"
          :type="
            displayInfos[displayType].type === 'success' ? 'success' : 'error'
          "
          :closeable="false"
        />
      </div>
      <div class="fr-grid-row fr-grid-row--center">
        <form
          class="fr-col-12 fr-col-md-9 fr-col-lg-9"
          novalidate
          @submit.prevent="askNewPassword"
        >
          <fieldset class="fr-fieldset">
            <legend class="fr-fieldset__legend fr-sr-only">
              Demande de réinitialisation de mot de passe
            </legend>
            <div class="fr-fieldset__element fr-col-12">
              <DsfrInputGroup :error-message="emailError ?? undefined">
                <template #default="{ isInvalid, isValid, descriptionId }">
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
              Réinitialiser mon mot de passe
            </DsfrButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

useHead({
  title: "Mot de passe oublié | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de demande de réinitialisation de mot de passe.",
    },
  ],
});

const {
  email,
  emailError,
  isSubmitting,
  submitAttempt,
  displayType,
  askNewPassword,
} = useForgottenPassword("fo", config.public.backendUrl);

const { emailInputRef } = useForgottenPasswordFocus(emailError, submitAttempt);

const displayInfos = {
  Success: {
    title: "Courriel envoyé",
    description:
      "Si un compte est rattaché à cette adresse électronique, vous allez recevoir un courriel dans quelques instants. Il vous permettra de réinitialiser votre mot de passe en quelques clics",
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
