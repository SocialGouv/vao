<template>
  <div class="fr-container fr-container--fluid fr-my-md-14v">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-mt-8v fr-mt-md-2v fr-col-10 fr-col-md-8 fr-col-lg-6">
        <h1>Portail Administration</h1>
        <TwoFactorCodeVerification
          ref="twoFactorRef"
          :masked-email="maskedEmail"
          :unlock-at="unlockAt"
          :otp-attempts="otpAttempts"
          :otp-code-expires-at="otpCodeExpiresAt"
          :loading="isVerifying2FA"
          @validate="handleVerify2FA"
          @resend="handleResendCode"
          @cancel="handleCancel2FA"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { TwoFactorCodeVerification, useAuthentication } from "@vao/shared-ui";
import type { Verify2FAPayload } from "@vao/shared-ui/types/Auth.type";
import { maskEmail } from "@vao/shared-ui/utils/auth";
import { addMinutes, getFunctionalErrorMessage } from "@vao/shared-bridge";

const log = logger("pages/connexion/verification-otp");
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const userStore = useUserStore();

const navigateTo = (route: string) => router.push(route);

useHead({
  title: "Vérification en deux étapes - Portail Administration | VAO",
  meta: [
    {
      name: "description",
      content: "Saisissez le code de vérification reçu par email.",
    },
  ],
});

const email = computed<string>(() => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("otp-email-bo") || "";
  }
  return "";
});
const otpAttempts = computed(() => {
  return Number(route.query?.otpAttempts ?? 0);
});
const otpAttemptsAt = computed<string | null>(() => {
  const v = route.query?.otpAttemptsAt;

  if (Array.isArray(v)) {
    return v[0] ?? null;
  }
  return v ?? null;
});

const unlockAt = computed(() => {
  if (
    otpAttemptsAt.value === "null" ||
    otpAttemptsAt.value === undefined ||
    otpAttemptsAt.value === "undefined"
  ) {
    return null;
  } else {
    return addMinutes(
      new Date(otpAttemptsAt.value ?? new Date()),
      15,
    )?.toISOString();
  }
});

const maskedEmail = computed<string>(() => {
  return maskEmail(email.value);
});

const otpCodeExpiresAt = computed<string>(() => {
  const v = route.query?.otpCodeExpiresAt;
  if (Array.isArray(v)) return v[0] ?? "";
  return (v as string) ?? "";
});

const { isVerifying2FA, verify2FACode, resendCode } = useAuthentication(
  "bo",
  config.public.backendUrl,
  userStore,
  navigateTo,
);

const twoFactorRef = ref<InstanceType<typeof TwoFactorCodeVerification> | null>(
  null,
);

onMounted(() => {
  if (!email.value) {
    log.w("Accès à la page 2FA sans email, redirection");
    router.push("/connexion");
  }
});

async function handleVerify2FA(payload: Verify2FAPayload) {
  try {
    await verify2FACode(payload, email.value);
  } catch (error) {
    log.w("handleVerify2FA - erreur capturée", { error });
    if (
      error &&
      typeof error === "object" &&
      "data" in error &&
      error.data &&
      typeof error.data === "object"
    ) {
      const errData: any = error.data;
      await router.replace({
        query: {
          ...route.query,
          otpAttemptsAt: errData.detail?.otpAttemptsAt,
          otpAttempts: String(errData.detail?.otpAttempts ?? 0),
          otpCodeExpiresAt: errData.detail?.otpCodeExpiresAt,
        },
      });
      twoFactorRef.value?.setError({
        type: errData.type,
        title: errData.title || errData.name || "Erreur",
        message: getFunctionalErrorMessage(errData.code),
        name: errData.code || "",
      });
    }
  }
}

async function handleResendCode() {
  log.i("handleResendCode");
  try {
    await resendCode();

    log.i("handleResendCode - succès, démarrage du timer");
    if (twoFactorRef.value) {
      twoFactorRef.value.startResendTimer();
    }
  } catch (error) {
    log.w("handleResendCode - échec API, timer non démarré", { error });
  }
}

function handleCancel2FA() {
  log.i("handleCancel2FA - retour à la page de connexion BO");
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("otp-email-bo");
  }
  router.push("/connexion");
}
</script>
