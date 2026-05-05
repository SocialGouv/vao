<template>
  <div
    v-if="
      agrementStore.agrementEnTraitement?.statut ===
        AGREMENT_STATUT.A_MODIFIER &&
      userStore.user?.featureFlags?.[FeatureFlagName.RENOUVELLEMENT_AGREMENT]
    "
    :class="['fr-alert fr-mb-5v', 'fr-alert--warning']"
  >
    <h2>Demande de compléments d'informations</h2>

    La DREETS en charge de l'instruction de votre dossier d'agrément vous
    sollicite pour des compléments d'informations Accédes à votre agrément,
    complétez le puis transmettez le à nouveau à votre DREETS qui reprendra
    l'instruction du dossier<br /><br />
    <strong>Commentaire de la DREETS :</strong><br />
    {{ agrementStore.agrementEnTraitement.commentaireCompletude }}
    <br /><br />
    <DsfrButton class="fr-mt-3v" @click.prevent="onClickModifier">
      Modifier mon renouvellement d'agrément
    </DsfrButton>
  </div>
</template>

<script setup lang="ts">
import { FeatureFlagName, AGREMENT_STATUT } from "@vao/shared-bridge";

const agrementStore = useAgrementStore();
const userStore = useUserStore();

const onClickModifier = async () => {
  if (agrementStore.agrementEnTraitement) {
    return navigateTo(`/agrement/${agrementStore.agrementEnTraitement.id}`);
  }

  return navigateTo("/agrement/");
};
</script>
