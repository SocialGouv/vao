<template>
  <DsfrAccordionsGroup v-model="expandedIndex">
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.organisme"
      :title="`Organisme`"
    >
      <div
        v-if="
          demandeStore.currentDemande?.organisme?.typeOrganisme ===
          organisme.type.PERSONNE_MORALE
        "
      >
        <h4>Organisme</h4>
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IPersonneMorale)"
          :key="`organisme-${entry}`"
          :value="demandeStore.currentDemande.organisme.personneMorale[entry]"
          :input="displayInput.IPersonneMorale[entry]"
        ></UtilsDisplayInput>

        <h4>Responsable du séjour</h4>
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IResponsableSejour)"
          :key="`organisme-responsableSejour-${entry}`"
          :value="
            demandeStore.currentDemande.organisme.personneMorale
              .responsableSejour[entry]
          "
          :input="displayInput.IResponsableSejour[entry]"
        >
        </UtilsDisplayInput>
      </div>
      <div
        v-if="
          demandeStore.currentDemande?.organisme?.typeOrganisme ===
          'personne_physique'
        "
      >
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IPersonnePhysique)"
          :key="`organisme-${entry}`"
          :value="demandeStore.currentDemande.organisme.personnePhysique[entry]"
          :input="displayInput.IPersonnePhysique[entry]"
        >
        </UtilsDisplayInput>
      </div>
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.informationsVacanciers"
      :title="`Vacanciers`"
    >
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.IVacancier)"
        :key="`personnel-${entry}`"
        :value="demandeStore.currentDemande.informationsVacanciers[entry]"
        :input="displayInput.IVacancier[entry]"
      >
      </UtilsDisplayInput>
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.informationsPersonnel"
      :title="`Personnel`"
    >
      <h4 v-if="!!demandeStore.currentDemande.statut && isDisplay8Jours">
        Généralité
      </h4>
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.Ipersonnel)"
        :key="`personnel-${entry}`"
        :value="demandeStore.currentDemande.informationsPersonnel[entry]"
        :input="displayInput.Ipersonnel[entry]"
      >
      </UtilsDisplayInput>
      <div v-if="!!demandeStore.currentDemande.statut && isDisplay8Jours">
        <UtilsDisplayEncadrementAccompagnement
          title="Personnel d'encadrement"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel?.encadrants ?? []
          "
        >
        </UtilsDisplayEncadrementAccompagnement>
        <UtilsDisplayEncadrementAccompagnement
          title="Personnel d'accompagnement"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel?.accompagnants ??
            []
          "
        ></UtilsDisplayEncadrementAccompagnement>
        <DemandesSejourDisplayPrestataire
          title="Prestataire en charge des médicaments"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel
              ?.prestatairesMedicaments ?? []
          "
        >
        </DemandesSejourDisplayPrestataire>
        <DemandesSejourDisplayPrestataire
          title="Prestataire en charge du transport des vacanciers"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel
              ?.prestatairesTransport ?? []
          "
        ></DemandesSejourDisplayPrestataire>
        <DemandesSejourDisplayPrestataire
          title="Prestataire en charge de la restauration"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel
              ?.prestatairesRestauration ?? []
          "
        ></DemandesSejourDisplayPrestataire>
        <DemandesSejourDisplayPrestataire
          title="Prestataire en charge de l’entretien et du ménage"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel
              ?.prestatairesEntretien ?? []
          "
        ></DemandesSejourDisplayPrestataire>
        <DemandesSejourDisplayPrestataire
          title="Prestataire en charge d'encadrer les activités spécifiques"
          :personnel="
            demandeStore.currentDemande?.informationsPersonnel
              ?.prestatairesActivites ?? []
          "
        ></DemandesSejourDisplayPrestataire>
      </div>
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.informationsProjetSejour"
      :title="`Projet de séjour`"
    >
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.IProjetSejour)"
        :key="`projet-sejour-${entry}`"
        :value="demandeStore.currentDemande.informationsProjetSejour[entry]"
        :input="displayInput.IProjetSejour[entry]"
      />
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.informationsTransport"
      :title="`Information sur le transport`"
    >
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.ITransport)"
        :key="`transport-${entry}`"
        :value="demandeStore.currentDemande.informationsTransport[entry]"
        :input="displayInput.ITransport[entry]"
      />
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.informationsSanitaires"
      :title="`Informations sanitaires`"
    >
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.ISanitaire)"
        :key="`transport-${entry}`"
        :value="demandeStore.currentDemande.informationsSanitaires[entry]"
        :input="displayInput.ISanitaire[entry]"
      />
      DisplayInput
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.hebergement"
      :title="`Hebergements`"
    >
      <div
        v-for="hebergement in demandeStore.currentDemande.hebergement
          .hebergements"
        :key="`hebergement-${hebergement.hebergementId}`"
      >
        <h3>Hebergement : {{ hebergement.nom }}</h3>
        <h5>Informations sur le lieu de l'hébergement</h5>
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IHebergement)"
          :key="`hebergement-${hebergement.hebergementId}-${entry}`"
          :value="hebergement[entry]"
          :input="displayInput.IHebergement[entry]"
        />
        <h5>Informations sur les locaux</h5>
        <UtilsDisplayInput
          v-for="entry in Object.keys(
            displayInput.IHebergementInformationLocaux,
          )"
          :key="`hebergement-locaux-${hebergement.hebergementId}-${entry}`"
          :value="hebergement.informationsLocaux[entry]"
          :input="displayInput.IHebergementInformationLocaux[entry]"
        />
        <h5>Informations sur les transports</h5>
        <UtilsDisplayInput
          v-for="entry in Object.keys(
            displayInput.IHebergementInformationsTransport,
          )"
          :key="`hebergement-transport-${hebergement.hebergementId}-${entry}`"
          :value="hebergement.informationsTransport[entry]"
          :input="displayInput.IHebergementInformationsTransport[entry]"
        />
      </div>
    </DsfrAccordion>
    <DsfrAccordion
      v-if="demandeStore.currentDemande?.attestation"
      :title="`Attestation`"
    >
      <UtilsDisplayInput
        v-for="entry in Object.keys(displayInput.IAttestation)"
        :key="`attestation-${entry}`"
        :value="demandeStore.currentDemande.attestation[entry]"
        :input="displayInput.IAttestation[entry]"
      />
    </DsfrAccordion>
  </DsfrAccordionsGroup>
</template>

<script setup>
const demandeStore = useDemandeSejourStore();

const isDisplay8Jours = computed(() => {
  return demandesSejours.isDeclaration8Jours(
    demandeStore.currentDemande.statut,
  );
});

const expandedIndex = ref(-1);
</script>

<style scoped></style>
