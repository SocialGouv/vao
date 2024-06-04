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
            'personne_morale'
          "
        >
          <h4>Organisme</h4>
          <DisplayInput
            v-for="entry in Object.keys(displayInput.IPersonneMorale)"
            :key="`organisme-${entry}`"
            :value="demandeStore.currentDemande.organisme.personneMorale[entry]"
            :input="displayInput.IPersonneMorale[entry]"
          />
          <h4>Responsable du séjour</h4>
          <DisplayInput
            v-for="entry in Object.keys(displayInput.IResponsableSejour)"
            :key="`organisme-responsableSejour-${entry}`"
            :value="
              demandeStore.currentDemande.organisme.personneMorale
                .responsableSejour[entry]
            "
            :input="displayInput.IResponsableSejour[entry]"
          />
        </div>
        <div
          v-if="
            demandeStore.currentDemande?.organisme?.typeOrganisme ===
            'personne_physique'
          "
        >
          <DisplayInput
            v-for="entry in Object.keys(displayInput.IPersonnePhysique)"
            :key="`organisme-${entry}`"
            :value="
              demandeStore.currentDemande.organisme.personnePhysique[entry]
            "
            :input="displayInput.IPersonnePhysique[entry]"
          />
        </div>
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsVacanciers">
      <DsfrAccordion
        :title="`Vacanciers`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
          v-for="entry in Object.keys(displayInput.IVacancier)"
          :key="`personnel-${entry}`"
          :value="demandeStore.currentDemande.informationsVacanciers[entry]"
          :input="displayInput.IVacancier[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsPersonnel">
      <DsfrAccordion
        :title="`Personnel`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <h4
          v-if="
            !!demandeStore.currentDemande.statut && isDisplay8Jours
          "
        >
          Généralité
        </h4>

        <DisplayInput
          v-for="entry in Object.keys(displayInput.Ipersonnel)"
          :key="`personnel-${entry}`"
          :value="demandeStore.currentDemande.informationsPersonnel[entry]"
          :input="displayInput.Ipersonnel[entry]"
        />
        <div
          v-if="
            !!demandeStore.currentDemande.statut && isDisplay8Jours
          "
        >
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel?.encadrants
                ?.length > 0
            "
          >
            Personnel d'encadrement
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.encadrants ?? []"
            :key="`personnelEncardement-${index}`"
          >
            <h6>Encadrant : {{ personnel.nom }} {{ personnel.prenom }}</h6>
            <DisplayInput
              v-for="entry in Object.keys(
                displayInput.IPersonnelEncardementAccompagnement,
              )"
              :key="`personnelEncardement-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelEncardementAccompagnement[entry]"
            />
          </div>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel?.accompagnants
                ?.length > 0
            "
          >
            Personnel d'accompagnement
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.accompagnants ?? []"
            :key="`personnelAccompagnant-${index}`"
          >
            <h6>Accompagnant : {{ personnel.nom }} {{ personnel.prenom }}</h6>
            <DisplayInput
              v-for="entry in Object.keys(
                displayInput.IPersonnelEncardementAccompagnement,
              )"
              :key="`personnelAccompagnant-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelEncardementAccompagnement[entry]"
            />
          </div>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesMedicaments?.length > 0
            "
          >
            Prestataire en charge des médicaments
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.prestatairesMedicaments ?? []"
            :key="`personnelPrestataireMedicament-${index}`"
          >
            <h6>
              Prestataire en charge des médicaments: {{ personnel.nom }}
              {{ personnel.prenom }}
            </h6>
            <DisplayInput
              v-for="entry in Object.keys(displayInput.IPersonnelPrestataire)"
              :key="`personnelPrestataireMedicament-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelPrestataire[entry]"
            />
          </div>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesTransport?.length > 0
            "
          >
            Prestataire en charge du transport des vacanciers
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.prestatairesTransport ?? []"
            :key="`personnelPrestataireTransport-${index}`"
          >
            <h6>
              Prestataire en charge du transport: {{ personnel.nom }}
              {{ personnel.prenom }}
            </h6>
            <DisplayInput
              v-for="entry in Object.keys(displayInput.IPersonnelPrestataire)"
              :key="`personnelPrestataireTransport-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelPrestataire[entry]"
            />
          </div>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesRestauration?.length > 0
            "
          >
            Prestataire en charge de la restauration
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.prestatairesRestauration ?? []"
            :key="`personnelPrestataireRestauration-${index}`"
          >
            <h6>
              Prestataire en charge de la restauration: {{ personnel.nom }}
              {{ personnel.prenom }}
            </h6>
            <DisplayInput
              v-for="entry in Object.keys(displayInput.IPersonnelPrestataire)"
              :key="`personnelPrestataireRestauration-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelPrestataire[entry]"
            />
          </div>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesEntretien?.length > 0
            "
          >
            Prestataire en charge de l’entretien et du ménage
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.prestatairesEntretien ?? []"
            :key="`personnelPrestataireEntretien-${index}`"
          >
            <h6>
              Prestataire en charge de l’entretien: {{ personnel.nom }}
              {{ personnel.prenom }}
            </h6>
            <DisplayInput
              v-for="entry in Object.keys(displayInput.IPersonnelPrestataire)"
              :key="`personnelPrestataireEntretien-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelPrestataire[entry]"
            />
          </div>
          <h4
            v-if="
              demandeStore.currentDemande?.informationsPersonnel
                ?.prestatairesActivites?.length > 0
            "
          >
            Prestataire en charge d'encadrer les activités spécifiques
          </h4>
          <div
            v-for="(personnel, index) in demandeStore.currentDemande
              ?.informationsPersonnel?.prestatairesActivites ?? []"
            :key="`personnelPrestataireActivites-${index}`"
          >
            <h6>
              Prestataire en charge d'encadrer les activités spécifiques:
              {{ personnel.nom }}
              {{ personnel.prenom }}
            </h6>
            <DisplayInput
              v-for="entry in Object.keys(displayInput.IPersonnelPrestataire)"
              :key="`personnelPrestataireActivites-${index}-${entry}`"
              :value="personnel[entry]"
              :input="displayInput.IPersonnelPrestataire[entry]"
            />
          </div>
        </div>
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.informationsProjetSejour">
      <DsfrAccordion
        :title="`Projet de séjour`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
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
        <DisplayInput
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
        <DisplayInput
          v-for="entry in Object.keys(displayInput.ISanitaire)"
          :key="`transport-${entry}`"
          :value="demandeStore.currentDemande.informationsSanitaires[entry]"
          :input="displayInput.ISanitaire[entry]"
        />
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
          <DisplayInput
            v-for="entry in Object.keys(displayInput.IHebergement)"
            :key="`hebergement-${hebergement.hebergementId}-${entry}`"
            :value="hebergement[entry]"
            :input="displayInput.IHebergement[entry]"
          />
          <h5>Informations sur les locaux</h5>
          <DisplayInput
            v-for="entry in Object.keys(
              displayInput.IHebergementInformationLocaux,
            )"
            :key="`hebergement-locaux-${hebergement.hebergementId}-${entry}`"
            :value="hebergement.informationsLocaux[entry]"
            :input="displayInput.IHebergementInformationLocaux[entry]"
          />
          <h5>Informations sur les transports</h5>
          <DisplayInput
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
        <DisplayInput
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
import { DsfrAccordion, DsfrAccordionsGroup } from "@gouvminint/vue-dsfr";
import DisplayInput from "~/components/demandes-sejour/DisplayInput.vue";

const demandeStore = useDemandeSejourStore();

const isDisplay8Jours = computed(() => {
  return demandesSejours.isDeclaration8Jours(demandeStore.currentDemande.statut);
});

const expandedId = ref("");
</script>

<style scoped></style>
