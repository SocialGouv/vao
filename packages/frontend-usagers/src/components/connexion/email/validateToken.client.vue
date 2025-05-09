<template>
  <div class="fr-container">
    <p v-if="isSuccess">
      <DsfrAlert
        role="alert"
        class="fr-grid-row fr-my-3v"
        type="success"
        :closeable="false"
      >
        <h3>
          <p>Votre adresse courriel est maintenant activée</p>
          <p>Votre compte est en cours de validation.</p>
        </h3>
      </DsfrAlert>
    </p>
    <div v-else-if="classError">
      <DsfrAlert
        role="alert"
        class="fr-grid-row fr-my-3v"
        type="error"
        :closeable="false"
      >
        <h3>Erreur lors de la validation du compte</h3>
        <span v-if="classError === 'TokenExpiredError'"
          >Le lien utilisé est déjà expiré. Cliquer sur le bouton « Générer un
          nouveau lien »</span
        >
        <span v-if="classError === 'UserAlreadyVerified'">
          L'adresse courriel semble déjà vérifiée. Votre inscription est en
          attente de validation.
          <NuxtLink class="fr-link" to="/connexion/">
            la page de connexion
          </NuxtLink>
          pour vous identifier.
        </span>
      </DsfrAlert>
      <DsfrButton
        v-if="classError === 'TokenExpiredError'"
        class="fr-grid-row fr-grid-row--center fr-my-5v"
        @click.prevent="renewToken"
        >Générer un nouveau lien
      </DsfrButton>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ token: { type: String, required: true } });
const log = logger("components/connexion/email/validationToken");

const toaster = useToaster();

const config = useRuntimeConfig();

const classError = ref("");

const isSuccess = ref(false);

const init = async () => {
  const { data, error } = await useFetchBackend(
    `${config.public.backendUrl}/authentication/email/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { token: props.token },
    },
  );
  if (error?.value) {
    classError.value = error.value.data.name;
    return;
  }

  const isNeedingSiretValidation =
    data.value.status === "NEED_SIRET_VALIDATION";
  const message = isNeedingSiretValidation
    ? "Votre demande a bien été envoyée, votre inscription est en attente de validation"
    : // if user has no siret, legacy way to create account
      "Votre compte est maintenant activé. Vous allez être redirigé vers la page de connexion pour terminer votre inscription.";
  toaster.success({
    titleTag: "h2",
    description: message,
  });
  // legacy way to create account
  if (!isNeedingSiretValidation) {
    return navigateTo("/connexion");
  }
  isSuccess.value = true;
};

init();

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

async function renewToken() {
  log.i("renew - IN");
  const decoded = parseJwt(props.token);
  await $fetch(config.public.backendUrl + "/authentication/email/renew-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: decoded.email }),
  })
    .then(() => {
      toaster.success({
        titleTag: "h2",
        description: `Un nouveau courriel de validation a été envoyé sur votre boîte de courriel.`,
      });
      log.i("renew - Done");
    })
    .catch((error) => {
      toaster.error({
        titleTag: "h2",
        description: `Une erreur est survenue lors de l'envoi de du courriel. Veuillez contacter l'assistance.`,
      });
      log.w("renew", error);
    });
}
</script>

<style lang="scss" scoped></style>
