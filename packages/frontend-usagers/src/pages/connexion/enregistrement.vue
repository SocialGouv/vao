<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <form>
      <fieldset class="fr-fieldset fr-grid-row fr-grid-row--center fr-my-5v">
        <h1
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          Créer mon compte
        </h1>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="emailField.errorMessage"
              :model-value="emailField.modelValue"
              type="text"
              label="Email"
              name="email"
              :label-visible="true"
              placeholder="Veuillez saisir votre email"
              :is-valid="emailField.isValid"
              @update:model-value="checkValidEmail"
            />
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="passwordField.errorMessage"
              :model-value="passwordField.modelValue"
              type="password"
              name="new-password"
              autocomplete="new-password"
              label="Mot de passe"
              :label-visible="true"
              placeholder=""
              hint="Veuillez saisir votre mot de passe"
              :is-valid="passwordField.isValid"
              @update:model-value="checkValidPassword"
            />
          </div>
          <div
            v-if="!passwordField.isValid"
            class="fr-messages-group"
            aria-live="assertive"
          >
            <p class="fr-message">Votre mot de passe doit contenir :</p>
            <div class="fr-grid-row">
              <p
                :class="[
                  'fr-col-6 fr-message',
                  isPwdLong ? 'fr-valid-text' : ' fr-error-text',
                ]"
              >
                12 caractères minimum
              </p>
              <p
                :class="[
                  'fr-col-6 fr-message',
                  isPwdMin ? 'fr-valid-text' : ' fr-error-text',
                ]"
              >
                1 lettre minuscule minimum
              </p>
              <p
                :class="[
                  'fr-col-6 fr-message',
                  isPwdMaj ? 'fr-valid-text' : ' fr-error-text',
                ]"
              >
                1 lettre majuscule minimum
              </p>
              <p
                :class="[
                  'fr-col-6 fr-message',
                  isPwdNumber ? 'fr-valid-text' : ' fr-error-text',
                ]"
              >
                1 chiffre minimum
              </p>
              <p
                :class="[
                  'fr-col-6 fr-message',
                  isPwdSpecial ? 'fr-valid-text' : ' fr-error-text',
                ]"
              >
                1 caractère spécial minimum
              </p>
            </div>
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="confirmField.errorMessage"
              :model-value="confirmField.modelValue"
              type="password"
              name="repeat-password"
              autocomplete="new-password"
              label="Confirmation mot de passe"
              :label-visible="true"
              placeholder=""
              hint="Veuillez répéter le mot de passe"
              :is-valid="confirmField.isValid"
              @update:model-value="
                (confirm) => (confirmField.modelValue = confirm)
              "
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="nomField.errorMessage"
              :model-value="nomField.modelValue"
              type="text"
              label="Nom"
              name="nom"
              :label-visible="true"
              placeholder=""
              hint="Veuillez saisir votre nom d'usage"
              :is-valid="nomField.isValid"
              @update:model-value="checkValidNom"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="prenomField.errorMessage"
              :model-value="prenomField.modelValue"
              type="text"
              label="Prénom"
              name="prenom"
              :label-visible="true"
              hint="Veuillez saisir votre prénom"
              placeholder=""
              :is-valid="prenomField.isValid"
              @update:model-value="checkValidPrenom"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="telephoneField.errorMessage"
              :model-value="telephoneField.modelValue"
              type="text"
              label="Numéro de téléphone"
              name="telephone"
              :label-visible="true"
              hint="Veuillez saisir votre numéro de téléphone"
              :is-valid="telephoneField.isValid"
              @update:model-value="checkValidTelephone"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <ul class="fr-btns-group fr-btns-group--right">
            <li>
              <p>
                <NuxtLink to="/">J'ai déjà un compte</NuxtLink>
              </p>
            </li>
            <li>
              <DsfrButton :disabled="!canRegister" @click.prevent="register"
                >Créer mon compte
              </DsfrButton>
            </li>
          </ul>
        </div>
        <div class="fr-messages-group" aria-live="assertive"></div>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import "@vueform/multiselect/themes/default.css";
const log = logger("pages/connexion/enregistrement");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
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
    text: "Création de compte",
  },
];

useHead({
  title: "Création de compte | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de création de compte.",
    },
  ],
});
const emailField = reactive({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

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

const nomField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const prenomField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const telephoneField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const isPwdLong = ref(false);
const isPwdSpecial = ref(false);
const isPwdNumber = ref(false);
const isPwdMaj = ref(false);
const isPwdMin = ref(false);

function checkValidEmail(email) {
  emailField.modelValue = email;
  emailField.isValid = !email || regex.emailRegex.test(email);
  emailField.errorMessage =
    !email || emailField.isValid ? "" : "Cet email semble incorrect";
}

function checkValidPassword(pwd) {
  passwordField.modelValue = pwd;
  passwordField.isValid = !pwd || regex.pwdRegex.test(pwd);

  isPwdLong.value = pwd.length > 11;
  isPwdSpecial.value = regex.pwdRegexSpecial.test(pwd);
  isPwdNumber.value = regex.pwdRegexNumber.test(pwd);
  isPwdMaj.value = regex.pwdRegexMaj.test(pwd);
  isPwdMin.value = regex.pwdRegexMin.test(pwd);
}

function checkValidNom(n) {
  nomField.modelValue = n;
  nomField.isValid =
    n !== null &&
    regex.acceptedCharsRegex.test(n) &&
    !regex.doubleSpacesRegex.test(n) &&
    !regex.spaceFollowingDashRegex.test(n) &&
    !regex.tripleDashRegex.test(n);
  nomField.errorMessage =
    !n || nomField.isValid ? "" : "Le nom contient des caractères incorrects";
}

function checkValidPrenom(p) {
  prenomField.modelValue = p;
  prenomField.isValid =
    p !== null &&
    regex.acceptedCharsRegex.test(p) &&
    !regex.doubleSpacesRegex.test(p) &&
    !regex.spaceFollowingDashRegex.test(p) &&
    !regex.doubleDashRegex.test(p);
  prenomField.errorMessage =
    !p || prenomField.isValid
      ? ""
      : "Le prénom contient des caractères incorrects";
}

function checkValidTelephone(p) {
  telephoneField.modelValue = p;
  telephoneField.isValid = p !== null && regex.numTelephoneRegex.test(p);
  telephoneField.errorMessage =
    !p || telephoneField.isValid
      ? ""
      : "Le numéro de téléphone n'est pas au format attendu";
}

watch(
  [() => passwordField.modelValue, () => confirmField.modelValue],
  function () {
    confirmField.isValid =
      confirmField.modelValue &&
      confirmField.modelValue === passwordField.modelValue;

    confirmField.errorMessage =
      !confirmField.modelValue ||
      confirmField.modelValue === passwordField.modelValue
        ? ""
        : "Les mots de passe diffèrent";
  },
);

const canRegister = computed(() => {
  return (
    passwordField.isValid &&
    confirmField.isValid &&
    emailField.isValid &&
    nomField.isValid &&
    prenomField.isValid &&
    telephoneField.isValid
  );
});

async function register() {
  const email = emailField.modelValue;
  const password = passwordField.modelValue;
  const nom = nomField.modelValue;
  const prenom = prenomField.modelValue;
  const telephone = telephoneField.modelValue;
  log.i("register - IN");
  try {
    await $fetch(config.public.backendUrl + "/authentication/email/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        nom,
        prenom,
        telephone,
      }),
    })
      .then((response) => {
        log.d("register", { response });
        toaster.success(
          "Félicitations, votre compte a bien été créé ! Veuillez le valider en cliquant sur le lien reçu par email",
        );
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.name;
        log.w("register", { body, codeError });
        if (codeError === "ValidationError") {
          toaster.error(
            "Une erreur technique est survenue, veuillez réessayer plus tard",
          );
        }
        if (codeError === "UnexpectedError") {
          toaster.error(
            "Une erreur est survenue, peut être un compte existe-t-il déjà avec cet email ...",
          );
        }

        if (codeError === "MailError") {
          toaster.error(
            "Une erreur est survenue, le mail d'activation n'a pu vous être envoyé. Veuillez utiliser la fonction 'mot de passe oublié'",
          );
        }
      });
    return navigateTo("/");
  } catch (error) {
    log.w("register", { error });
  }
}
</script>

<style lang="scss" scoped></style>
