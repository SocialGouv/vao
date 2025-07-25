<template>
  <div>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-5">
        <DsfrInputGroup
          name="dateDebut"
          type="date"
          label="Date de début"
          :min="props.dateDebutIni"
          :max="props.dateFinIni"
          :label-visible="true"
          :model-value="dateDebut"
          :readonly="!props.modifiable"
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
          label="Date de fin"
          :min="props.dateDebutIni"
          :max="props.dateFinIni"
          :label-visible="true"
          :model-value="dateFin"
          :readonly="!props.modifiable"
          :is-valid="dateFinMeta.valid"
          :error-message="dateFinErrorMessage"
          placeholder="Date de fin"
          @update:model-value="onDateFinChange"
        />
      </div>
    </div>
    <div v-if="props.modifiable" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <DsfrSelect
          :model-value="hebergementId"
          default-unselected-text="Sélectionner un hébergement"
          name="hebergementId"
          label="Hebergement"
          :disabled="!props.modifiable"
          :options="hebergementsFavoris"
          :is-valid="hebergementIdMeta.valid"
          :error-message="hebergementIdErrorMessage"
          @update:model-value="handleHebergementIdChange"
        />
      </div>
      <div v-if="props.modifiable" class="fr-fieldset__element fr-col-4">
        <DsfrButton id="retour" :secondary="true" @click="openAddHebergement"
          >Créer un lieu d'hébergement
        </DsfrButton>
      </div>
    </div>
    <template v-if="hebergementStore.hebergementCourant">
      <DsfrFieldset legend="Informations sur le lieu d'hébergement">
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="nom"
            label="Nom de l'hébergement"
            :label-visible="true"
            :model-value="hebergementStore.hebergementCourant.nom"
            disabled
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="nomGestionnaire"
            label="Nom du gestionnaire"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.coordonnees.nomGestionnaire
            "
            disabled
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="adresse"
            label="Adresse du lieu d'hébergement"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.coordonnees.adresse.label
            "
            disabled
          />
        </div>
        <div
          v-if="!isCssDisabled"
          class="fr-fieldset__element fr-col-12"
          style="height: 50vh"
        >
          <MglMap
            :map-style="`https://api.maptiler.com/maps/streets/style.json?key=${config.public.apiMapTiler}`"
            :zoom="zoom"
            :center="markerLatLng"
          >
            <MglNavigationControl />
            <MglMarker :coordinates="markerLatLng" />
          </MglMap>
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="numTelephone1"
            label="Numéro de téléphone 1"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.coordonnees.numTelephone1
            "
            disabled
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="numTelephone2"
            label="Numéro de téléphone 2"
            :label-visible="true"
            :model-value="
              hebergementStore.hebergementCourant.coordonnees.numTelephone2
            "
            disabled
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="email"
            label="Adresse courriel"
            :label-visible="true"
            :model-value="hebergementStore.hebergementCourant.coordonnees.email"
            disabled
          />
        </div>
      </DsfrFieldset>
      <DsfrFieldset legend="Type de lieu de l'hébergement">
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="informationsLocaux.type"
              legend="Type du lieu d'hébergement"
              :model-value="type"
              disabled
              :options="hebergementUtils.typeOptions"
              :is-valid="typeMeta.valid"
              :inline="false"
              :error-message="typeErrorMessage"
              @update:model-value="onTypeChange"
            />
          </div>
        </div>
      </DsfrFieldset>
      <DsfrFieldset legend="Informations sur les locaux">
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="informationsLocaux.visiteLocaux"
              legend="Une visite des locaux par l’organisateur a-t-elle été effectuée ?"
              disabled
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
            name="informationsLocaux.visiteLocauxAt"
            type="date"
            label="Date de la dernière visite "
            :label-visible="true"
            :model-value="dateVisiteAtFormated"
            disabled
            :is-valid="visiteLocauxAtMeta.valid"
            :error-message="visiteLocauxAtErrorMessage"
            @update:model-value="onVisiteLocauxAtChange"
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="informationsLocaux.reglementationErp"
              legend="Le lieu d’hébergement est-il soumis à la réglementation ERP (établissement recevant du public) ?"
              disabled
              :model-value="reglementationErp"
              :options="ouiNonOptions"
              :is-valid="reglementationErpMeta.valid"
              :inline="true"
              :error-message="reglementationErpErrorMessage"
              @update:model-value="onReglementationErpChange"
            />
          </div>
        </div>
        <div v-if="reglementationErp">
          <FileUpload
            v-model="fileDerniereAttestationSecurite"
            label="Téléchargement du document Dernière attestation de passage de la commission sécurité"
            hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
            :modifiable="false"
            :error-message="fileDerniereAttestationSecuriteErrorMessage"
          />
          <FileUpload
            v-model="fileDernierArreteAutorisationMaire"
            label="Téléchargement du document Dernier arrêté d’autorisation du maire"
            hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
            :modifiable="false"
            :error-message="fileDernierArreteAutorisationMaireErrorMessage"
          />
        </div>
        <div v-if="reglementationErp === false">
          <FileUpload
            v-model="fileReponseExploitantOuProprietaire"
            label="Téléchargement du document Réponse du propriétaire ou exploitant indiquant les raisons pour lesquelles le lieu d’hébergement n’est pas soumis à la réglementation ERP"
            hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
            :modifiable="false"
            :error-message="fileReponseExploitantOuProprietaireErrorMessage"
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="informationsLocaux.accessibilite"
              legend="Accessibilité"
              disabled
              :model-value="accessibilite"
              :options="hebergementUtils.accessibiliteOptions"
              :is-valid="accessibiliteMeta.valid"
              :inline="false"
              :error-message="accessibiliteErrorMessage"
              @update:model-value="onAccessibiliteChange"
            />
          </div>
        </div>
        <div
          v-if="accessibilite === 'commentaires'"
          class="fr-fieldset__element fr-col-12"
        >
          <DsfrInputGroup
            name="informationsLocaux.accessibilitePrecision"
            label="Précisez les informations concernant l'accessibilité"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            hint="Minimum 5 caractères"
            :model-value="accessibilitePrecision"
            :error-message="accessibilitePrecisionErrorMessage"
            :is-valid="accessibilitePrecisionMeta.valid"
            disabled
            @update:model-value="onAccessibilitePrecisionChange"
          />
        </div>
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="informationsLocaux.pension"
              legend="Type de pension"
              disabled
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
            name="informationsLocaux.prestationsHotelieres"
            legend="Prestations hôtelières assurées par le lieu d’accueil"
            :model-value="prestationsHotelieres"
            :inline="true"
            :options="hebergementUtils.prestationsHotelieresOptions"
            :small="true"
            disabled
            :error-message="prestationsHotelieresErrorMessage"
            @update:model-value="onPrestationsHotelieresChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="informationsLocaux.descriptionLieuHebergement"
            label="Description du lieu d’hébergement (parties communes et notamment équipements sanitaires)"
            placeholder=""
            :readonly="!props.modifiable"
            :label-visible="true"
            :is-textarea="true"
            :model-value="descriptionLieuHebergement"
            :error-message="descriptionLieuHebergementErrorMessage"
            :is-valid="descriptionLieuHebergementMeta.valid"
            disabled
            @update:model-value="onDescriptionLieuHebergementChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="informationsLocaux.nombreLits"
            type="number"
            label="Nombre de lits dans le lieu d'hébergement"
            placeholder=""
            :label-visible="true"
            :readonly="!props.modifiable"
            :model-value="nombreLits"
            :error-message="nombreLitsErrorMessage"
            :is-valid="nombreLitsMeta.valid"
            disabled
            @update:model-value="onNombreLitsChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="informationsLocaux.nombreLitsSuperposes"
            :readonly="!props.modifiable"
            type="number"
            label="Nombre de lits superposés inclus"
            :label-visible="true"
            placeholder=""
            :model-value="nombreLitsSuperposes"
            :error-message="nombreLitsSuperposesErrorMessage"
            :is-valid="nombreLitsSuperposesMeta.valid"
            disabled
            @update:model-value="
              onNombreLitsSuperposesChange($event !== '' ? $event : null)
            "
          />
        </div>

        <div
          v-if="nombreLitsSuperposes > 0"
          class="fr-fieldset__element fr-col-12"
        >
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="informationsLocaux.litsDessus"
              legend="Pour les lits superposés, les lits « du dessus » seront-ils occupés
            par des vacanciers ?"
              disabled
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
            name="informationsLocaux.nombreMaxPersonnesCouchage"
            label="Nombre maximum de personnes prévues par espace de couchage"
            type="number"
            disabled
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
              name="informationsLocaux.couchageIndividuel"
              legend="Chaque vacancier bénéficie-t-il d’un couchage individuel ?"
              disabled
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
              name="informationsLocaux.rangementIndividuel"
              legend="Chaque vacancier bénéficie t-il d’un espace de rangement des
            affaires personnelles ?"
              disabled
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
              name="informationsLocaux.chambresUnisexes"
              legend="Les femmes et les hommes dorment-ils dans des lieux séparés ?"
              disabled
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
              name="informationsLocaux.chambresDoubles"
              legend="Les couples de vacanciers bénéficient t-ils de chambres doubles ?"
              disabled
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
              name="informationsLocaux.amenagementsSpecifiques"
              legend="Des aménagements spécifiques des locaux sont-ils prévus pour
            accueillir les vacanciers ?"
              disabled
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
            name="informationsLocaux.precisionAmenagementsSpecifiques"
            label="Précisez les types d'aménagements"
            hint="Redimensionnez le champ pour saisir plus de ligne. Minimum 5 caractères"
            disabled
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
              name="informationsTransport.vehiculesAdaptes"
              legend="Les véhicules utilisés sont-ils adaptés ?"
              disabled
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
            name="informationsTransport.deplacementProximite"
            disabled
            label="Précisez la fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité. Minimum 5 caractères"
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
            name="informationsTransport.excursion"
            disabled
            label="Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions. Minimum 5 caractères"
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
            name="informationsTransport.rejoindreEtape"
            disabled
            label="Précisez le mode de transport utilisé pour rejoindre cette étape (optionnel)"
            :label-visible="true"
            :is-textarea="true"
            :model-value="rejoindreEtape"
            :error-message="rejoindreEtapeErrorMessage"
            :is-valid="rejoindreEtapeMeta.valid"
            @update:model-value="onRejoindreEtapeChange"
          />
        </div>
      </DsfrFieldset>
    </template>

    <div v-if="props.showButtons" class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
        <DsfrButton
          v-if="!props.modifiable"
          id="cancel-add-hebergement"
          label="Retourner à la liste"
          :secondary="true"
          @click.prevent="cancel"
        >
        </DsfrButton>
        <DsfrButton
          v-if="props.modifiable"
          id="cancel-add-hebergement"
          label="Annuler l'ajout d'hébergement"
          :secondary="true"
          @click.prevent="cancel"
        >
        </DsfrButton>
        <DsfrButton
          v-if="props.modifiable"
          id="submit-add-hebergement"
          :disabled="!hebergementId"
          label="Ajouter l’hébergement"
          @click.prevent="next"
        >
        </DsfrButton>
      </DsfrButtonGroup>
    </div>

    <DsfrModal
      ref="modal"
      name="add-hebergement"
      :opened="addHebergementOpened"
      title="Définition d'un hébergement"
      size="xl"
      @close="closeAddHebergement"
    >
      <HebergementWithSave
        :is-downloading="apiStatus.isDownloading"
        default-back-route="/hebergements"
        :cdn-url="`${config.public.backendUrl}/documents/`"
        is-save-visible
        :message="apiStatus.message"
        @cancel="closeAddHebergement"
        @submit="addHebergement"
      />
    </DsfrModal>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { FileUpload, hebergement as hebergementUtils } from "@vao/shared";
import { getFileUploadErrorMessage } from "@vao/shared/src/utils/file.mjs";

const config = useRuntimeConfig();

const toaster = useToaster();
const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();

const props = defineProps({
  hebergement: { type: Object, required: true },
  dateDebutIni: { type: String, required: true },
  dateFinIni: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
});

const emit = defineEmits(["cancel", "update"]);

const log = logger("components/DS/hebergement-sejour-detail");

const hebergementStore = useHebergementStore();
const demandeSejourStore = useDemandeSejourStore();

const zoom = 15;
const markerLatLng = computed(() => {
  if (!hebergementStore.hebergementCourant?.coordonnees.adresse) {
    return null;
  }

  return hebergementStore.hebergementCourant.coordonnees.adresse.coordinates;
});

const dateVisiteAtFormated = computed(() => {
  return hebergementStore.hebergementCourant?.informationsLocaux?.visiteLocauxAt
    ? dayjs(
        hebergementStore.hebergementCourant.informationsLocaux.visiteLocauxAt,
      ).format("YYYY-MM-DD")
    : null;
});

const hebergementsFavoris = computed(() => {
  return hebergementStore.hebergements.map((h) => {
    return { text: h.nom, value: h.id };
  });
});

const validationSchema = yup.object(DeclarationSejour.hebergementDetailsSchema);

if (props.hebergement.hebergementId) {
  await hebergementStore.fetchById(props.hebergement.hebergementId);
} else {
  hebergementStore.hebergementCourant = null;
}

const isCssDisabled = cssHelper.isCssDisabled();

const initialValues = {
  dateDebut: props.hebergement.dateDebut
    ? dayjs(props.hebergement.dateDebut).format("YYYY-MM-DD")
    : dayjs(props.dateDebutIni).format("YYYY-MM-DD"),
  dateFin: props.hebergement.dateFin
    ? dayjs(props.hebergement.dateFin).format("YYYY-MM-DD")
    : dayjs(props.dateFinIni).format("YYYY-MM-DD"),
  hebergementId: props.hebergement.hebergementId,
  coordonnees: { ...(props.hebergement.coordonnees ?? {}) },
  informationsLocaux: {
    ...(props.hebergement.informationsLocaux ?? {
      prestationsHotelieres: [],
    }),
  },
  informationsTransport: {
    ...(props.hebergement.informationsTransport ?? {}),
  },
  nom: props.hebergement.nom,
};

const { values, setValues } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: props.validateOnMount,
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

// informationsLocaux
const {
  value: type,
  errorMessage: typeErrorMessage,
  handleChange: onTypeChange,
  meta: typeMeta,
} = useField("informationsLocaux.type");
const {
  value: visiteLocaux,
  errorMessage: visiteLocauxErrorMessage,
  handleChange: onVisiteLocauxChange,
  meta: visiteLocauxMeta,
} = useField("informationsLocaux.visiteLocaux");
const {
  value: visiteLocauxAt,
  errorMessage: visiteLocauxAtErrorMessage,
  handleChange: onVisiteLocauxAtChange,
  meta: visiteLocauxAtMeta,
} = useField("informationsLocaux.visiteLocauxAt");
const {
  value: reglementationErp,
  errorMessage: reglementationErpErrorMessage,
  handleChange: onReglementationErpChange,
  meta: reglementationErpMeta,
} = useField("informationsLocaux.reglementationErp");
const {
  value: fileDerniereAttestationSecurite,
  errorMessage: fileDerniereAttestationSecuriteErrorMessage,
} = useField("informationsLocaux.fileDerniereAttestationSecurite");
const {
  value: fileDernierArreteAutorisationMaire,
  errorMessage: fileDernierArreteAutorisationMaireErrorMessage,
} = useField("informationsLocaux.fileDernierArreteAutorisationMaire");
const {
  value: fileReponseExploitantOuProprietaire,
  errorMessage: fileReponseExploitantOuProprietaireErrorMessage,
} = useField("informationsLocaux.fileReponseExploitantOuProprietaire");
const {
  value: accessibilite,
  errorMessage: accessibiliteErrorMessage,
  handleChange: onAccessibiliteChange,
  meta: accessibiliteMeta,
} = useField("informationsLocaux.accessibilite");
const {
  value: accessibilitePrecision,
  errorMessage: accessibilitePrecisionErrorMessage,
  handleChange: onAccessibilitePrecisionChange,
  meta: accessibilitePrecisionMeta,
} = useField("informationsLocaux.accessibilitePrecision");
const {
  value: pension,
  errorMessage: pensionErrorMessage,
  meta: pensionMeta,
  handleChange: onPensionChange,
} = useField("informationsLocaux.pension");
const {
  value: prestationsHotelieres,
  handleChange: onPrestationsHotelieresChange,
  errorMessage: prestationsHotelieresErrorMessage,
} = useField("informationsLocaux.prestationsHotelieres");
const {
  value: descriptionLieuHebergement,
  errorMessage: descriptionLieuHebergementErrorMessage,
  handleChange: onDescriptionLieuHebergementChange,
  meta: descriptionLieuHebergementMeta,
} = useField("informationsLocaux.descriptionLieuHebergement");
const {
  value: nombreLits,
  errorMessage: nombreLitsErrorMessage,
  handleChange: onNombreLitsChange,
  meta: nombreLitsMeta,
} = useField("informationsLocaux.nombreLits");
const {
  value: nombreLitsSuperposes,
  errorMessage: nombreLitsSuperposesErrorMessage,
  handleChange: onNombreLitsSuperposesChange,
  meta: nombreLitsSuperposesMeta,
} = useField("informationsLocaux.nombreLitsSuperposes");
const {
  value: litsDessus,
  errorMessage: litsDessusErrorMessage,
  handleChange: onLitsDessusChange,
  meta: litsDessusMeta,
} = useField("informationsLocaux.litsDessus");
const {
  value: nombreMaxPersonnesCouchage,
  errorMessage: nombreMaxPersonnesCouchageErrorMessage,
  handleChange: onNombreMaxPersonnesCouchageChange,
  meta: nombreMaxPersonnesCouchageMeta,
} = useField("informationsLocaux.nombreMaxPersonnesCouchage");
const {
  value: couchageIndividuel,
  errorMessage: couchageIndividuelErrorMessage,
  handleChange: onCouchageIndividuelChange,
  meta: couchageIndividuelMeta,
} = useField("informationsLocaux.couchageIndividuel");
const {
  value: rangementIndividuel,
  errorMessage: rangementIndividuelErrorMessage,
  handleChange: onRangementIndividuelChange,
  meta: rangementIndividuelMeta,
} = useField("informationsLocaux.rangementIndividuel");
const {
  value: chambresUnisexes,
  errorMessage: chambresUnisexesErrorMessage,
  handleChange: onChambresUnisexesChange,
  meta: chambresUnisexesMeta,
} = useField("informationsLocaux.chambresUnisexes");
const {
  value: chambresDoubles,
  errorMessage: chambresDoublesErrorMessage,
  handleChange: onChambresDoublesChange,
  meta: chambresDoublesMeta,
} = useField("informationsLocaux.chambresDoubles");
const {
  value: amenagementsSpecifiques,
  errorMessage: amenagementsSpecifiquesErrorMessage,
  handleChange: onAmenagementsSpecifiquesChange,
  meta: amenagementsSpecifiquesMeta,
} = useField("informationsLocaux.amenagementsSpecifiques");
const {
  value: precisionAmenagementsSpecifiques,
  errorMessage: precisionAmenagementsSpecifiquesErrorMessage,
  handleChange: onPrecisionAmenagementsSpecifiquesChange,
  meta: precisionAmenagementsSpecifiquesMeta,
} = useField("informationsLocaux.precisionAmenagementsSpecifiques");

// informationsTransport
const {
  value: vehiculesAdaptes,
  errorMessage: vehiculesAdaptesErrorMessage,
  handleChange: onVehiculesAdaptesChange,
  meta: vehiculesAdaptesMeta,
} = useField("informationsTransport.vehiculesAdaptes");
const {
  value: deplacementProximite,
  errorMessage: deplacementProximiteErrorMessage,
  handleChange: onDeplacementProximiteChange,
  meta: deplacementProximiteMeta,
} = useField("informationsTransport.deplacementProximite");
const {
  value: excursion,
  errorMessage: excursionErrorMessage,
  handleChange: onExcursionChange,
  meta: excursionMeta,
} = useField("informationsTransport.excursion");
const {
  value: rejoindreEtape,
  errorMessage: rejoindreEtapeErrorMessage,
  handleChange: onRejoindreEtapeChange,
  meta: rejoindreEtapeMeta,
} = useField("informationsTransport.rejoindreEtape");

async function handleHebergementIdChange(hebergementId) {
  if (hebergementId) {
    log.d("handleHebergementIdChange - in", { hebergementId });
    await hebergementStore.fetchById(hebergementId);
    const newValues = {
      hebergementId: hebergementStore.hebergementCourant.id,
      coordonnees: {
        ...hebergementStore.hebergementCourant.coordonnees,
      },
      informationsLocaux: {
        ...hebergementStore.hebergementCourant.informationsLocaux,
      },
      informationsTransport: {
        ...hebergementStore.hebergementCourant.informationsTransport,
      },
      nom: hebergementStore.hebergementCourant.nom,
    };
    setValues(newValues);
    log.d("handleHebergementIdChange - done", { ...values });
  }
}

function verifFormatFile(file, toasterMessage) {
  if (checkFormatFile(file.value)) return true;
  else {
    toaster.error({
      titleTag: "h2",
      description:
        toasterMessage + " doit obligatoirement être au format pdf, png ou jpg",
    });
    return false;
  }
}

function next() {
  log.d("update", { ...toRaw(values) });
  // Vérification du format des fichiers avant enregistrement
  if (
    (reglementationErp.value === true &&
      verifFormatFile(
        fileDernierArreteAutorisationMaire,
        "L'arrêté d'autorisation du Maire",
      ) &&
      verifFormatFile(
        fileDerniereAttestationSecurite,
        "La dernière attestation de passage de la commission de sécurité",
      )) ||
    (reglementationErp.value === false &&
      verifFormatFile(
        fileReponseExploitantOuProprietaire,
        "La réponse de l'exploitant/propriétaire",
      ))
  )
    emit("update", { ...toRaw(values) });
}

async function cancel() {
  emit("cancel");
}

const addHebergementOpened = ref(false);

async function addHebergement(hebergement) {
  log.i("addHebergement - IN", { hebergement });
  setApiStatut("Ajout de l'hébergement en cours");
  let id;
  try {
    await hebergementStore.uploadAllFiles(hebergement);
  } catch (error) {
    const description = getFileUploadErrorMessage(
      error?.fileName,
      error?.data?.name,
    );
    toaster.error({
      titleTag: "h2",
      description,
    });
    resetApiStatut();
    return;
  }

  try {
    id = await hebergementStore.updateOrCreate(hebergement);
  } catch (error) {
    log.w("addHebergement - DONE with error", error);
    toaster.error({
      titleTag: "h2",
      description:
        "Une erreur est survenue lors de l'ajout de l'hébergement au référentiel",
    });
  }
  if (!id) {
    return;
  }
  await hebergementStore.fetch({
    organismeId: demandeSejourStore.demandeCourante.organismeId,
  });
  handleHebergementIdChange(id);
  resetApiStatut();
  closeAddHebergement();
  log.i("addHebergement - DONE");
}

function openAddHebergement() {
  addHebergementOpened.value = true;
}

function closeAddHebergement() {
  addHebergementOpened.value = false;
}
</script>
