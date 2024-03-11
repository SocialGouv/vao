<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <h1>Mot de passe oublié</h1>
      <div v-if="displayType !== null">
        <DsfrAlert
          class="fr-my-3v"
          :title="displayInfos[displayType].title"
          :description="displayInfos[displayType].description"
          :type="displayInfos[displayType].type"
          :closeable="false"
        />
      </div>
      <div class="fr-grid-row fr-grid-row--center">
        <form class="fr-col-12 fr-col-md-9 fr-col-lg-9">
          <fieldset class="fr-fieldset">
            <div class="fr-fieldset__element fr-col-12">
              <div class="fr-input-group">
                <DsfrInputGroup
                  :model-value="email"
                  type="text"
                  label="Email"
                  :label-visible="true"
                  placeholder="Veuillez saisir votre email"
                  @update:model-value="editMail"
                />
              </div>
            </div>
            <div class="fr-fieldset__element fr-my-5v">
              <DsfrButton
                :disabled="!isValidEmail"
                @click.prevent="askNewPassword"
                >Réinitialiser mon mot de passe</DsfrButton
              >
            </div>
          </fieldset>
        </form>
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

const isValidEmail = computed(() => {
  return regex.emailRegex.test(email.value);
});

const editMail = (v) => (email.value = v);

const displayInfos = {
  Success: {
    title: "Email envoyé",
    description:
      "Si un compte est rattaché à cette adresse électronique, vous allez recevoir un courriel dans quelques instants. Il vous permettra de réinitialiser votre mot de passe en quelques clics",
    type: "success",
  },
  DefaultError: {
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
      config.public.backendUrl + "/authentication/email/forgotten-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.value }),
      },
    )
      .then(() => {
        log.i("askNewPassword - Done");
        displayType.value = "Success";
      })
      .catch((error) => {
        log.w("askNewPassword", { error });
        displayType.value = "DefaultError";
      });
  } catch (error) {
    log.w("login", { error });
    displayType.value = "DefaultError";
  } finally {
    log.i("finally");
  }
}
</script>

<style lang="scss" scoped></style>
