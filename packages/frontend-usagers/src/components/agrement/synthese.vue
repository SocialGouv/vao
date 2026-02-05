<template>
  <div id="agrement-synthese">
    <DsfrAccordionsGroup v-model="expandedIndex">
    <DsfrAccordion>
      <template #title>
        Coordonnées à vérifier
        <DsfrBadge
          :label="coordonneesValid ? 'Complet' : 'Incomplet'"
          :type="coordonneesValid ? 'success' : 'warning'"
          small
        />
      </template>
      <AgrementCoordonnees
        v-model:valid="coordonneesValid"
        :init-organisme="props.initOrganisme ?? {}"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
      <DsfrButton 
        class="fr-mb-6v fr-mt-6v" 
        @click.prevent="onModifierCoordonnees"
      >Modifier</DsfrButton
    >
    </DsfrAccordion>
    <DsfrAccordion>
      <template #title>
        Dossier candidature
        <DsfrBadge
          :label="dossierValid ? 'Complet' : 'Incomplet'"
          :type="dossierValid ? 'success' : 'warning'"
          small
        />
      </template>
      <AgrementDossier
        v-model:valid="dossierValid"
        class="fr-my-2w"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
      <DsfrButton 
        class="fr-mb-6v fr-mt-6v" 
        @click.prevent="onModifierDossier"
      >Modifier</DsfrButton>
    </DsfrAccordion>
    <DsfrAccordion>
      <template #title>
        Bilan des 4 années précédentes
        <DsfrBadge
          :label="bilanValid ? 'Complet' : 'Incomplet'"
          :type="bilanValid ? 'success' : 'warning'"
          small
        />
      </template>
      <AgrementBilan
        v-model:valid="bilanValid"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
      <DsfrButton 
        class="fr-mb-6v fr-mt-6v" 
        @click.prevent="onModifierBilan"
      >Modifier</DsfrButton>
    </DsfrAccordion>
    <DsfrAccordion>
      <template #title>
        Projet de séjours envisagés
        <DsfrBadge
          :label="projetValid ? 'Complet' : 'Incomplet'"
          :type="projetValid ? 'success' : 'warning'"
          small
        />
      </template>
      <AgrementProjets
        v-model:valid="projetValid"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
      <DsfrButton 
        class="fr-mb-6v fr-mt-6v" 
        @click.prevent="onModifierProjet"
      >Modifier</DsfrButton>
    </DsfrAccordion>
    <DsfrAlert role="info">
      <h2>Vérification</h2>
      <ul role="list">
        <li role="listitem">
          Vérifiez que toutes les informations soient exactes.
        </li>
        <li role="listitem">
          Assurez-vous que tous les documents soient lisibles.
        </li>
        <li role="listitem">
          Toutes les étapes du formulaire doivent être marquées comme « Complet
          » pour pouvoir être envoyées
        </li>
      </ul>
    </DsfrAlert>
    </DsfrAccordionsGroup>
    <DsfrButton 
      class="fr-mb-6v fr-mt-6v" 
      :disabled="!(coordonneesValid && projetValid && dossierValid && bilanValid)"
      @click.prevent="onNext"
      >Confirmer ma demande d'agrément</DsfrButton
    >
  </div>
</template>

<script setup>
const props = defineProps({
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const expandedIndex = ref(-1);
const coordonneesValid = ref(false);
const dossierValid = ref(false);
const bilanValid = ref(false);
const projetValid = ref(false);


function onNext() {
  // TO DO TICKET 1103
}
function onModifierCoordonnees() {
  navigateTo("/agrement#agrement-coordonnees");
}
function onModifierDossier() {
  navigateTo("/agrement#agrement-dossier");
}
function onModifierBilan() {
  navigateTo("/agrement#agrement-bilan");
}
function onModifierProjet() {
  navigateTo("/agrement#agrement-projets");
}
</script>
