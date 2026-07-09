import { ref, nextTick, watch, type Ref } from "vue";

export interface FocusableInput {
  focus: () => void;
}

export interface UseLoginFormFocusReturn {
  emailInputRef: Ref<FocusableInput | null>;
  passwordInputRef: Ref<FocusableInput | null>;
}

export function useLoginFormFocus(
  emailError: Ref<string | null>,
  passwordError: Ref<string | null>,
  submitAttempt: Ref<number>,
): UseLoginFormFocusReturn {
  const emailInputRef = ref<FocusableInput | null>(null);
  const passwordInputRef = ref<FocusableInput | null>(null);

  async function focusFirstError() {
    await nextTick();
    if (emailError.value) {
      emailInputRef.value?.focus();
    } else if (passwordError.value) {
      passwordInputRef.value?.focus();
    }
  }

  watch(submitAttempt, async () => {
    if (emailError.value || passwordError.value) {
      await focusFirstError();
    }
  });

  return { emailInputRef, passwordInputRef };
}
