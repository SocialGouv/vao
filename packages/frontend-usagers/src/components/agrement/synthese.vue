<template>
  <div id="agrement-synthese">
    <DsfrAccordion>
      <template #title>
        Coordonnées à vérifier
        <DsfrBadge type="warning" label="Incomplet" />
        <!--
        <DsfrBadge
          :label="
            encadrantsMeta.valid &&
            encadrants.every((encadrant) => encadrant.attestation)
              ? 'Complet'
              : 'Incomplet'
          "
          :small="true"
          :type="dsd"
        />
        -->
      </template>
      <AgrementCoordonnees
        :init-organisme="props.initOrganisme ?? {}"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
    <DsfrAccordion :title="`Dossier candidature`">
      <AgrementDossier
        class="fr-my-2w"
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
    <DsfrAccordion :title="`Bilan des 4 années précédentes`">
      <AgrementBilan
        :init-agrement="props.initAgrement ?? {}"
        :modifiable="false"
        :cdn-url="cdnUrl"
      />
    </DsfrAccordion>
    <DsfrAccordion class="fr-mb-4w" :title="`Projet de séjours envisagés`">
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
    <!--
    <DsfrButton class="fr-mb-6v fr-mt-6v" @click.prevent="onNext"
      >Confirmer ma demande d'agrément</DsfrButton
    >
    -->
    <!--
    <div class="fr-fieldset">
        <DsfrButtonGroup
          v-if="!props.isDownloading"
          :inline-layout-when="true"
          :reverse="true"
        >
          <DsfrButton
            id="previous-step"
            :secondary="true"
            @click.prevent="
              () => {
                emit('previous');
              }
            "
            >Précédent
          </DsfrButton>
          <DsfrButton
            v-if="props.modifiable"
            :label="libelleBoutonTransmission"
            :disabled="!meta.valid"
            @click.prevent="finalizeDeclaration"
          />
        </DsfrButtonGroup>
        <is-downloading
          :message="props.message"
          :is-downloading="props.isDownloading"
        />
      </div>
    -->
  </div>
</template>

<script setup>
const props = defineProps({
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

function onNext() {
  console.log("Next action push");
}
</script>
