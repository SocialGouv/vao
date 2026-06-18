<template>
  <AgrementsProjetsSejoursPrevus
    ref="sejoursPrevusRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <div class="fr-my-2w separator"></div>
  <AgrementsProjetsAnimationsActivites
    ref="animationsActivitesRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <div class="fr-my-2w separator"></div>
  <AgrementsProjetsAccompagnantsResponsables
    ref="accompagnantsResponsablesRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <div class="fr-my-2w separator"></div>
  <AgrementsProjetsOrganisationTransports
    ref="organisationTransportsRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <div class="fr-my-2w separator"></div>
  <AgrementsProjetsSuiviMedical
    ref="suiviMedicalRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <div class="fr-my-2w separator"></div>
  <AgrementsProjetsProtocole
    ref="protocoleRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <div class="fr-my-2w separator"></div>
  <AgrementsProjetsBudget
    ref="financierRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
});
</script>
