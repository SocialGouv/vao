<template>
  <AgrementsProjetsSejoursPrevus
    ref="sejoursPrevusRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
  <AgrementsProjetsAnimationsActivites
    ref="animationsActivitesRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
  <AgrementsProjetsAccompagnantsResponsables
    ref="accompagnantsResponsablesRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />

  <hr class="fr-mt-8v" />
  <AgrementsProjetsOrganisationTransports
    ref="organisationTransportsRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
  <AgrementsProjetsSuiviMedical
    ref="suiviMedicalRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
  <AgrementsProjetsProtocole
    ref="protocoleRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
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
