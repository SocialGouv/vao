<template>
  <DsfrAccordionsGroup>
    <li v-if="demandeStore.currentDemande?.organisme">
      <DsfrAccordion
        :title="`Organisme`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
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
            :value="
              demandeStore.currentDemande.organisme.personnePhysique[entry]
            "
            :input="displayInput.IPersonnePhysique[entry]"
          >
          </UtilsDisplayInput>
        </div>
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsVacanciers">
      <DsfrAccordion
        :title="`Vacanciers`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IVacancier)"
          :key="`personnel-${entry}`"
          :value="demandeStore.currentDemande.informationsVacanciers[entry]"
          :input="displayInput.IVacancier[entry]"
        >
        </UtilsDisplayInput>
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsPersonnel">
      <DsfrAccordion
        :title="`Personnel`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
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
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel?.encadrants
                ?.length > 0
            "
          >
            Personnel d'encadrement
          </h4>
          <UtilsDisplayEncadrementAccompagnement
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel?.encadrants ??
              []
            "
          >
          </UtilsDisplayEncadrementAccompagnement>

          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel?.accompagnants
                ?.length > 0
            "
          >
            Personnel d'accompagnement
          </h4>
          <UtilsDisplayEncadrementAccompagnement
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel
                ?.accompagnants ?? []
            "
          ></UtilsDisplayEncadrementAccompagnement>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesMedicaments?.length > 0
            "
          >
            Prestataire en charge des médicaments
          </h4>
          <DemandesSejourDisplayPrestataire
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesMedicaments ?? []
            "
          >
          </DemandesSejourDisplayPrestataire>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesTransport?.length > 0
            "
          >
            Prestataire en charge du transport des vacanciers
          </h4>
          <DemandesSejourDisplayPrestataire
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesTransport ?? []
            "
          ></DemandesSejourDisplayPrestataire>

          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesRestauration?.length > 0
            "
          >
            Prestataire en charge de la restauration
          </h4>
          <DemandesSejourDisplayPrestataire
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesRestauration ?? []
            "
          ></DemandesSejourDisplayPrestataire>

          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesEntretien?.length > 0
            "
          >
            Prestataire en charge de l’entretien et du ménage
          </h4>
          <DemandesSejourDisplayPrestataire
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesEntretien ?? []
            "
          ></DemandesSejourDisplayPrestataire>

          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesActivites?.length > 0
            "
          >
            Prestataire en charge d'encadrer les activités spécifiques
          </h4>
          <DemandesSejourDisplayPrestataire
            :personnel="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesActivites ?? []
            "
          ></DemandesSejourDisplayPrestataire>
        </div>
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsProjetSejour">
      <DsfrAccordion
        :title="`Projet de séjour`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IProjetSejour)"
          :key="`projet-sejour-${entry}`"
          :value="demandeStore.currentDemande.informationsProjetSejour[entry]"
          :input="displayInput.IProjetSejour[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsTransport">
      <DsfrAccordion
        :title="`Information sur le transport`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.ITransport)"
          :key="`transport-${entry}`"
          :value="demandeStore.currentDemande.informationsTransport[entry]"
          :input="displayInput.ITransport[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsSanitaires">
      <DsfrAccordion
        :title="`Informations sanitaires`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.ISanitaire)"
          :key="`transport-${entry}`"
          :value="demandeStore.currentDemande.informationsSanitaires[entry]"
          :input="displayInput.ISanitaire[entry]"
        />
        DisplayInput
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.hebergement">
      <DsfrAccordion
        :title="`Hebergements`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
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
    </li>
    <li v-if="demandeStore.currentDemande?.attestation">
      <DsfrAccordion
        :title="`Attestation`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <UtilsDisplayInput
          v-for="entry in Object.keys(displayInput.IAttestation)"
          :key="`attestation-${entry}`"
          :value="demandeStore.currentDemande.attestation[entry]"
          :input="displayInput.IAttestation[entry]"
        />
      </DsfrAccordion>
    </li>
  </DsfrAccordionsGroup>
</template>

<script setup>
const demandeStore = useDemandeSejourStore();

const isDisplay8Jours = computed(() => {
  return demandesSejours.isDeclaration8Jours(
    demandeStore.currentDemande.statut,
  );
});

const expandedId = ref("");
</script>

<style scoped></style>
