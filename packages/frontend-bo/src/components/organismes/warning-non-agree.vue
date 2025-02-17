<template>
  <DsfrAlert
    v-if="dateFinValidite && dateFinValidite < new Date()"
    key="alert-non-agree"
    type="error"
    title="Organisme non agréé"
    :description="`L’organisme ${libelle} n’est plus agréé depuis le ${dayjs(dateFinValidite).locale('fr').format('DD MMMM YYYY')} pour la raison suivante : expiration`"
    title-tag="h3"
  />
</template>

<script setup>
import dayjs from "dayjs";
import "dayjs/locale/fr";

defineProps({
  libelle: { type: String, default: "" },
  dateFinValidite: { type: Date, default: null },
});
</script>
