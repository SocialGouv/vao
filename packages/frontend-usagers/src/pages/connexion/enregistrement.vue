<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />

    <div>
      <h1>Créer mon compte</h1>
      <div v-if="formStatus === formStates.VALIDATED">
        <DsfrAlert
          class="fr-my-3v"
          :title="displayInfos[displayType].title"
          :description="displayInfos[displayType].description"
          :type="displayInfos[displayType].type"
          :closeable="false"
        />
      </div>
      <div v-else>
        <div class="fr-grid-row fr-grid-row--center fr-my-5v">
          <div class="fr-col-12 fr-col-md-9 fr-col-lg-9">
            <div class="fr-container fr-mt-5v">
              <div class="fr-grid-row fr-grid-row--center">
                <div
                  v-if="formStatus === formStates.CREATION"
                  class="fr-col-12 fr-alert fr-alert--info"
                >
                  <p>Les champs suivis d'un astérisque sont obligatoires</p>
                </div>
              </div>
              <div v-if="formStatus === formStates.SUBMITTED">
                <DsfrAlert
                  class="fr-my-3v"
                  :title="displayInfos[displayType].title"
                  :description="displayInfos[displayType].description"
                  :type="displayInfos[displayType].type"
                  :closeable="false"
                />
              </div>
              <div class="fr-grid-row fr-grid-row--center">
                <form class="fr-col-12">
                  <fieldset class="fr-fieldset">
                    <div class="fr-fieldset__element fr-col-12">
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
                    <div class="fr-fieldset__element fr-col-12">
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
                          placeholder="Veuillez saisir votre mot de passe"
                          :is-valid="passwordField.isValid"
                          @update:model-value="checkValidPassword"
                        />
                      </div>
                      <div
                        v-if="!passwordField.isValid"
                        class="fr-messages-group"
                        aria-live="assertive"
                      >
                        <p class="fr-message">
                          Votre mot de passe doit contenir :
                        </p>
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
                    <div class="fr-fieldset__element fr-col-12">
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
                          placeholder="Veuillez répéter le mot de passe"
                          :is-valid="confirmField.isValid"
                          @update:model-value="
                            (confirm) => (confirmField.modelValue = confirm)
                          "
                        />
                      </div>
                    </div>

                    <div
                      class="fr-fieldset__element fr-fieldset__element--inline fr-col-12"
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
                          placeholder="Veuillez saisir votre nom"
                          :is-valid="nomField.isValid"
                          @update:model-value="checkValidNom"
                        />
                      </div>
                    </div>

                    <div
                      class="fr-fieldset__element fr-fieldset__element--inline fr-col-6"
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
                          placeholder="Veuillez saisir votre prénom"
                          :is-valid="prenomField.isValid"
                          @update:model-value="checkValidPrenom"
                        />
                      </div>
                    </div>

                    <!-- <div class="fr-fieldset__element">
                      <div
                        id="botdetect-captcha"
                        data-captchastylename="numerique6_7CaptchaFR"
                      ></div>
                      <DsfrInput
                        id="captchaFormulaireExtInput"
                        name="captcha"
                        label="Captcha"
                        type="text"
                        placeholder=""
                        :label-visible="true"
                        :model-value="captchaFormulaireExtInput.modelValue"
                        :error-message="captchaFormulaireExtInput.errorMessage"
                        :is-valid="captchaFormulaireExtInput.isValid"
                        @update:model-value="checkValidCaptcha"
                      />
                    </div> -->

                    <div class="fr-fieldset__element">
                      <ul class="fr-btns-group fr-btns-group--right">
                        <li>
                          <p>
                            <NuxtLink to="/"
                              >J'ai déjà un compte</NuxtLink
                            >
                          </p>
                        </li>
                        <li>
                          <DsfrButton
                            :disabled="!canRegister"
                            @click.prevent="register"
                            >Créer mon compte</DsfrButton
                          >
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import "@vueform/multiselect/themes/default.css";
const log = logger("pages/connexion/email/enregistrement");

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

// const captchaFormulaireExtInput = reactive({
//   errorMessage: "",
//   modelValue: null,
//   isValid: false,
// });

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const pwdRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*)(<>,~;])(?=.{12,})/;
const pwdRegexSpecial = /^(?=.*[!@#$%^&*)(<>,~;])/;
const pwdRegexNumber = /^(?=.*[0-9])/;
const pwdRegexMaj = /^(?=.*[A-Z])/;
const pwdRegexMin = /^(?=.*[a-z])/;
const nomRegex = /^[A-Za-z'-]+$/;

const isPwdLong = ref(false);
const isPwdSpecial = ref(false);
const isPwdNumber = ref(false);
const isPwdMaj = ref(false);
const isPwdMin = ref(false);

// const headerForm = ref(null);
const displayInfos = {
  CreationDoneWithSucces: {
    title: "Votre compte a été créé avec succès",
    description:
      "Veuillez consulter votre boîte mail afin de procéder à la validation votre compte.",
    type: "success",
  },
  // CaptchaError: {
  //   title: "Erreur de saisie du captcha",
  //   description:
  //     "Le code saisit est erroné. Merci de remplir à nouveau le captcha.",
  //   type: "error",
  // },
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
  emailField.isValid = !email || emailRegex.test(email);
  emailField.errorMessage =
    !email || emailField.isValid ? "" : "Cet email semble incorrect";
}

function checkValidPassword(pwd) {
  passwordField.modelValue = pwd;
  passwordField.isValid = !pwd || pwdRegex.test(pwd);

  isPwdLong.value = pwd.length > 11;
  isPwdSpecial.value = pwdRegexSpecial.test(pwd);
  isPwdNumber.value = pwdRegexNumber.test(pwd);
  isPwdMaj.value = pwdRegexMaj.test(pwd);
  isPwdMin.value = pwdRegexMin.test(pwd);
}

function checkValidNom(n) {
  nomField.modelValue = n;
  nomField.isValid = n !== null && nomRegex.test(n);
  nomField.errorMessage =
    !n || nomField.isValid ? "" : "Le nom contient des caractères incorrects";
}

function checkValidPrenom(p) {
  prenomField.modelValue = p;
  prenomField.isValid = p !== null && nomRegex.test(p);
  prenomField.errorMessage =
    !p || prenomField.isValid
      ? ""
      : "Le prénom contient des caractères incorrects";
}

// function checkValidCaptcha(catpcha) {
//   captchaFormulaireExtInput.modelValue = catpcha;
//   captchaFormulaireExtInput.isValid = catpcha;
//   captchaFormulaireExtInput.errorMessage =
//     catpcha || captchaFormulaireExtInput.isValid
//       ? ""
//       : "Le captcha doit être saisie";
// }

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
  }
);

const canRegister = computed(() => {
  return (
    passwordField.isValid &&
    confirmField.isValid &&
    emailField.isValid &&
    nomField.isValid &&
    prenomField.isValid
    // captchaFormulaireExtInput.isValid
  );
});

async function register() {
  // log.d($("#botdetect-captcha"));
  formStatus.value = formStates.CREATION;
  const email = emailField.modelValue;
  const password = passwordField.modelValue;
  const nom = nomField.modelValue;
  const prenom = prenomField.modelValue;
  log.i("register - IN");
  try {
    // Le code entré par l’utilisateur récupéré en backend
    // const userEnteredCaptchaCode = captcha.getUserEnteredCaptchaCode();
    // id du captcha que l’utilisateur a tenté de résoudre
    // const captchaId = captcha.getCaptchaId();

    await $fetch("/front-server/authentication/email/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        nom,
        prenom,
        // userEnteredCaptchaCode,
        // captchaId,
      }),
    })
      .then((response) => {
        // Reset captcha
        // captcha.reloadImage();
        // checkValidCaptcha(null);
        displayType.value = "CreationDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        log.d("register", { response });
      })
      .catch((error) => {
        // Reset captcha
        // captcha.reloadImage();
        // checkValidCaptcha(null);
        const body = error.data;
        const codeError = body.code;

        log.w("register", { body, codeError });
        switch (codeError) {
          // case "CaptchaError":
          //   displayType.value = "CaptchaError";
          //   formStatus.value = formStates.VALIDATED;
          //   break;
          default:
            displayType.value = "DefaultError";
            formStatus.value = formStates.VALIDATED;
            break;
        }
        // headerForm.value.scrollIntoView({ behavior: "smooth" });
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

// let captcha;

onMounted(() => {
  // captcha = $("#botdetect-captcha").captcha({
  //   captchaEndpoint: `/front-server/captcha/simple-captcha-endpoint`,
  // });
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
