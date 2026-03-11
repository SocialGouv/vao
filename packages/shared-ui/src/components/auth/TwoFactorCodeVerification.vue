<template>
  <div class="two-factor-verification">
    <h1 id="2fa-title" class="fr-h4">
      <span aria-hidden="true" class="fr-icon-lock-line fr-pr-1v"></span>
      Vérification sécurisée
    </h1>
    <template v-if="isLocked">
      <DsfrAlert
        role="alert"
        class="fr-grid-row fr-my-3v"
        title="3 tentatives erronées"
        title-tag="h2"
        :description="`Vous pourrez demander un nouveau code dans 15 minutes, à ${unlockAtDisplay}, depuis cette page. Merci de patienter.`"
        type="warning"
        :closeable="false"
      />
    </template>
    <template v-else>
      <p class="fr-text--sm fr-mb-3v">
        <strong>
          Important : Un code a été envoyé à l'adresse e-mail partiellement
          masquée {{ maskedEmail }}.
        </strong>
      </p>

      <div class="fr-fieldset">
        <div
          class="fr-fieldset__element"
          :class="{ 'has-error': hasValidationError }"
        >
          <label id="code-label" for="code-input-0" class="fr-label">
            Code de sécurité valable 30 minutes
            <span id="code-hint" class="fr-sr-only">
              Saisissez les 6 chiffres du code reçu par email
            </span>
          </label>

          <span class="fr-hint-text">
            Code valable jusqu'à {{ expirationTime }}.
            <span v-if="remainingAttempts < maxAttempts">
              Vous avez {{ remainingAttempts }} tentative{{
                remainingAttempts > 1 ? "s" : ""
              }}
              de saisie.
            </span>
            <span v-else>
              Vous avez {{ maxAttempts }} tentatives de saisie.
            </span>
          </span>

          <div
            class="code-inputs-container fr-mt-2v"
            :class="{ 'has-error': hasValidationError }"
            role="group"
            aria-labelledby="code-label"
          >
            <input
              v-for="(digit, index) in codeDigits"
              :id="`code-input-${index}`"
              :key="index"
              :ref="(el) => setInputRef(el as HTMLInputElement, index)"
              v-model="codeDigits[index]"
              type="text"
              inputmode="numeric"
              pattern="[0-9]"
              maxlength="1"
              class="code-input"
              :class="{ 'input-error': hasValidationError }"
              :aria-label="`Chiffre ${index + 1} sur 6`"
              :aria-invalid="hasValidationError"
              autocomplete="off"
              @input="handleInput(index, $event as InputEvent)"
              @keydown="handleKeydown(index, $event as KeyboardEvent)"
              @paste="handlePaste($event as ClipboardEvent)"
              @focus="handleFocus(index)"
            />
          </div>
          <p v-if="hasValidationError" class="fr-mt-5v fr-message--error">
            Le code est erroné. Veuillez vérifier et le ressaisir. Il vous reste
            {{ remainingAttempts }} tentative{{
              remainingAttempts > 1 ? "s" : ""
            }}.
          </p>
        </div>

        <div class="fr-fieldset__element fr-mt-4v">
          <div class="fr-checkbox-group">
            <input
              id="remember-device"
              v-model="rememberDevice"
              type="checkbox"
              name="remember-device"
            />
            <label class="fr-label" for="remember-device">
              Cocher cette case pour ne plus saisir de code pendant 30 jours
              depuis cet appareil.
            </label>
          </div>
        </div>

        <div class="fr-fieldset__element fr-mt-4v">
          <ul role="list" class="btns-group">
            <li role="listitem">
              <DsfrButton secondary :disabled="!canResend" @click="resendCode">
                Renvoyer un code
              </DsfrButton>
            </li>
            <li role="listitem">
              <DsfrButton @click="validateCode"> Valider </DsfrButton>
            </li>
          </ul>

          <div
            v-if="liveMessage"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            class="fr-sr-only"
          >
            {{ liveMessage }}
          </div>

          <div v-if="resendTimer > 0" class="fr-text--xs" aria-hidden="true">
            Vous pourrez demander un nouveau code dans
            {{ resendTimer }} secondes.
          </div>
        </div>
      </div>
    </template>

    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-mt-3v">
        <DsfrAccordion
          id="accordeon-1"
          title="Besoin d'aide ?"
          :title-tag="'h2'"
        >
          <h3 class="fr-text--lg">
            Si vous avez des difficultés de saisie du code :
          </h3>
          <ul>
            <li>
              Recopiez le code exactement comme reçu (uniquement des chiffres)
            </li>
            <li>Ne mettez pas d'espace avant ou après le code</li>
            <li>Vérifiez que tous les chiffres sont saisis</li>
            <li>Attention aux confusions : 0 (zéro) / O, 1 / l, 5 / S</li>
            <li>Si vous copiez-collez, vérifiez que le code est complet</li>
            <li>Utilisez le code le plus récent reçu</li>
            <li>Le code expire après 30 minutes</li>
          </ul>
            <hr class="fr-mt-5v" />
          <h3 class="fr-text--lg">
            Si vous n'avez pas reçu votre code de connexion :
          </h3>
          <ul class="list-style-none">
            <li>
              <span
                class="fr-icon-mail-forbid-fill fr-mr-1v"
                aria-hidden="true"
              ></span>
              Vérifiez les courriers indésirables de votre boite e-mail
            </li>
            <li>
              <span class="fr-icon-at-fill fr-mr-1v" aria-hidden="true"></span>
              Vérifiez l'adresse e-mail saisie
            </li>
            <li>
              <span
                class="fr-icon-send-plane-fill fr-mr-1v"
                aria-hidden="true"
              ></span>
              Demandez un nouveau code
            </li>
            <li>
              <span
                aria-hidden="true"
                class="fr-icon-question-fill fr-mr-1v"
              ></span>
              Si le problème persiste vous pouvez
              <a
                title="libellé du lien - nouvelle fenêtre"
                href="https://vao-assistance.atlassian.net/servicedesk/customer/portals"
                target="_blank"
                rel="noopener external"
                class="fr-link"
              >
                Contacter le support
                <span class="fr-sr-only"> - nouvel onglet</span>
              </a>
            </li>
          </ul>
        </DsfrAccordion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import createLogger from "../../utils/createLogger";

interface Props {
  maskedEmail: string;
  loading?: boolean;
  maxAttempts?: number;
  expirationTime?: string | null;
  unlockAt?: string | Date | null;
}

interface Emits {
  (e: "validate", payload: { code: string; rememberDevice: boolean }): void;
  (e: "resend" | "help"): void;
}

interface ErrorMessage {
  type: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  maxAttempts: 3,
  expirationTime: null,
  unlockAt: null,
});

const logger = createLogger("vao-shared-ui");
const emit = defineEmits<Emits>();
const log = logger("components/auth/TwoFactorVerification");

const codeDigits = ref<string[]>(["", "", "", "", "", ""]);
const inputRefs = ref<HTMLInputElement[]>([]);
const rememberDevice = ref<boolean>(false);
const errorMessage = ref<ErrorMessage | null>(null);
const resendTimer = ref<number>(0);
let resendInterval: ReturnType<typeof setInterval> | null = null;
const hasRequestedCode = ref<boolean>(false);

const liveMessage = ref<string | null>(null);

const attemptCount = ref<number>(0);

const isCodeComplete = computed<boolean>(() => {
  return codeDigits.value.every(
    (digit: string) => digit !== "" && /^\d$/.test(digit),
  );
});

const fullCode = computed<string>(() => {
  return codeDigits.value.join("");
});

const isLocked = computed(() => remainingAttempts.value === 0);

const unlockAtDisplay = computed(() => {
  if (!props.unlockAt) return "";
  const date =
    typeof props.unlockAt === "string"
      ? new Date(props.unlockAt)
      : props.unlockAt;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const remainingAttempts = computed<number>(() => {
  return Math.max(0, props.maxAttempts - attemptCount.value);
});

const hasValidationError = computed<boolean>(() => {
  return errorMessage.value?.type === "error";
});

const canResend = computed(() => resendTimer.value === 0);

const setInputRef = (el: HTMLInputElement | null, index: number): void => {
  if (el) {
    inputRefs.value[index] = el;
  }
};

onMounted(() => {
  nextTick(() => {
    if (inputRefs.value[0]) {
      inputRefs.value[0].focus();
    }
  });
});

onBeforeUnmount(() => {
  if (resendInterval) {
    clearInterval(resendInterval);
    resendInterval = null;
  }
});

const handleInput = (index: number, event: InputEvent): void => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (errorMessage.value) {
    clearError();
  }

  const sanitized = value.replace(/\D/g, "");

  if (sanitized.length > 0) {
    codeDigits.value[index] = sanitized[0];

    if (index < 5) {
      nextTick(() => {
        inputRefs.value[index + 1]?.focus();
      });
    }
  } else {
    codeDigits.value[index] = "";
  }
};

const handleKeydown = (index: number, event: KeyboardEvent): void => {
  const key = event.key;

  if (key === "Backspace") {
    if (codeDigits.value[index] === "" && index > 0) {
      event.preventDefault();
      codeDigits.value[index - 1] = "";
      inputRefs.value[index - 1]?.focus();
    } else {
      codeDigits.value[index] = "";
    }
  }

  if (key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    inputRefs.value[index - 1]?.focus();
  }

  if (key === "ArrowRight" && index < 5) {
    event.preventDefault();
    inputRefs.value[index + 1]?.focus();
  }

  if (key === "Enter" && isCodeComplete.value) {
    event.preventDefault();
    validateCode();
  }
};

const handlePaste = (event: ClipboardEvent): void => {
  event.preventDefault();

  const pastedData = event.clipboardData?.getData("text") || "";
  const digits = pastedData.replace(/\D/g, "").slice(0, 6);

  if (digits.length > 0) {
    if (errorMessage.value) {
      clearError();
    }

    digits.split("").forEach((digit, index) => {
      if (index < 6) {
        codeDigits.value[index] = digit;
      }
    });

    const nextIndex = Math.min(digits.length, 5);
    nextTick(() => {
      inputRefs.value[nextIndex]?.focus();
    });

    log.i("handlePaste", { digitsCount: digits.length });
  }
};

const handleFocus = (index: number): void => {
  inputRefs.value[index]?.select();
};

const clearError = (): void => {
  errorMessage.value = null;
};

const validateCode = (): void => {
  log.i("validateCode - début", {
    code: fullCode.value,
    isComplete: isCodeComplete.value,
    remainingAttempts: remainingAttempts.value,
  });

  if (remainingAttempts.value === 0) {
    errorMessage.value = {
      type: "error",
      title: "Trop de tentatives",
      description:
        "Vous avez épuisé vos tentatives. Veuillez demander un nouveau code.",
    };
    log.w("validateCode - aucune tentative restante");
    return;
  }

  if (!isCodeComplete.value) {
    errorMessage.value = {
      type: "error",
      title: "Code incomplet",
      description: "Veuillez saisir les 6 chiffres du code.",
    };
    log.w("validateCode - code incomplet", { code: fullCode.value });

    const firstEmptyIndex = codeDigits.value.findIndex(
      (digit: string) => digit === "",
    );
    if (firstEmptyIndex !== -1) {
      inputRefs.value[firstEmptyIndex]?.focus();
    }
    return;
  }

  const hasNonDigit = codeDigits.value.some(
    (digit: string) => !/^\d$/.test(digit),
  );
  if (hasNonDigit) {
    errorMessage.value = {
      type: "error",
      title: "Format invalide",
      description: "Le code doit contenir uniquement des chiffres (0-9).",
    };
    log.w("validateCode - caractères non-numériques détectés");
    return;
  }

  attemptCount.value++;

  log.i("validateCode - validation côté client OK", {
    code: fullCode.value,
    attemptNumber: attemptCount.value,
    remainingAfter: remainingAttempts.value,
    rememberDevice: rememberDevice.value,
  });

  emit("validate", {
    code: fullCode.value,
    rememberDevice: rememberDevice.value,
  });
};

const resendCode = (): void => {
  if (resendTimer.value > 0) return;
  hasRequestedCode.value = true;

  emit("resend");
};

const setError = (error: ErrorMessage): void => {
  if (error.type === "error" && remainingAttempts.value > 0) {
    errorMessage.value = {
      ...error,
      description: `${error.description} Il vous reste ${remainingAttempts.value} tentative${remainingAttempts.value > 1 ? "s" : ""}.`,
    };
  } else {
    errorMessage.value = error;
  }

  log.w("setError", {
    error,
    remainingAttempts: remainingAttempts.value,
    attemptCount: attemptCount.value,
  });

  nextTick(() => {
    if (inputRefs.value[0]) {
      inputRefs.value[0].focus();
      inputRefs.value[0].select();
    }
  });
};

const reset = (): void => {
  codeDigits.value = ["", "", "", "", "", ""];
  rememberDevice.value = false;
  errorMessage.value = null;
  attemptCount.value = 0;
  hasRequestedCode.value = false;

  liveMessage.value = null;

  if (resendInterval) {
    clearInterval(resendInterval);
    resendInterval = null;
  }
  resendTimer.value = 0;

  log.i("reset - composant réinitialisé");

  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
};

const decrementAttempts = (): void => {
  if (attemptCount.value > 0) {
    attemptCount.value--;
    log.i("decrementAttempts", { newCount: attemptCount.value });
  }
};

const setAttemptCount = (count: number): void => {
  attemptCount.value = Math.max(0, count);
  log.i("setAttemptCount", { count: attemptCount.value });
};

const startResendTimer = (): void => {
  resendTimer.value = 30;

  if (resendInterval) {
    clearInterval(resendInterval);
  }

  liveMessage.value = "";

  nextTick(() => {
    setTimeout(() => {
      liveMessage.value =
        "Vous pourrez demander un nouveau code dans 30 secondes.";
    }, 200);
  });

  resendInterval = setInterval(() => {
    resendTimer.value = Math.max(0, resendTimer.value - 1);

    if (resendTimer.value === 0) {
      if (resendInterval) {
        clearInterval(resendInterval);
        resendInterval = null;
      }

      liveMessage.value = "";
      nextTick(() => {
        setTimeout(() => {
          liveMessage.value =
            "Vous pouvez maintenant demander un nouveau code.";
        }, 200);
      });
    }
  }, 1000);
};

defineExpose({
  setError,
  reset,
  decrementAttempts,
  setAttemptCount,
  startResendTimer,
});
</script>

<style lang="scss" scoped>
.two-factor-verification {
  margin: 0 auto;
}

.code-inputs-container {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;

  @media (max-width: 576px) {
    gap: 0.5rem;
  }
}

.code-input {
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid var(--light-decisions-border-border-plain-grey, #3a3a3a);
  transition: border-color 0.3s ease;

  @media (max-width: 576px) {
    width: 2.5rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  &:focus {
    outline: none;
    border-color: var(--border-active-blue-france, #0a76f6);
    box-shadow: 0 0 0 2px rgba(10, 118, 246, 0.2);
  }

  &.input-error {
    border-color: var(--border-error, #ce0500);

    &:focus {
      border-color: var(--border-error, #ce0500);
    }
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.btns-group {
  list-style: none;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  gap: 1rem;
}

.has-error {
  color: var(--text-default-error);
}

.has-error span,
.has-error label {
  color: var(--text-default-error);
}

.fr-fieldset__element.has-error {
  border-left: 2px solid var(--text-default-error);
}

.list-style-none {
  list-style: none;
  padding-left: 0;
}
</style>
