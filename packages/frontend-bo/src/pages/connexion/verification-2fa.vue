<template>
  <div class="fr-container fr-container--fluid fr-my-md-14v">
    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
      <div class="fr-mt-8v fr-mt-md-2v fr-col-10 fr-col-md-8 fr-col-lg-6">
        <h1>Portail Administration</h1>
        <TwoFactorCodeVerification
          ref="twoFactorRef"
          :masked-email="maskedEmail"
          :loading="isVerifying2FA"
          :expiration-time="expirationTime"
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

const log = logger("pages/bo/connexion/verification-2fa");
const router = useRouter();
const config = useRuntimeConfig();

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
    return sessionStorage.getItem("2fa-email-bo") || "";
  }
  return "";
});

const maskedEmail = computed<string>(() => {
  return maskEmail(email.value);
});

const expirationTime = computed(() => {
  const iso = sessionStorage.getItem("2fa-expiration-bo");
  if (!iso) return null;

  const date = new Date(iso);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const { isVerifying2FA, verify2FACode, resendCode } = useAuthentication(
  "bo",
  config.public.backendUrl,
);

const twoFactorRef = ref<InstanceType<typeof TwoFactorCodeVerification> | null>(
  null,
);

onMounted(() => {
  // Si pas d'email, rediriger vers la page de connexion BO
  if (!email.value) {
    log.w("Accès à la page 2FA sans email, redirection");
    router.push("/bo/connexion");
  }
});

async function handleVerify2FA(payload: Verify2FAPayload) {
  try {
    await verify2FACode(payload);
  } catch (error) {
    log.w("handleVerify2FA - erreur capturée", { error });

    if (
      twoFactorRef.value &&
      error &&
      typeof error === "object" &&
      "type" in error
    ) {
      twoFactorRef.value.setError(
        error as {
          type: "error" | "warning" | "info" | "success";
          title: string;
          description: string;
        },
      );
    }
  }
}

async function handleResendCode() {
  try {
    await resendCode();
  } catch (error) {
    log.w("handleResendCode - erreur", { error });
  }
}

function handleCancel2FA() {
  log.i("handleCancel2FA - retour à la page de connexion BO");
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("2fa-email-bo");
  }
  router.push("/bo/connexion");
}
</script>
