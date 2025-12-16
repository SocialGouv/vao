<template>
  <AgrementProjetsSejoursPrevus />
  <hr class="fr-mt-8v" />
  <AgrementProjetsAnimationsActivites />
  <hr class="fr-mt-8v" />
  <AgrementProjetsAccompagnantsResponsables />
  <hr class="fr-mt-8v" />
  <AgrementProjetsCasierJudiciaire :cdn-url="props.cdnUrl" />
  <hr class="fr-mt-8v" />
  <AgrementProjetsOrganisationTransports :cdn-url="props.cdnUrl" />
  <hr class="fr-mt-8v" />
  <AgrementProjetsSuiviMedical
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
  <AgrementProjetsProtocole
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
  <hr class="fr-mt-8v" />
  <AgrementProjetsBudget
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
  />
</template>

<script setup>
const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});
console.log("Hello from projet/index.vue");
</script>
