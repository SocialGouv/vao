<template>
  <div
    v-if="displayRenouvellement"
    :class="[
      'fr-alert fr-mb-5v',
      agrementStore.isExpiryMedium ? 'fr-alert--info' : 'fr-alert--warning',
    ]"
  >
    <h2>
      {{
        agrementStore.isExpiryMedium
          ? "Déposez votre dossier de renouvellement d’agrément"
          : "Votre agrément arrive à expiration."
      }}
    </h2>

    <p v-if="agrementStore.isExpiryMedium">
      Votre agrément actuel expire le
      {{ formatFR(agrementStore.expiryDate!) }}. Une fois l’agrément renouvelé,
      vous pourrez déposer de nouvelles déclarations de séjours dans la
      continuité du précédent agrément.
    </p>

    <p v-else>
      Une fois l’agrément renouvelé, vous pourrez déposer une nouvelle
      déclaration de séjour dans la continuité du précédent.
    </p>

    <DsfrButton
      v-if="
        userStore.user?.featureFlags?.[FeatureFlagName.RENOUVELLEMENT_AGREMENT]
      "
      class="fr-mt-3v"
      @click.prevent="onClickRenouvellement"
    >
      Renouveler mon agrément
    </DsfrButton>
  </div>
</template>

<script setup lang="ts">
import type { AgrementDto } from "@vao/shared-bridge";
import { formatFR, FeatureFlagName, AGREMENT_STATUT } from "@vao/shared-bridge";
const agrementStore = useAgrementStore();
const userStore = useUserStore();

onMounted(async () => {
  await agrementStore.getEnRenouvellement();
});

const displayRenouvellement = computed(
  () =>
    (agrementStore.isExpiryMedium || agrementStore.isExpirySoon) &&
    agrementStore.agrementEnTraitement &&
    [AGREMENT_STATUT.BROUILLON, AGREMENT_STATUT.VALIDE].includes(
      agrementStore.agrementEnTraitement.statut!,
    ),
);

const onClickRenouvellement = async () => {
  await agrementStore.getEnRenouvellement();
  if (
    agrementStore.agrementEnTraitement?.statut === AGREMENT_STATUT.BROUILLON
  ) {
    return navigateTo(`/agrement/${agrementStore.agrementEnTraitement.id}`);
  } else if (
    agrementStore.agrementEnTraitement?.statut === AGREMENT_STATUT.VALIDE
  ) {
    agrementStore.agrementEnTraitement = {
      statut: AGREMENT_STATUT.BROUILLON,
      regionObtention: agrementStore.agrementCourant?.regionObtention || null,
    } as AgrementDto;
    return navigateTo("/agrement/new");
  }
};
</script>
