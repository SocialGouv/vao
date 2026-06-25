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
            L’inscription n’est pas automatique. Vous devrez valider votre
            email, puis votre demande sera prise en compte par les services
            compétents pour valider la création de votre compte
          </p>
          <p>
            Afin de respecter les meilleures pratiques et notamment les
            recommandations de la CNIL, nous recommandons l’utilisation
            d'adresses e-mail nominatives en lieu et place d’adresses génériques
            ou utilisées par plusieurs utilisateurs
          </p>
          <div class="fr-mb-6v">
            <p class="fr-hint-text">Tous les champs sont obligatoires.</p>
          </div>

          <div id="field-email" class="fr-input-group">
            <DsfrInputGroup
              :error-message="emailField.errorMessage"
              :model-value="emailField.modelValue"
              type="text"
              label="Adresse courriel"
              name="email"
              :label-visible="true"
              placeholder=""
              hint="Format attendu : nom@domaine.fr"
              :is-valid="emailField.isValid"
              aria-required="true"
              @update:model-value="checkValidEmail"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div id="field-password" class="fr-input-group">
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
              aria-required="true"
              @update:model-value="checkValidPassword"
            />
          </div>
          <div
            v-if="passwordField.modelValue && !passwordField.isValid"
            class="fr-messages-group"
            aria-live="assertive"
          >
            <p class="fr-message">Votre mot de passe doit contenir :</p>
            <ul>
              <li
                :class="[isPwdRules.long ? 'fr-valid-text' : 'fr-error-text']"
              >
                12 caractères minimum
                <span v-if="isPwdRules.long" class="fr-sr-only">
                  La règle est respectée.
                </span>
              </li>
              <li :class="[isPwdRules.min ? 'fr-valid-text' : 'fr-error-text']">
                1 lettre minuscule minimum
                <span v-if="isPwdRules.min" class="fr-sr-only">
                  La règle est respectée.
                </span>
              </li>
              <li :class="[isPwdRules.maj ? 'fr-valid-text' : 'fr-error-text']">
                1 lettre majuscule minimum
                <span v-if="isPwdRules.maj" class="fr-sr-only">
                  La règle est respectée.
                </span>
              </li>
              <li
                :class="[isPwdRules.number ? 'fr-valid-text' : 'fr-error-text']"
              >
                1 chiffre minimum
                <span v-if="isPwdRules.number" class="fr-sr-only">
                  La règle est respectée.
                </span>
              </li>
              <li
                :class="[
                  isPwdRules.special ? 'fr-valid-text' : 'fr-error-text',
                ]"
              >
                1 caractère spécial minimum
                <span v-if="isPwdRules.special" class="fr-sr-only">
                  La règle est respectée.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div id="field-confirm" class="fr-input-group">
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
              aria-required="true"
              @update:model-value="
                (confirm: string) => {
                  confirmField.modelValue = confirm;
                }
              "
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div id="field-nom" class="fr-input-group">
            <DsfrInputGroup
              :error-message="nomField.errorMessage"
              :model-value="nomField.modelValue"
              type="text"
              label="Nom"
              name="nom"
              :label-visible="true"
              placeholder=""
              hint="Veuillez saisir votre nom d'usage. Exemple: Martin"
              aria-required="true"
              :is-valid="nomField.isValid"
              @update:model-value="checkValidNom"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div id="field-prenom" class="fr-input-group">
            <DsfrInputGroup
              :error-message="prenomField.errorMessage"
              :model-value="prenomField.modelValue"
              type="text"
              label="Prénom"
              name="prenom"
              :label-visible="true"
              hint="Veuillez saisir votre prénom. Exemple: Jean"
              placeholder=""
              aria-required="true"
              :is-valid="prenomField.isValid"
              @update:model-value="checkValidPrenom"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div id="field-telephone" class="fr-input-group">
            <DsfrInputGroup
              :error-message="telephoneField.errorMessage"
              :model-value="telephoneField.modelValue"
              type="text"
              label="Numéro de téléphone"
              name="telephone"
              :label-visible="true"
              hint="Veuillez saisir votre numéro de téléphone. Exemple: 0612345678"
              :is-valid="telephoneField.isValid"
              aria-required="true"
              @update:model-value="checkValidTelephone"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div id="field-siret" class="fr-input-group siret-input-group">
            <DsfrInputGroup
              ref="siretInputRef"
              name="siret"
              label="SIRET"
              :label-visible="true"
              :model-value="siretField.modelValue"
              :is-valid="siretField.isValid"
              :error-message="siretField.errorMessage"
              placeholder=""
              aria-required="true"
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
          />
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
              <DsfrButton @click.prevent="register">
                Créer mon compte
              </DsfrButton>
            </li>
          </ul>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import "@vueform/multiselect/themes/default.css";
import { ERRORS_LOGIN } from "@vao/shared-bridge";
import { nextTick } from "vue";
import { ApiUnavailable, apiModel, useToaster } from "@vao/shared-ui";
import type { DsfrInputGroup } from "@gouvminint/vue-dsfr";

interface FieldState {
  errorMessage: string;
  modelValue: string;
  isValid: boolean;
}

interface PwdRules {
  long: boolean;
  special: boolean;
  number: boolean;
  maj: boolean;
  min: boolean;
}

interface ApiError {
  response?: { status: number };
  statusCode?: number;
  data?: { name: string; message?: string };
}

const apiTypes = apiModel.apiTypes;
const log = logger("pages/connexion/enregistrement");
const toaster = useToaster();
const config = useRuntimeConfig();
const useExternalApi = useExternalApiStore();

const siretInputRef = ref<InstanceType<typeof DsfrInputGroup> | null>(null);

const submitted = ref(false);

try {
  await Promise.all([
    useExternalApi.checkApiInsee(),
    useExternalApi.checkApiEntreprise(),
  ]);
} catch {
  toaster.error({
    titleTag: "h2",
    description:
      "La détection de la disponibilité des API a échoué. Veuillez réessayer plus tard.",
    role: "alert",
  });
}

const isApiAvailable =
  !useExternalApi.apisUnavailable.INSEE &&
  !useExternalApi.apisUnavailable.ENTREPRISE;

const links = [
  { to: "/", text: "Accueil" },
  { to: "/connexion", text: "Connexion" },
  { text: "Création de compte" },
];

useHead({
  title: "Création de compte | Vacances Adaptées Organisées",
  meta: [{ name: "description", content: "Page de création de compte." }],
});

const emailField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const passwordField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const confirmField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const nomField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const prenomField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const telephoneField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const siretField = reactive<FieldState>({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const isPwdRules = reactive<PwdRules>({
  long: false,
  special: false,
  number: false,
  maj: false,
  min: false,
});

const isFormValid = computed(
  () =>
    emailField.isValid &&
    passwordField.isValid &&
    confirmField.isValid &&
    nomField.isValid &&
    prenomField.isValid &&
    telephoneField.isValid &&
    siretField.isValid &&
    isApiAvailable,
);

watch(
  [() => passwordField.modelValue, () => confirmField.modelValue, submitted],
  () => {
    confirmField.isValid =
      !!confirmField.modelValue &&
      confirmField.modelValue === passwordField.modelValue;
    confirmField.errorMessage = resolveErrorMessage(
      confirmField.modelValue,
      confirmField.isValid,
      'Le champ "Confirmation mot de passe" est vide. Veuillez répéter votre mot de passe. Exemple : 3V@cancesAdaptées!',
      "Les mots de passe ne correspondent pas.",
    );
  },
);

function resolveErrorMessage(
  value: string,
  isValid: boolean,
  emptyMessage: string,
  invalidMessage: string,
): string {
  if (isValid) return "";
  if (!value) return submitted.value ? emptyMessage : "";
  return invalidMessage;
}

function checkValidEmail(email: string) {
  emailField.modelValue = email;
  emailField.isValid = !!email && regex.emailRegex.test(email);
  emailField.errorMessage = resolveErrorMessage(
    email,
    emailField.isValid,
    'Le champ "Adresse courriel" est vide. Veuillez renseigner votre adresse courriel. Exemple : nom@domaine.fr',
    'Le champ "Adresse courriel" est invalide. Vérifiez le format attendu. Exemple : nom@domaine.fr',
  );
}

function checkValidPassword(pwd: string) {
  passwordField.modelValue = pwd;
  passwordField.isValid = !!pwd && regex.pwdRegex.test(pwd);

  isPwdRules.long = pwd.length > 11;
  isPwdRules.special = regex.pwdRegexSpecial.test(pwd);
  isPwdRules.number = regex.pwdRegexNumber.test(pwd);
  isPwdRules.maj = regex.pwdRegexMaj.test(pwd);
  isPwdRules.min = regex.pwdRegexMin.test(pwd);

  passwordField.errorMessage = resolveErrorMessage(
    pwd,
    passwordField.isValid,
    'Le champ "Mot de passe" est vide. Veuillez renseigner votre mot de passe. Exemple : 3V@cancesAdaptées!',
    'Le champ "Mot de passe" ne respecte pas les critères requis.',
  );
}

function checkValidNom(nom: string) {
  nomField.modelValue = nom;
  nomField.isValid =
    !!nom &&
    regex.acceptedCharsRegex.test(nom) &&
    !regex.doubleSpacesRegex.test(nom) &&
    !regex.spaceFollowingDashRegex.test(nom) &&
    !regex.tripleDashRegex.test(nom);
  nomField.errorMessage = resolveErrorMessage(
    nom,
    nomField.isValid,
    'Le champ "Nom" est vide. Veuillez saisir votre nom d\'usage. Exemple : Martin',
    'Le champ "Nom" contient des caractères incorrects. Exemple : Martin',
  );
}

function checkValidPrenom(prenom: string) {
  prenomField.modelValue = prenom;
  prenomField.isValid =
    !!prenom &&
    regex.acceptedCharsRegex.test(prenom) &&
    !regex.doubleSpacesRegex.test(prenom) &&
    !regex.spaceFollowingDashRegex.test(prenom) &&
    !regex.doubleDashRegex.test(prenom);
  prenomField.errorMessage = resolveErrorMessage(
    prenom,
    prenomField.isValid,
    'Le champ "Prénom" est vide. Veuillez saisir votre prénom d\'usage. Exemple : Jean',
    'Le champ "Prénom" contient des caractères incorrects. Exemple : Jean',
  );
}

function checkValidTelephone(telephone: string) {
  telephoneField.modelValue = telephone;
  telephoneField.isValid =
    !!telephone && regex.numTelephoneRegex.test(telephone);
  telephoneField.errorMessage = resolveErrorMessage(
    telephone,
    telephoneField.isValid,
    'Le champ "Numéro de téléphone" est vide. Veuillez saisir votre numéro de téléphone. Exemple : 0612030405',
    'Le champ "Numéro de téléphone" est invalide. Veuillez saisir un numéro à 10 chiffres. Exemple : 0612345678 ou +33612345678',
  );
}

function checkValidSiret(siret: string) {
  siretField.modelValue = siret;

  if (!siret) {
    siretField.isValid = false;
    siretField.errorMessage = submitted.value
      ? 'Le champ "SIRET" est vide. Veuillez saisir le SIRET de l\'organisme que vous souhaitez rejoindre. Exemple : 1100007200014'
      : "";
    return;
  }

  // teste caractères non numériques
  if (!/^\d+$/.test(siret)) {
    siretField.isValid = false;
    siretField.errorMessage =
      "Champ SIRET incorrect. Supprimez les espaces ou caractères spéciaux. Le SIRET doit contenir uniquement des chiffres.";
    return;
  }

  // test sur la longueur
  if (siret.length !== 14) {
    siretField.isValid = false;
    siretField.errorMessage =
      "Champ SIRET incorrect. Vérifiez le nombre de chiffres et saisissez exactement 14 chiffres.";
    return;
  }

  siretField.isValid = true;
  siretField.errorMessage = "";
}

function validateAllFields() {
  checkValidEmail(emailField.modelValue);
  checkValidPassword(passwordField.modelValue);
  checkValidNom(nomField.modelValue);
  checkValidPrenom(prenomField.modelValue);
  checkValidTelephone(telephoneField.modelValue);
  checkValidSiret(siretField.modelValue);
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null;
}

async function register(): Promise<void> {
  submitted.value = true;
  validateAllFields();

  if (!isFormValid.value) {
    return;
  }

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nom, prenom, telephone, siret }),
    });

    toaster.success({
      titleTag: "h2",
      description:
        "Votre formulaire a été envoyé. Veuillez valider votre adresse mail en cliquant sur le lien reçu par mail.",
    });
    await navigateTo("/");
  } catch (error: unknown) {
    if (!isApiError(error)) {
      log.w("Erreur inattendue non-objet lors de l'inscription", error);
      toaster.error({
        titleTag: "h2",
        description:
          "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        role: "alert",
      });
      return;
    }

    const statusCode = error.response?.status ?? error.statusCode ?? 0;

    if (statusCode === 500) {
      toaster.error({
        titleTag: "h2",
        description:
          "Une erreur technique est survenue, veuillez réessayer plus tard",
        role: "alert",
      });
      return;
    }

    const codeError = error.data?.name;
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
          error.data?.message ||
          "Champ SIRET incorrect. Vérifiez le numéro fourni par votre entreprise. Le SIRET de votre entité doit être valide.";
        toaster.error({ titleTag: "h2", description, role: "alert" });
        await nextTick();
        siretInputRef.value?.$el?.querySelector("input")?.focus();
        return;
    }

    if (description) {
      toaster.error({ titleTag: "h2", description, role: "alert" });
      return;
    }

    log.w("Erreur backend non gérée lors de l'inscription", error);
    toaster.error({
      titleTag: "h2",
      description:
        "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
      role: "alert",
    });
  }
}
</script>

<style lang="scss" scoped></style>
