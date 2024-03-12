<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <div>
        <div
          v-if="formStatus === formStates.VALIDATED"
          class="fr-grid-row fr-grid-row--center fr-my-5v fr-col-12"
        >
          <DsfrAlert
            :title="displayInfos[displayType].title"
            :description="displayInfos[displayType].description"
            :type="displayInfos[displayType].type"
            :closeable="false"
          />
        </div>
        <div v-else>
          <form>
            <fieldset
              class="fr-fieldset fr-grid-row fr-grid-row--center fr-my-5v"
            >
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
                    :required="true"
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
                    autocomplete="off"
                    label="Mot de passe"
                    :required="true"
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
                    autocomplete="off"
                    :required="true"
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
                    :required="true"
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
                    :required="true"
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
                    :required="true"
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
                    <DsfrButton
                      :disabled="!canRegister"
                      @click.prevent="register"
                      >Créer mon compte
                    </DsfrButton>
                  </li>
                </ul>
              </div>
              <div class="fr-messages-group" aria-live="assertive"></div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import "@vueform/multiselect/themes/default.css";
const log = logger("pages/connexion/email/enregistrement");

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

const formStates = {
  CREATION: 1,
  SUBMITTED: 2,
  VALIDATED: 3,
};

const formStatus = ref(formStates.CREATION);

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

const displayInfos = {
  CreationDoneWithSucces: {
    title: "Votre compte a été créé avec succès",
    description:
      "Veuillez consulter votre boite mail afin de procéder à la validation de votre compte organisateur VAO.",
    type: "success",
  },
  DefaultError: {
    title: "Une erreur est survenue",
    description:
      "Une erreur est survenue. Si vous pensez que cette adresse mail est déjà utilisée, cliquez sur “je souhaite me connecter avec mes identifiants“ puis “Mot de passe oublié”",
    type: "error",
  },
};
const displayType = ref("DefaultError");

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
  formStatus.value = formStates.CREATION;
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
        displayType.value = "CreationDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        log.d("register", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.code;

        log.w("register", { body, codeError });
        switch (codeError) {
          default:
            displayType.value = "DefaultError";
            formStatus.value = formStates.VALIDATED;
            break;
        }
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("register", { error });
    displayType.value = "DefaultError";
    formStatus.value = formStates.SUBMITTED;
  } finally {
    log.i("register - DONE");
  }
}
</script>

<style lang="scss" scoped></style>
