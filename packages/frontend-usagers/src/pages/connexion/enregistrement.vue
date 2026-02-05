<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <form>
      <div class="fr-fieldset fr-grid-row fr-grid-row--center fr-my-5v">
        <h1
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          Demande de Création de compte organisateur
        </h1>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <p>
            L'inscription n'est pas automatique. Vous devrez valider votre
            email, puis votre demande sera prise en compte par les services
            compétents pour valider la création de votre compte
          </p>
          <p>
            Afin de respecter les meilleures pratiques et notamment les
            recommandations de la CNIL, nous recommandons l’utilisation
            d’adresses e-mail nominatives en lieu et place d’adresses génériques
            ou utilisées par plusieurs utilisateurs
          </p>
          <div class="fr-input-group">
            <DsfrInputGroup
              ref="siretInput"
              :error-message="emailField.errorMessage"
              :model-value="emailField.modelValue"
              type="text"
              label="Adresse courriel"
              name="email"
              :label-visible="true"
              placeholder="Veuillez saisir votre email"
              hint="Format attendu : nom@domaine.fr"
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
            <ul>
              <li :class="[isPwdLong ? 'fr-valid-text' : ' fr-error-text']">
                12 caractères minimum
                <span v-if="isPwdLong" class="fr-sr-only">
                  La règle est respectèe.
                </span>
              </li>
              <li :class="[isPwdMin ? 'fr-valid-text' : ' fr-error-text']">
                1 lettre minuscule minimum
                <span v-if="isPwdMin" class="fr-sr-only">
                  La règle est respectèe.
                </span>
              </li>
              <li :class="[isPwdMaj ? 'fr-valid-text' : ' fr-error-text']">
                1 lettre majuscule minimum
                <span v-if="isPwdMaj" class="fr-sr-only">
                  La règle est respectèe.
                </span>
              </li>
              <li :class="[isPwdNumber ? 'fr-valid-text' : ' fr-error-text']">
                1 chiffre minimum
                <span v-if="isPwdNumber" class="fr-sr-only">
                  La règle est respectèe.
                </span>
              </li>
              <li :class="[isPwdSpecial ? 'fr-valid-text' : ' fr-error-text']">
                1 caractère spécial minimum
                <span v-if="isPwdSpecial" class="fr-sr-only">
                  La règle est respectèe.
                </span>
              </li>
            </ul>
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
              hint="Veuillez saisir votre nom d'usage. Exemple: Martin"
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
              hint="Veuillez saisir votre prénom. Exemple: Jean"
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
              hint="Veuillez saisir votre numéro de téléphone. Exemple: 0612345678"
              :is-valid="telephoneField.isValid"
              @update:model-value="checkValidTelephone"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group siret-input-group">
            <DsfrInputGroup
              name="siret"
              label="SIRET"
              :label-visible="true"
              :model-value="siretField.modelValue"
              :is-valid="siretField.isValid"
              :error-message="siretField.errorMessage"
              placeholder=""
              hint="Veuillez indiquer le siret de l´organisme que vous souhaitez rejoindre. Exemple: 1100007200014"
              @update:model-value="checkValidSiret"
            />
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <ApiUnavailable
            :api-unavailable-types="useExternalApi.apisUnavailable"
            :display-types="[apiTypes.INSEE, apiTypes.ENTREPRISE]"
          ></ApiUnavailable>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <ul role="list" class="fr-btns-group fr-btns-group--right">
            <li role="listitem">
              <p>
                <NuxtLink to="/">J'ai déjà un compte</NuxtLink>
              </p>
            </li>
            <li role="listitem">
              <DsfrButton :disabled="!canRegister" @click.prevent="register"
                >Créer mon compte
              </DsfrButton>
            </li>
          </ul>
        </div>
        <div class="fr-messages-group" aria-live="assertive"></div>
      </div>
    </form>
  </div>
</template>

<script setup>
import "@vueform/multiselect/themes/default.css";
import { ERRORS_LOGIN } from "@vao/shared-bridge";
import { nextTick } from "vue";
import { ApiUnavailable, apiModel, useToaster } from "@vao/shared-ui";
const apiTypes = apiModel.apiTypes;

const log = logger("pages/connexion/enregistrement");

const toaster = useToaster();
const config = useRuntimeConfig();
const useExternalApi = useExternalApiStore();

const siretInput = ref(null);

try {
  await Promise.all([
    useExternalApi.checkApiInsee(),
    useExternalApi.checkApiEntreprise(),
  ]);
} catch {
  toaster.info("La détection de la disponibilité des API a échoué.");
}

const isApiAvailable =
  !useExternalApi.apisUnavailable.INSEE &&
  !useExternalApi.apisUnavailable.ENTREPRISE;

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

const siretField = reactive({
  errorMessage: "",
  modelValue: "",
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
    !email || emailField.isValid
      ? ""
      : "Cette adresse courriel semble incorrect";
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

const checkValidSiret = (siret) => {
  siretField.modelValue = siret;
  siretField.isValid = !siret || regex.siretRegex.test(siret);
  siretField.errorMessage =
    !siret || siretField.isValid
      ? ""
      : "Le numéro SIRET n'est pas au format attendu";
};

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
    telephoneField.isValid &&
    siretField.isValid &&
    isApiAvailable
  );
});

async function register() {
  const email = emailField.modelValue;
  const password = passwordField.modelValue;
  const nom = nomField.modelValue;
  const prenom = prenomField.modelValue;
  const telephone = telephoneField.modelValue;
  const siret = siretField.modelValue;
  log.i("register - IN");
  try {
    await $fetch(`${config.public.backendUrl}/authentication/email/register`, {
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
        siret,
      }),
    });

    toaster.success({
      titleTag: "h2",
      description:
        "Votre formulaire a été envoyé. Veuillez valider votre adresse mail en cliquant sur le lien reçu par mail.",
    });
    return navigateTo("/");
  } catch (error) {
    const statusCode = error.response?.status || error.statusCode || 0;
    const body = error.data;
    const codeError = body?.name;
    log.w("Erreur lors de l'enregistrement :", error);

    if (codeError === "EmailAlreadyExistsError") {
      toaster.error({
        titleTag: "h2",
        description:
          "Un compte existe déjà avec cette adresse mail. Veuillez vous connecter.",
      });
      return navigateTo("/");
    }

    if (statusCode === 500) {
      toaster.error({
        titleTag: "h2",
        description:
          "Une erreur technique est survenue, veuillez réessayer plus tard",
        role: "alert",
      });
    }

    let description = "";
    switch (codeError) {
      case "UserAlreadyExists":
        description =
          "Cette adresse courriel semble déjà utilisée. Rendez-vous sur la page de connexion pour vous identifier.";
        break;
      case "ValidationError":
        description =
          "Une erreur technique est survenue, veuillez réessayer plus tard";
        break;
      case "UnexpectedError":
        description =
          "Une erreur est survenue, peut être un compte existe-t-il déjà avec cet email ...";
        break;
      case ERRORS_LOGIN.SiretNotFound:
        description =
          body.message ||
          "Le SIRET fourni est inconnu. Veuillez vérifier et réessayer.";
        nextTick(() => {
          const inputElement = document.querySelector(
            ".siret-input-group input",
          );
          inputElement?.focus();
        });
        if (description) {
          toaster.error({
            titleTag: "h2",
            description,
            role: "alert",
          });
        }
        return;
    }
    if (description) {
      toaster.error({
        titleTag: "h2",
        description,
        role: "alert",
      });
    }
    throw error;
  }
}
</script>

<style lang="scss" scoped></style>
