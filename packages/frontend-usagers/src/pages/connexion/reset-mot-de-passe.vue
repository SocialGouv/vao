<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div v-if="displayType !== null">
      <DsfrAlert
        class="fr-my-3v"
        :role="displayType === 'EditDoneWithSucces' ? 'status' : 'alert'"
        :title="displayInfos[displayType].title"
        :description="displayInfos[displayType].description"
        :type="displayInfos[displayType].type"
        :closeable="false"
      />
    </div>
    <div v-if="displayType !== 'EditDoneWithSucces'">
      <h1>Réinitialisation du mot de passe</h1>
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
                        disabled
                      />
                    </div>
                  </div>
                  <div class="fr-fieldset__element fr-col-12">
                    <div class="fr-input-group">
                      <DsfrInputGroup
                        :error-message="passwordField.errorMessage"
                        :model-value="passwordField.modelValue"
                        type="password"
                        autocomplete="new-password"
                        label="Mot de passe"
                        :label-visible="true"
                        placeholder="Veuillez saisir votre mot de passe"
                        :is-valid="passwordField.isValid"
                        required
                        @update:model-value="checkValidPassword"
                      />
                    </div>
                    <div class="fr-messages-group" aria-live="assertive">
                      <p class="fr-message">
                        Votre mot de passe doit contenir :
                      </p>
                      <ul>
                        <li
                          :class="[
                            isPwdLong ? 'fr-valid-text' : ' fr-error-text',
                          ]"
                        >
                          12 caractères minimum
                          <span v-if="isPwdLong" class="fr-sr-only">
                            La règle est respectèe.
                          </span>
                        </li>
                        <li
                          :class="[
                            isPwdMin ? 'fr-valid-text' : ' fr-error-text',
                          ]"
                        >
                          1 lettre minuscule minimum
                          <span v-if="isPwdMin" class="fr-sr-only">
                            La règle est respectèe.
                          </span>
                        </li>
                        <li
                          :class="[
                            isPwdMaj ? 'fr-valid-text' : ' fr-error-text',
                          ]"
                        >
                          1 lettre majuscule minimum
                          <span v-if="isPwdMaj" class="fr-sr-only">
                            La règle est respectèe.
                          </span>
                        </li>
                        <li
                          :class="[
                            isPwdNumber ? 'fr-valid-text' : ' fr-error-text',
                          ]"
                        >
                          1 chiffre minimum
                          <span v-if="isPwdNumber" class="fr-sr-only">
                            La règle est respectèe.
                          </span>
                        </li>
                        <li
                          :class="[
                            isPwdSpecial ? 'fr-valid-text' : ' fr-error-text',
                          ]"
                        >
                          1 caractère spécial minimum
                          <span v-if="isPwdSpecial" class="fr-sr-only">
                            La règle est respectèe.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="fr-fieldset__element fr-col-12">
                    <div class="fr-input-group">
                      <DsfrInputGroup
                        :error-message="confirmField.errorMessage"
                        :model-value="confirmField.modelValue"
                        type="password"
                        autocomplete="new-password"
                        label="Confirmation mot de passe"
                        :label-visible="true"
                        placeholder="Veuillez saisir le même mot de passe que précédemment"
                        :is-valid="confirmField.isValid"
                        @update:model-value="
                          (confirm) => (confirmField.modelValue = confirm)
                        "
                      />
                    </div>
                  </div>
                  <div class="fr-fieldset__element">
                    <ul role="list" class="fr-btns-group fr-btns-group--right">
                      <li role="listitem">
                        <DsfrButton
                          :disabled="!canRenewPassword"
                          @click.prevent="renewPassword"
                          >Changer mon mot de passe
                        </DsfrButton>
                      </li>
                    </ul>
                  </div>
                  <div class="fr-messages-group" aria-live="assertive"></div>
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
const log = logger("pages/connexion/enregistrement");
const route = useRoute();

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
useHead({
  title: "Réinitialisation de mot de passe | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de réinitialisation de mot de passe.",
    },
  ],
});

const emailToken = route.query.token;

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

const email = parseJwt(emailToken).email;

const passwordField = reactive({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const confirmField = reactive({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const isPwdLong = ref(false);
const isPwdSpecial = ref(false);
const isPwdNumber = ref(false);
const isPwdMaj = ref(false);
const isPwdMin = ref(false);

const displayInfos = {
  EditDoneWithSucces: {
    title: "Votre mot de passe a bien été modifié",
    description:
      "Vous pouvez maintenant vous connecter en utilisant votre nouveau mot de passe.",
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

function checkValidPassword(pwd) {
  passwordField.modelValue = pwd;
  passwordField.isValid = !pwd || regex.pwdRegex.test(pwd);

  isPwdLong.value = pwd.length > 11;
  isPwdSpecial.value = regex.pwdRegexSpecial.test(pwd);
  isPwdNumber.value = regex.pwdRegexNumber.test(pwd);
  isPwdMaj.value = regex.pwdRegexMaj.test(pwd);
  isPwdMin.value = regex.pwdRegexMin.test(pwd);
}

watch(
  [() => passwordField.modelValue, () => confirmField.modelValue],
  function () {
    log.i(passwordField.modelValue, confirmField.modelValue);
    confirmField.isValid =
      confirmField.modelValue &&
      confirmField.modelValue === passwordField.modelValue;

    confirmField.errorMessage =
      !confirmField.modelValue ||
      confirmField.modelValue === passwordField.modelValue
        ? ""
        : "Les mots-de-passe diffèrent";
  },
);

const canRenewPassword = computed(() => {
  return passwordField.isValid && confirmField.isValid;
});

async function renewPassword() {
  displayType.value = null;
  const password = passwordField.modelValue;
  log.i("renewPassword", { email, password });
  try {
    const url = `${config.public.backendUrl}/authentication/email/renew-password?token=${emailToken}`;
    await $fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { password },
    })
      .then((response) => {
        displayType.value = "EditDoneWithSucces";
        log.i("renewPassword", { response });
      })
      .catch((error) => {
        displayType.value = "UnexpectedError";
        log.w("renewPassword", { error });
      });
  } catch (error) {
    log.w("renewPassword", { error });
    displayType.value = "UnexpectedError";
  }
}
</script>

<style lang="scss" scoped></style>
