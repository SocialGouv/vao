<template>
  <DsfrAlert
    v-if="dateFinValidite && dateFinValidite < new Date()"
    key="alert-non-agree"
    type="error"
    title="Organisme non agréé"
    :description="`L’organisme ${libelle} n’est plus agréé depuis le ${dateFinValidite} ${dayjs(dateFinValidite).format('DD/MM/YYYY')} pour la raison suivante : expiration`"
    title-tag="h3"
  />
</template>

<script setup>
import dayjs from "dayjs";

defineProps({
  libelle: { type: String, default: "" },
  dateFinValidite: { type: Date, default: null },
});
</script>
