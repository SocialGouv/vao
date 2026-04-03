<template>
  <div id="agrement-dossier">
    <DsfrAccordionsGroup v-model="expandedIndex">
      <DsfrAccordion>
        <template #title> Coordonnées </template>
        <AgrementsCoordonnees
          :init-organisme="props.initOrganisme ?? {}"
          :init-agrement="props.initAgrement ?? {}"
          :cdn-url="cdnUrl"
        />
      </DsfrAccordion>
      <DsfrAccordion>
        <template #title> Dossier candidature </template>
        <AgrementsDossierCandidature
          class="fr-my-2w"
          :init-agrement="props.initAgrement ?? {}"
          :cdn-url="cdnUrl"
        />
      </DsfrAccordion>
      <DsfrAccordion>
        <template #title> Bilan des 4 années précédentes </template>

        <AgrementsBilan
          :init-agrement="props.initAgrement ?? {}"
          :cdn-url="cdnUrl"
        />
      </DsfrAccordion>
      <DsfrAccordion>
        <template #title> Projet de séjours envisagés </template>
        <AgrementsProjets
          :init-agrement="props.initAgrement ?? {}"
          :cdn-url="cdnUrl"
        />
      </DsfrAccordion>
    </DsfrAccordionsGroup>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const expandedIndex = ref<number>(-1);
</script>
