<template>
  <ConnexionEmailValidateToken :token="emailToken" />
</template>

<script setup>
const route = useRoute();
const emailToken = route.query.token;
</script>

<style lang="scss" scoped></style>
