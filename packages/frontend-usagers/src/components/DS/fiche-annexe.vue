<template>
  <div>
    <DsfrFieldset legend="Informations sur le lieu de l'hébergement">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Du </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            dayjs(props.dateDebut).format("DD/MM/YYYY")
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Au </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            dayjs(props.dateFin).format("DD/MM/YYYY")
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Type de lieu d'hébergement</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.type
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nom du lieu d'hébergement</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ props.hebergement?.nom }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nom du gestionnaire</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.coordonnees.nomGestionnaire
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Adresse</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.coordonnees.adresse.label
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Téléphone</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.coordonnees.numTelephone1
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Courriel</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.coordonnees.email
          }}</span>
        </div>
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Informations sur les locaux">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Visite des locaux </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.visiteLocaux
              ? dayjs(
                  props.hebergement?.informationsLocaux.visiteLocauxAt,
                ).format("DD/MM/YYYY")
              : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Accessibilité</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            hebergementUtils.accessibiliteOptions.find(
              (h) =>
                h.value === props.hebergement?.informationsLocaux.accessibilite,
            )?.label
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Type de pension</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            hebergementUtils.pensionOptions.find(
              (h) => h.value === props.hebergement?.informationsLocaux.pension,
            )?.label
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">prestations hôtelières</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            hebergementUtils.prestationsHotelieresOptions
              .filter((p) =>
                props.hebergement?.informationsLocaux.prestationsHotelieres.includes(
                  p.name,
                ),
              )
              .map((p) => p.label)
              .join(",")
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Description du lieu d’hébergement</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.descriptionLieuHebergement
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nombre de lits</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.nombreLits
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Dont lits superposés</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.nombreLitsSuperposes
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Lits superposés « du dessus » occupés par des vacanciers</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.litsDessus ? "Oui" : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Nombre maximum de personnes par couchage</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.nombreMaxPersonnesCouchage
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Couchages individuels pour tous les vacanciers</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.couchageIndividuel
              ? "Oui"
              : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Espaces de rangement individuels pour tous les vacanciers</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.rangementIndividuel
              ? "Oui"
              : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Couchages mixtes</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.chambresUnisexes
              ? "Oui"
              : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Chambres doubles</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.chambresDoubles
              ? "Oui"
              : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Aménagements spécifiques</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsLocaux.amenagementsSpecifiques
              ? "Oui"
              : "Non"
          }}</span>
        </div>
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Informations sur les transports durant le séjour">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Véhicules adaptés</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsTransport.vehiculesAdaptes
              ? "Oui"
              : "Non"
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Déplacements de proximité</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsTransport.deplacementProximite
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Excursions</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.hebergement?.informationsTransport.excursion
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Mode de transport jusqu'au lieu d'hébergement</span
          >
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">
            {{ props.hebergement?.informationsTransport?.rejoindreEtape }}
          </span>
        </div>
      </div>
    </DsfrFieldset>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
const props = defineProps({
  hebergement: { type: Object, required: true },
  dateDebut: { type: String, required: true },
  dateFin: { type: String, required: true },
});

const hebergementStore = useHebergementStore();

hebergementStore.fetchHebergement(props.hebergement.hebergementId);
</script>

<style lang="scss" scoped></style>
