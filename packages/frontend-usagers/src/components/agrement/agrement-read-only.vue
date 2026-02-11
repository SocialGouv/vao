<template>
  <DsfrAccordionsGroup v-model="expandedIndex">
    <DsfrAccordion title="Coordonnées">
      <AgrementCoordonnees
        :init-organisme="props.initOrganisme ?? {}"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
    <DsfrAccordion title="Dossier candidature">
      <AgrementDossier
        class="fr-my-2w"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
    <DsfrAccordion title="Bilan des 4 années précédentes">
      <AgrementBilan
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
    <DsfrAccordion title="Projet de séjours envisagés">
      <AgrementProjets
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
  </DsfrAccordionsGroup>
</template>

<script setup>
const props = defineProps({
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const expandedIndex = ref(-1);
</script>
