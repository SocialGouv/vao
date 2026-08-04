import { ref, nextTick, watch, type Ref } from "vue";

interface FocusableInput {
  focus: () => void;
}

export interface UseLoginFormFocusReturn {
  emailInputFocusRef: Ref<FocusableInput | null>;
  passwordInputFocusRef: Ref<FocusableInput | null>;
}

export function useLoginFormFocus(
  emailError: Ref<string | null>,
  passwordError: Ref<string | null>,
  submitAttempt: Ref<number>,
): UseLoginFormFocusReturn {
  const emailInputFocusRef = ref<FocusableInput | null>(null);
  const passwordInputFocusRef = ref<FocusableInput | null>(null);

  async function focusFirstError() {
    await nextTick();
    if (emailError.value) {
      emailInputFocusRef.value?.focus();
    } else if (passwordError.value) {
      passwordInputFocusRef.value?.focus();
    }
  }

  watch(submitAttempt, async () => {
    if (emailError.value || passwordError.value) {
      await focusFirstError();
    }
  });

  return { emailInputFocusRef, passwordInputFocusRef };
}
