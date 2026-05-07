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
    <div v-if="fileCompletude" class="fr-fieldset__element">
      <FileUpload
        v-model="fileCompletude"
        :cdn-url="`${config.public.backendUrl}/documents`"
        label="Fichier joint à la demande de complétude"
        hint="Pièce jointe associée à la demande de complément d'information au dossier d'agrément."
        :modifiable="false"
      />
    </div>
    <DsfrButton class="fr-mt-3v" @click.prevent="onClickModifier">
      Modifier mon renouvellement d'agrément
    </DsfrButton>
  </div>
</template>

<script setup lang="ts">
import {
  FeatureFlagName,
  AGREMENT_STATUT,
  FILE_CATEGORY,
  getFileByCategory,
} from "@vao/shared-bridge";
import { FileUpload } from "@vao/shared-ui";
const config = useRuntimeConfig();
const agrementStore = useAgrementStore();
const userStore = useUserStore();

const fileCompletude = computed(() => {
  return getFileByCategory({
    files: agrementStore.agrementEnTraitement?.agrementFiles,
    category: FILE_CATEGORY.AMODIFER,
  });
});

const onClickModifier = async () => {
  if (agrementStore.agrementEnTraitement) {
    return navigateTo(`/agrement/${agrementStore.agrementEnTraitement.id}`);
  }

  return navigateTo("/agrement/");
};
</script>
