<template>
  <VerificationOtp
    :store="userStore"
    :url="config.public.backendUrl"
    target="fo"
  />
</template>

<script setup lang="ts">
import { VerificationOtp } from "@vao/shared-ui";
const config = useRuntimeConfig();

const userStore = useUserStore();
</script>
