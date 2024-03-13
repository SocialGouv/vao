<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-5">
        <DsfrInputGroup
          name="dateDebut"
          type="date"
          label="Du "
          :min="props.dateDebutIni"
          :max="props.dateFinIni"
          :label-visible="true"
          :model-value="dateDebut"
          :required="true"
          :is-valid="dateDebutMeta.valid"
          :error-message="dateDebutErrorMessage"
          placeholder="Date de début"
          @update:model-value="onDateDebutChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-5">
        <DsfrInputGroup
          name="dateFin"
          type="date"
          label="Au : "
          :min="props.dateDebutIni"
          :max="props.dateFinIni"
          :label-visible="true"
          :model-value="dateFin"
          :required="true"
          :is-valid="dateFinMeta.valid"
          :error-message="dateFinErrorMessage"
          placeholder="Date de fin"
          @update:model-value="onDateFinChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <DsfrSelect
          :model-value="hebergementId"
          name="hebergementId"
          label="Hebergement"
          :required="true"
          :options="hebergementsFavoris"
          :is-valid="hebergementIdMeta.valid"
          :error-message="hebergementIdErrorMessage"
          @update:model-value="handleHebergementIdChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-4">
        <DsfrButton id="retour" :secondary="true" @click="openAddHebergement"
          >Créer un lieu d'hébergement
        </DsfrButton>
      </div>
    </fieldset>
    <template v-if="hebergementStore.hebergementCourant">
      <DsfrFieldset legend="Informations sur le lieu d'hébergement">
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="nom"
            label="Nom de l'hébergement"
            :label-visible="true"
            :model-value="hebergementStore.hebergementCourant.nom"
            readonly
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="nomGestionnaire"
            label="Nom du gestionnaire"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.caracteristiques.coordonnees
                .nomGestionnaire
            "
            readonly
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="adresse"
            label="Adresse du lieu d'hébergement"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.caracteristiques.coordonnees
                .adresse.label
            "
            readonly
          />
        </div>
        <div
          class="fr-fieldset__element fr-col-12"
          style="height: 50vh; width: 50vw"
        >
          <LMap ref="map" :zoom="zoom" :center="markerLatLng">
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              layer-type="base"
              name="OpenStreetMap"
            />
            <LMarker :lat-lng="markerLatLng"></LMarker>
          </LMap>
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="numTelephone1"
            label="Numéro de téléphone 1"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.caracteristiques.coordonnees
                .numTelephone1
            "
            readonly
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="numTelephone2"
            label="Numéro de téléphone 2"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.caracteristiques.coordonnees
                .numTelephone2
            "
            readonly
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="email"
            label="Courriel"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.caracteristiques.coordonnees
                .email
            "
            readonly
          />
        </div>
      </DsfrFieldset>
      <DsfrFieldset legend="Type de lieu de l'hébergement">
        <DsfrNotice>
          Informations ERP : Selon la circulaire du 6 octobre 2023, il sera
          requis l’arrêté d’autorisation du maire et/ou la dernière attestation
          du passage de la commission de sécurité datant de moins de 5 ans pour
          séjours se déroulant en établissement recevant du public (ERP).A
          défaut de transmission de ces justificatifs, la DDETS met en demeure
          l'organisme de produire ces pièces et propose au Préfet de département
          une annulation des séjours, si absence de tous les justificatifs.On
          distingue 3 catégories d’hébergements :1 - Les établissements recevant
          du public (ERP, tous les hôtels et les gros meubles de tourisme de
          plus de 15 personnes de type gîtes de groupes,2 - Les Bâtiments
          d’Habitation Collective (BHC, comme des résidences de tourisme),3 -
          Les maisons individuelles (MI, comme des chambres d’hôtes et petits
          meublés, qui ne peuvent dépasser 5 chambres et hébergent 15 personnes
          au maximum).
        </DsfrNotice>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrFileUpload
            id="justificatif-erp"
            label="Téléchargement du document justificatif référent à l’établissement ERP"
            hint="Taille maximale : 500 Mo. Formats supportés : jpg, png, pdf."
            @change="changeFile"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.type"
              legend="Type du lieu d'hébergement"
              :model-value="type"
              :options="hebergementUtils.typeOptions"
              :is-valid="typeMeta.valid"
              :inline="false"
              :error-message="typeErrorMessage"
              readonly
              @update:model-value="onTypeChange"
            />
          </div>
        </div>
      </DsfrFieldset>
      <DsfrFieldset legend="Informations sur les locaux">
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.visiteLocaux"
              legend="Une visite des locaux par l’organisateur a-t-elle été effectuée ?"
              :required="true"
              :model-value="visiteLocaux"
              :options="ouiNonOptions"
              :is-valid="visiteLocauxMeta.valid"
              :inline="true"
              :error-message="visiteLocauxErrorMessage"
              @update:model-value="onVisiteLocauxChange"
            />
          </div>
        </div>
        <div v-if="visiteLocaux" class="fr-fieldset__element fr-col-6">
          <DsfrInputGroup
            name="caracteristiques.informationsLocaux.visiteLocauxAt"
            type="date"
            label="Date de la dernière visite "
            :label-visible="true"
            :model-value="visiteLocauxAt"
            :required="true"
            :is-valid="visiteLocauxAtMeta.valid"
            :error-message="visiteLocauxAtErrorMessage"
            @update:model-value="onVisiteLocauxAtChange"
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.accessibilite"
              legend="Accessibilité"
              :required="true"
              :model-value="accessibilite"
              :options="hebergementUtils.accessibiliteOptions"
              :is-valid="accessibiliteMeta.valid"
              :inline="false"
              :error-message="accessibiliteErrorMessage"
              @update:model-value="onAccessibiliteChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.pension"
              legend="Type de pension"
              :required="true"
              :model-value="pension"
              :options="hebergementUtils.pensionOptions"
              :is-valid="pensionMeta.valid"
              :inline="false"
              :error-message="pensionErrorMessage"
              @update:model-value="onPensionChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrCheckboxSet
            name="caracteristiques.informationsLocaux.prestationsHotelieres"
            legend="Prestations hôtelières assurées par le lieu d’accueil"
            :value="prestationsHotelieres"
            :inline="true"
            :options="hebergementUtils.prestationsHotelieresOptions"
            :small="true"
            :required="true"
            :error-message="prestationsHotelieresErrorMessage"
            @update:model-value="onPrestationsHotelieresChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsLocaux.descriptionLieuHebergement"
            :required="false"
            label="Description du lieu d’hébergement (parties communes et notamment équipements sanitaires)"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="descriptionLieuHebergement"
            :error-message="descriptionLieuHebergementErrorMessage"
            :is-valid="descriptionLieuHebergementMeta.valid"
            @update:model-value="onDescriptionLieuHebergementChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsLocaux.nombreLits"
            type="number"
            :required="true"
            label="Nombre de lits dans le lieu d'hébergement"
            :label-visible="true"
            placeholder=""
            :model-value="nombreLits"
            :error-message="nombreLitsErrorMessage"
            :is-valid="nombreLitsMeta.valid"
            @update:model-value="onNombreLitsChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsLocaux.nombreLitsSuperposes"
            :required="true"
            type="number"
            label="Nombre de lits superposés inclus"
            :label-visible="true"
            placeholder=""
            :model-value="nombreLitsSuperposes"
            :error-message="nombreLitsSuperposesErrorMessage"
            :is-valid="nombreLitsSuperposesMeta.valid"
            @update:model-value="onNombreLitsSuperposesChange"
          />
        </div>

        <div
          v-if="nombreLitsSuperposes > 0"
          class="fr-fieldset__element fr-col-12"
        >
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.litsDessus"
              legend="Pour les lits superposés, les lits « du dessus » seront-ils occupés par des vacanciers  ?"
              :required="true"
              :model-value="litsDessus"
              :options="ouiNonOptions"
              :is-valid="litsDessusMeta.valid"
              :inline="true"
              :error-message="litsDessusErrorMessage"
              @update:model-value="onLitsDessusChange"
            />
          </div>
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsLocaux.nombreMaxPersonnesCouchage"
            label="Nombre maximum de personnes prévues par espace de couchage"
            type="number"
            :required="true"
            :label-visible="true"
            :model-value="nombreMaxPersonnesCouchage"
            :error-message="nombreMaxPersonnesCouchageErrorMessage"
            :is-valid="nombreMaxPersonnesCouchageMeta.valid"
            @update:model-value="onNombreMaxPersonnesCouchageChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.couchageIndividuel"
              legend="Chaque vacancier bénéficie-t-il d’un couchage individuel ?"
              :required="true"
              :model-value="couchageIndividuel"
              :options="ouiNonOptions"
              :is-valid="couchageIndividuelMeta.valid"
              :inline="true"
              :error-message="couchageIndividuelErrorMessage"
              @update:model-value="onCouchageIndividuelChange"
            />
          </div>
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.rangementIndividuel"
              legend="Chaque vacancier bénéficie t-il d’un espace de rangement des affaires personnelles ?"
              :required="true"
              :model-value="rangementIndividuel"
              :options="ouiNonOptions"
              :is-valid="rangementIndividuelMeta.valid"
              :inline="true"
              :error-message="rangementIndividuelErrorMessage"
              @update:model-value="onRangementIndividuelChange"
            />
          </div>
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.chambresUnisexes"
              legend="Les femmes et les hommes dorment-ils dans des lieux séparés ?"
              :required="true"
              :model-value="chambresUnisexes"
              :options="ouiNonOptions"
              :is-valid="chambresUnisexesMeta.valid"
              :inline="true"
              :error-message="chambresUnisexesErrorMessage"
              @update:model-value="onChambresUnisexesChange"
            />
          </div>
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.chambresDoubles"
              legend="Les couples de vacanciers bénéficient t-ils de chambres doubles ?"
              :required="true"
              :model-value="chambresDoubles"
              :options="ouiNonOptions"
              :is-valid="chambresDoublesMeta.valid"
              :inline="true"
              :error-message="chambresDoublesErrorMessage"
              @update:model-value="onChambresDoublesChange"
            />
          </div>
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsLocaux.amenagementsSpecifiques"
              legend="Des aménagements spécifiques des locaux sont-ils prévus pour accueillir les vacanciers ?"
              :required="true"
              :model-value="amenagementsSpecifiques"
              :options="ouiNonOptions"
              :is-valid="amenagementsSpecifiquesMeta.valid"
              :inline="true"
              :error-message="amenagementsSpecifiquesErrorMessage"
              @update:model-value="onAmenagementsSpecifiquesChange"
            />
          </div>
        </div>

        <div
          v-if="amenagementsSpecifiques"
          class="fr-fieldset__element fr-col-12"
        >
          <DsfrInputGroup
            name="caracteristiques.informationsLocaux.precisionAmenagementsSpecifiques"
            label="Précisez"
            hint="Redimensionnez le champ pour saisir plus de ligne"
            :required="true"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionAmenagementsSpecifiques"
            :error-message="precisionAmenagementsSpecifiquesErrorMessage"
            :is-valid="precisionAmenagementsSpecifiquesMeta.valid"
            @update:model-value="onPrecisionAmenagementsSpecifiquesChange"
          />
        </div>
      </DsfrFieldset>
      <DsfrFieldset legend="Informations transports durant le séjour">
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="caracteristiques.informationsTransport.vehiculesAdaptes"
              legend="Les véhicules utilisés sont-ils adaptés ?"
              :required="true"
              :model-value="vehiculesAdaptes"
              :options="ouiNonOptions"
              :is-valid="vehiculesAdaptesMeta.valid"
              :inline="true"
              :error-message="vehiculesAdaptesErrorMessage"
              @update:model-value="onVehiculesAdaptesChange"
            />
          </div>
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsTransport.deplacementProximite"
            :required="true"
            label="Précisez la fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="deplacementProximite"
            :error-message="deplacementProximiteErrorMessage"
            :is-valid="deplacementProximiteMeta.valid"
            @update:model-value="onDeplacementProximiteChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsTransport.excursion"
            :required="true"
            label="Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="excursion"
            :error-message="excursionErrorMessage"
            :is-valid="excursionMeta.valid"
            @update:model-value="onExcursionChange"
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.informationsTransport.rejoindreEtape"
            :required="true"
            label="Précisez le mode de transport utilisé pour rejoindre cette étape"
            :label-visible="true"
            :is-textarea="true"
            :model-value="rejoindreEtape"
            :error-message="rejoindreEtapeErrorMessage"
            :is-valid="rejoindreEtapeMeta.valid"
            @update:model-value="onRejoindreEtapeChange"
          />
        </div>
      </DsfrFieldset>
      <DsfrFieldset legend="Attestation">
        <div class="fr-fieldset__element fr-col-12">
          <DsfrCheckbox
            v-model="attestationACertifie"
            name="caracteristiques.attestation.aCertifie"
            label="Je certifie sur l'honneur que les renseignements portés sur cette déclaration sont exacts."
            :small="true"
            @update:model-value="onAttestationACertifieChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.attestation.nom"
            label="Nom"
            :required="true"
            :label-visible="true"
            placeholder=""
            :model-value="attestationNom"
            :error-message="attestationNomErrorMessage"
            :is-valid="attestationNomMeta"
            @update:model-value="onAttestationNomChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.attestation.prenom"
            label="Prénom"
            :required="true"
            :label-visible="true"
            placeholder=""
            :model-value="attestationPrenom"
            :error-message="attestationPrenomErrorMessage"
            :is-valid="attestationPrenomMeta"
            @update:model-value="onAttestationPrenomChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.attestation.qualite"
            label="Qualité"
            :required="true"
            :label-visible="true"
            placeholder=""
            :model-value="attestationQualite"
            :error-message="attestationQualiteErrorMessage"
            :is-valid="attestationQualiteMeta"
            @update:model-value="onAttestationQualiteChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="caracteristiques.attestation.at"
            label="Date"
            type="date"
            :required="true"
            :label-visible="true"
            placeholder=""
            :model-value="attestationAt"
            :error-message="attestationAtErrorMessage"
            :is-valid="attestationAtMeta"
            @update:model-value="onAttestationAtChange"
          />
        </div>
      </DsfrFieldset>
    </template>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-offset-1 fr-col-4">
        <DsfrButton
          id="cancel-add-hebergement"
          label="Annuler l'ajout d'étape"
          :secondary="true"
          @click.prevent="cancel"
        >
        </DsfrButton>
      </div>
      <div class="fr-fieldset__element fr-col-offset-1 fr-col-4">
        <DsfrButton
          id="submit-add-hebergement"
          label="Valider l'étape"
          :disabled="!meta.valid"
          @click.prevent="next"
        >
        </DsfrButton>
      </div>
    </fieldset>
    <DsfrModal
      ref="modal"
      name="add-hebergement"
      :opened="addHebergementOpened"
      title="Défintion d'un hébergement"
      size="xl"
      @close="closeAddHebergement"
    >
      <Hebergement @cancel="closeAddHebergement" @submit="addHebergement" />
    </DsfrModal>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const props = defineProps({
  hebergement: { type: Object, required: true },
  dateDebutIni: { type: String, required: true },
  dateFinIni: { type: String, required: true },
});

const emit = defineEmits(["cancel", "update"]);

const log = logger("components/DS/hebergement-sejour-detail");

const hebergementStore = useHebergementStore();

const zoom = 16;
const markerLatLng = computed(() => {
  if (
    !hebergementStore.hebergementCourant?.caracteristiques?.coordonnees.adresse
  ) {
    return null;
  }

  return [
    hebergementStore.hebergementCourant.caracteristiques.coordonnees.adresse
      .coordinates[1],
    hebergementStore.hebergementCourant.caracteristiques.coordonnees.adresse
      .coordinates[0],
  ];
});

const hebergementsFavoris = computed(() => {
  return hebergementStore.hebergements.map((h) => {
    return { text: h.nom, value: h.id };
  });
});

const justificatifERPFile = ref();
function changeFile(fileList) {
  justificatifERPFile.value = fileList.length === 1 ? fileList[0] : null;
}

const validationSchema = yup.object({
  dateDebut: yup.date().required(),
  dateFin: yup.date().required(),
  hebergementId: yup
    .string()
    .required("le choix d'un hébergement dans la liste est obligatoire"),
  caracteristiques: yup.object({
    informationsLocaux: yup.object({
      ...hebergementUtils.schema.caracteristiques.informationsLocaux,
    }),
    informationsTransport: yup.object({
      ...hebergementUtils.schema.caracteristiques.informationsTransport,
      rejoindreEtape: yup
        .string()
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour rejoindre le lieu d'hébergement",
        )
        .required(),
    }),
    attestation: yup.object({
      aCertifie: yup
        .boolean()
        .oneOf([true], "Vous devez certifier de ces informations")
        .required(),
      nom: yup
        .string()
        .min(1, "Il est impératif de préciser votre nom")
        .required(),
      prenom: yup
        .string()
        .min(1, "Il est impératif de préciser votre prénom")
        .required(),
      qualite: yup
        .string()
        .min(1, "Il est impératif de préciser votre qualité")
        .required(),
      at: yup.date().required(),
    }),
  }),
});

if (props.hebergement.hebergementId) {
  await hebergementStore.fetchHebergement(props.hebergement.hebergementId);
} else {
  hebergementStore.hebergementCourant = null;
}

const initialValues = {
  dateDebut: props.hebergement.dateDebut
    ? dayjs(props.hebergement.dateDebut).format("YYYY-MM-DD")
    : dayjs(props.dateDebutIni).format("YYYY-MM-DD"),
  dateFin: props.hebergement.dateFin
    ? dayjs(props.hebergement.dateFin).format("YYYY-MM-DD")
    : dayjs(props.dateFinIni).format("YYYY-MM-DD"),
  hebergementId: props.hebergement.hebergementId,
  caracteristiques: {
    informationsLocaux: props.hebergement.caracteristiques
      ?.informationsLocaux ?? {
      prestationsHotelieres: [],
    },
    informationsTransport:
      props.hebergement.caracteristiques?.informationsTransport ?? {},
    attestation: props.hebergement.caracteristiques?.attestation ?? {},
  },
};

const { meta, values, resetForm } = useForm({
  initialValues,
  validationSchema,
});

const {
  value: dateDebut,
  errorMessage: dateDebutErrorMessage,
  handleChange: onDateDebutChange,
  meta: dateDebutMeta,
} = useField("dateDebut");
const {
  value: dateFin,
  errorMessage: dateFinErrorMessage,
  handleChange: onDateFinChange,
  meta: dateFinMeta,
} = useField("dateFin");
const {
  value: hebergementId,
  errorMessage: hebergementIdErrorMessage,
  meta: hebergementIdMeta,
} = useField("hebergementId");

// caracteristiques.informationsLocaux
const {
  value: type,
  errorMessage: typeErrorMessage,
  handleChange: onTypeChange,
  meta: typeMeta,
} = useField("caracteristiques.informationsLocaux.type");
const {
  value: visiteLocaux,
  errorMessage: visiteLocauxErrorMessage,
  handleChange: onVisiteLocauxChange,
  meta: visiteLocauxMeta,
} = useField("caracteristiques.informationsLocaux.visiteLocaux");
const {
  value: visiteLocauxAt,
  errorMessage: visiteLocauxAtErrorMessage,
  handleChange: onVisiteLocauxAtChange,
  meta: visiteLocauxAtMeta,
} = useField("caracteristiques.informationsLocaux.visiteLocauxAt");
const {
  value: accessibilite,
  errorMessage: accessibiliteErrorMessage,
  handleChange: onAccessibiliteChange,
  meta: accessibiliteMeta,
} = useField("caracteristiques.informationsLocaux.accessibilite");
const {
  value: pension,
  errorMessage: pensionErrorMessage,
  meta: pensionMeta,
  handleChange: onPensionChange,
} = useField("caracteristiques.informationsLocaux.pension");
const {
  value: prestationsHotelieres,
  handleChange: onPrestationsHotelieresChange,
  errorMessage: prestationsHotelieresErrorMessage,
} = useField("caracteristiques.informationsLocaux.prestationsHotelieres");
const {
  value: descriptionLieuHebergement,
  errorMessage: descriptionLieuHebergementErrorMessage,
  handleChange: onDescriptionLieuHebergementChange,
  meta: descriptionLieuHebergementMeta,
} = useField("caracteristiques.informationsLocaux.descriptionLieuHebergement");
const {
  value: nombreLits,
  errorMessage: nombreLitsErrorMessage,
  handleChange: onNombreLitsChange,
  meta: nombreLitsMeta,
} = useField("caracteristiques.informationsLocaux.nombreLits");
const {
  value: nombreLitsSuperposes,
  errorMessage: nombreLitsSuperposesErrorMessage,
  handleChange: onNombreLitsSuperposesChange,
  meta: nombreLitsSuperposesMeta,
} = useField("caracteristiques.informationsLocaux.nombreLitsSuperposes");
const {
  value: litsDessus,
  errorMessage: litsDessusErrorMessage,
  handleChange: onLitsDessusChange,
  meta: litsDessusMeta,
} = useField("caracteristiques.informationsLocaux.litsDessus");
const {
  value: nombreMaxPersonnesCouchage,
  errorMessage: nombreMaxPersonnesCouchageErrorMessage,
  handleChange: onNombreMaxPersonnesCouchageChange,
  meta: nombreMaxPersonnesCouchageMeta,
} = useField("caracteristiques.informationsLocaux.nombreMaxPersonnesCouchage");
const {
  value: couchageIndividuel,
  errorMessage: couchageIndividuelErrorMessage,
  handleChange: onCouchageIndividuelChange,
  meta: couchageIndividuelMeta,
} = useField("caracteristiques.informationsLocaux.couchageIndividuel");
const {
  value: rangementIndividuel,
  errorMessage: rangementIndividuelErrorMessage,
  handleChange: onRangementIndividuelChange,
  meta: rangementIndividuelMeta,
} = useField("caracteristiques.informationsLocaux.rangementIndividuel");
const {
  value: chambresUnisexes,
  errorMessage: chambresUnisexesErrorMessage,
  handleChange: onChambresUnisexesChange,
  meta: chambresUnisexesMeta,
} = useField("caracteristiques.informationsLocaux.chambresUnisexes");
const {
  value: chambresDoubles,
  errorMessage: chambresDoublesErrorMessage,
  handleChange: onChambresDoublesChange,
  meta: chambresDoublesMeta,
} = useField("caracteristiques.informationsLocaux.chambresDoubles");
const {
  value: amenagementsSpecifiques,
  errorMessage: amenagementsSpecifiquesErrorMessage,
  handleChange: onAmenagementsSpecifiquesChange,
  meta: amenagementsSpecifiquesMeta,
} = useField("caracteristiques.informationsLocaux.amenagementsSpecifiques");
const {
  value: precisionAmenagementsSpecifiques,
  errorMessage: precisionAmenagementsSpecifiquesErrorMessage,
  handleChange: onPrecisionAmenagementsSpecifiquesChange,
  meta: precisionAmenagementsSpecifiquesMeta,
} = useField(
  "caracteristiques.informationsLocaux.precisionAmenagementsSpecifiques",
);

// caracteristiques.informationsTransport
const {
  value: vehiculesAdaptes,
  errorMessage: vehiculesAdaptesErrorMessage,
  handleChange: onVehiculesAdaptesChange,
  meta: vehiculesAdaptesMeta,
} = useField("caracteristiques.informationsTransport.vehiculesAdaptes");
const {
  value: deplacementProximite,
  errorMessage: deplacementProximiteErrorMessage,
  handleChange: onDeplacementProximiteChange,
  meta: deplacementProximiteMeta,
} = useField("caracteristiques.informationsTransport.deplacementProximite");
const {
  value: excursion,
  errorMessage: excursionErrorMessage,
  handleChange: onExcursionChange,
  meta: excursionMeta,
} = useField("caracteristiques.informationsTransport.excursion");
const {
  value: rejoindreEtape,
  errorMessage: rejoindreEtapeErrorMessage,
  handleChange: onRejoindreEtapeChange,
  meta: rejoindreEtapeMeta,
} = useField("caracteristiques.informationsTransport.rejoindreEtape");

// attestation
const {
  value: attestationACertifie,
  // errorMessage: attestationACertifieErrorMessage,
  handleChange: onAttestationACertifieChange,
  // meta: attestationACertifieMeta,
} = useField("caracteristiques.attestation.aCertifie");
const {
  value: attestationNom,
  errorMessage: attestationNomErrorMessage,
  handleChange: onAttestationNomChange,
  meta: attestationNomMeta,
} = useField("caracteristiques.attestation.nom");
const {
  value: attestationPrenom,
  errorMessage: attestationPrenomErrorMessage,
  handleChange: onAttestationPrenomChange,
  meta: attestationPrenomMeta,
} = useField("caracteristiques.attestation.prenom");
const {
  value: attestationQualite,
  errorMessage: attestationQualiteErrorMessage,
  handleChange: onAttestationQualiteChange,
  meta: attestationQualiteMeta,
} = useField("caracteristiques.attestation.qualite");
const {
  value: attestationAt,
  errorMessage: attestationAtErrorMessage,
  handleChange: onAttestationAtChange,
  meta: attestationAtMeta,
} = useField("caracteristiques.attestation.at");

async function handleHebergementIdChange(hebergementId) {
  if (hebergementId) {
    await hebergementStore.fetchHebergement(hebergementId);
    const newValues = {
      hebergementId,
      caracteristiques: {
        informationsLocaux: {
          ...hebergementStore.hebergementCourant.caracteristiques
            .informationsLocaux,
        },
        informationsTransport: {
          ...hebergementStore.hebergementCourant.caracteristiques
            .informationsTransport,
        },
      },
    };
    resetForm({
      values: newValues,
    });
    log.d("handleHebergementIdChange - done", { ...values });
  }
}

async function next() {
  emit("update", {
    ...values,
  });
}

async function cancel() {
  emit("cancel");
}

const addHebergementOpened = ref(false);

async function addHebergement(hebergement) {
  log.i("addHebergement - IN");
  let id;
  try {
    id = await hebergementStore.addHebergement(hebergement);
  } catch (error) {
    log.w("addHebergement - DONE with error", error);
    toaster.error(
      "Une erreur est survenue lors de l'ajout de l'hébergement au référentiel",
    );
  }
  if (!id) {
    return;
  }
  await hebergementStore.fetchHebergements();
  handleHebergementIdChange(id);
  closeAddHebergement();
  log.i("addHebergement - DONE");
}

function openAddHebergement() {
  log.d("openAddHebergement - IN");
  addHebergementOpened.value = true;
}

function closeAddHebergement() {
  addHebergementOpened.value = false;
}
</script>

<style lang="scss" scoped></style>
