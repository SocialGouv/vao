import { ref, watch } from "vue";
import { $fetch } from "ofetch";
import createLogger from "../utils/createLogger";
import { buildEmailError } from "../utils/auth";

export type ForgottenPasswordType = "fo" | "bo";
export type ForgottenPasswordDisplayType = "Success" | "UnexpectedError" | null;

export interface UseForgottenPasswordReturn {
  email: Ref<string>;
  emailError: Ref<string | null>;
  isSubmitting: Ref<boolean>;
  submitAttempt: Ref<number>;
  displayType: Ref<ForgottenPasswordDisplayType>;
  askNewPassword: () => Promise<void>;
}

interface ForgottenPasswordConfig {
  endpoint: string;
}

function getForgottenPasswordConfig(
  type: ForgottenPasswordType,
): ForgottenPasswordConfig {
  if (type === "bo") {
    return {
      endpoint: "/bo-authentication/email/forgotten-password",
    };
  }
  return {
    endpoint: "/authentication/email/forgotten-password",
  };
}

const EMAIL_ERROR_MESSAGES = {
  empty:
    "Le champ « Adresse courriel » est vide. Veuillez renseigner votre adresse courriel. Exemple : nom@domaine.fr",
  invalid:
    "Le champ « Adresse courriel » est incorrect. Veuillez saisir une adresse au format nom@domaine.fr",
};

export function getForgottenPasswordEmailError(email: string): string | null {
  return buildEmailError(email, EMAIL_ERROR_MESSAGES);
}

export function useForgottenPassword(
  type: ForgottenPasswordType,
  backendUrl: string,
): UseForgottenPasswordReturn {
  const logger = createLogger("vao-shared-ui");
  const log = logger(`composables/useForgottenPassword-${type.toUpperCase()}`);

  const authConfig = getForgottenPasswordConfig(type);

  const email = ref<string>("");
  const emailError = ref<string | null>(null);
  const isSubmitting = ref<boolean>(false);
  const submitAttempt = ref<number>(0);
  const displayType = ref<ForgottenPasswordDisplayType>(null);

  watch(email, () => {
    if (emailError.value) {
      emailError.value = null;
    }
  });

  async function askNewPassword(): Promise<void> {
    log.i("askNewPassword", { email: email.value });

    submitAttempt.value++;
    emailError.value = getForgottenPasswordEmailError(email.value);

    if (emailError.value) {
      log.w("askNewPassword - validation échouée", {
        emailError: emailError.value,
      });
      return;
    }

    isSubmitting.value = true;
    displayType.value = null;

    try {
      await $fetch(backendUrl + authConfig.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { email: email.value },
      });
      log.i("askNewPassword - succès");
      displayType.value = "Success";
    } catch (error) {
      log.w("askNewPassword - erreur", { error });
      displayType.value = "UnexpectedError";
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    email,
    emailError,
    isSubmitting,
    submitAttempt,
    displayType,
    askNewPassword,
  };
}
