<template>
  <VerificationOtp
    :store="userStore"
    :organisme-store="organismeStore"
    :url="config.public.backendUrl"
    :target="USER_TARGET.FO"
  />
</template>

<script setup lang="ts">
import { VerificationOtp } from "@vao/shared-ui";
import { USER_TARGET } from "@vao/shared-bridge";
const config = useRuntimeConfig();

const userStore = useUserStore();
const organismeStore = useOrganismeStore();
</script>
