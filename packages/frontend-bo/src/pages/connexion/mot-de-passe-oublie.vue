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
              <form class="fr-col-12">
                <div class="fr-fieldset">
                  <div class="fr-fieldset__element fr-col-12">
                    <div class="fr-input-group">
                      <DsfrInputGroup
                        :model-value="email"
                        type="text"
                        label="Adresse courriel"
                        :label-visible="true"
                        placeholder=""
                        hint="Veuillez saisir votre adresse courriel. Exemple nom@domaine.fr"
                        @update:model-value="editMail"
                      />
                    </div>
                  </div>
                  <div class="fr-fieldset__element fr-my-5v">
                    <DsfrButton
                      :disabled="!isValidEmail"
                      @click.prevent="askNewPassword"
                      >Renouveler mon mot de passe</DsfrButton
                    >
                  </div>
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
const log = logger("pages/connexion/mot-de-passe-oublie");

const config = useRuntimeConfig();

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
    text: "Mot de passe oublié",
  },
];

const email = ref("");

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const isValidEmail = computed(() => {
  return emailRegex.test(email.value);
});

const editMail = (v) => (email.value = v);

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
const displayType = ref(null);

async function askNewPassword() {
  log.i("askNewPassword", { email: email.value });
  try {
    displayType.value = null;
    await $fetch(
      config.public.backendUrl + "/bo-authentication/email/forgotten-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { email: email.value },
      },
    )
      .then(() => {
        log.i("askNewPassword - Done");
        displayType.value = "Success";
      })
      .catch((error) => {
        log.w("askNewPassword", { error });
        displayType.value = "UnexpectedError";
      });
  } catch (error) {
    log.w("login", { error });
    displayType.value = "UnexpectedError";
  } finally {
    log.i("finally");
  }
}
</script>

<style lang="scss" scoped></style>
