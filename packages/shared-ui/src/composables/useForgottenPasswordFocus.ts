import { ref, nextTick, watch, type Ref } from "vue";

export interface FocusableInput {
  focus: () => void;
}

export interface UseForgottenPasswordFocusReturn {
  emailInputRef: Ref<FocusableInput | null>;
}

export function useForgottenPasswordFocus(
  emailError: Ref<string | null>,
  submitAttempt: Ref<number>,
): UseForgottenPasswordFocusReturn {
  const emailInputRef = ref<FocusableInput | null>(null);

  async function focusFirstError() {
    await nextTick();
    if (emailError.value) {
      emailInputRef.value?.focus();
    }
  }

  watch(submitAttempt, async () => {
    if (emailError.value) {
      await focusFirstError();
    }
  });

  return { emailInputRef };
}
