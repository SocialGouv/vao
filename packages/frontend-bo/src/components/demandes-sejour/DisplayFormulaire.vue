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
    <li v-if="demandeStore.currentDemande?.vacanciers">
      <DsfrAccordion
        :title="`Vacanciers`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
          v-for="entry in Object.keys(displayInput.IVacancier)"
          :key="`personnel-${entry}`"
          :value="demandeStore.currentDemande.vacanciers[entry]"
          :input="displayInput.IVacancier[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.personnel">
      <DsfrAccordion
        :title="`Personnel`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
          v-for="entry in Object.keys(displayInput.Ipersonnel)"
          :key="`personnel-${entry}`"
          :value="demandeStore.currentDemande.personnel[entry]"
          :input="displayInput.Ipersonnel[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.projetSejour">
      <DsfrAccordion
        :title="`Projet de séjour`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
          v-for="entry in Object.keys(displayInput.IProjetSejour)"
          :key="`projet-sejour-${entry}`"
          :value="demandeStore.currentDemande.projetSejour[entry]"
          :input="displayInput.IProjetSejour[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.transport">
      <DsfrAccordion
        :title="`Information sur le transport`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
          v-for="entry in Object.keys(displayInput.ITransport)"
          :key="`transport-${entry}`"
          :value="demandeStore.currentDemande.transport[entry]"
          :input="displayInput.ITransport[entry]"
        />
      </DsfrAccordion>
    </li>
    <li v-if="demandeStore.currentDemande?.sanitaires">
      <DsfrAccordion
        :title="`Information sanitaires`"
        :expanded-id="expandedId"
        @expand="expandedId = $event"
      >
        <DisplayInput
          v-for="entry in Object.keys(displayInput.ISanitaire)"
          :key="`transport-${entry}`"
          :value="demandeStore.currentDemande.sanitaires[entry]"
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

const expandedId = ref("");
</script>

<style scoped></style>
