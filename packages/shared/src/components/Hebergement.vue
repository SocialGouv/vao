<template>
  <div>
    <DsfrFieldset legend="Informations sur le lieu de l'hébergement">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nom"
          label="Nom de l'hébergement"
          :label-visible="true"
          placeholder=""
          :model-value="nom"
          :error-message="nomErrorMessage"
          :is-valid="nomMeta"
          required
          :disabled="isDisabled"
          @update:model-value="onNomChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="coordonnees.nomGestionnaire"
          label="Nom du gestionnaire"
          :label-visible="true"
          placeholder=""
          :model-value="nomGestionnaire"
          :error-message="nomGestionnaireErrorMessage"
          :is-valid="nomGestionnaireMeta"
          required
          :disabled="isDisabled"
          @update:model-value="onNomGestionnaireChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <slot
          name="search"
          :label="
            initHebergement.coordonnees?.adresse
              ? 'Nouvelle adresse de l\'hébergement *'
              : 'Adresse de l\'hébergement *'
          "
          :initial-adress="initHebergement.coordonnees?.adresse.label"
          :adresse="adresse"
          :error-message="adresseErrorMessage"
          :on-addresse-change="onAdresseChange"
        />
      </div>
      <div
        v-if="adresse && !isCssDisabled"
        class="fr-fieldset__element fr-col-12"
      >
        <div style="height: 50vh">
          <slot name="map" :markers="markers" />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="coordonnees.numTelephone1"
          label="Numéro de téléphone 1"
          :label-visible="true"
          :model-value="numTelephone1"
          :is-valid="numTelephone1Meta.valid"
          :error-message="numTelephone1ErrorMessage"
          hint="Le numéro de téléphone saisi doit être valide. Exemple : 0612345678"
          placeholder=""
          :disabled="isDisabled"
          @update:model-value="onNumTelephone1Change"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="coordonnees.numTelephone2"
          label="Numéro de téléphone 2"
          :label-visible="true"
          :model-value="numTelephone2"
          :is-valid="numTelephone2Meta.valid"
          :error-message="numTelephone2ErrorMessage"
          hint="Le numéro de téléphone saisi doit être valide. Exemple : 0612345678"
          placeholder=""
          :disabled="isDisabled"
          @update:model-value="onNumTelephone2Change"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="coordonnees.email"
          label="Courriel"
          :label-visible="true"
          :model-value="email"
          :is-valid="emailMeta.valid"
          :error-message="emailErrorMessage"
          hint="Format attendu : nom@domaine.fr"
          placeholder=""
          required
          :disabled="isDisabled"
          @update:model-value="onEmailChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Informations sur le type d'hébergement">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.type"
            legend="Type du lieu d'hébergement"
            :model-value="type"
            :options="hebergementUtils.typeOptions"
            :is-valid="typeMeta"
            :inline="false"
            required
            :disabled="isDisabled"
            :error-message="typeErrorMessage"
            @update:model-value="onTypeChange"
          />
        </div>
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Informations sur les locaux">
      <div class="fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.visiteLocaux"
            legend="Une visite des locaux par l’organisateur a-t-elle été effectuée ?"
            :model-value="visiteLocaux"
            :options="ouiNonOptions"
            :is-valid="visiteLocauxMeta.valid"
            :inline="true"
            required
            :disabled="isDisabled"
            :error-message="visiteLocauxErrorMessage"
            @update:model-value="onVisiteLocauxChange"
          />
        </div>
      </div>
      <div v-if="visiteLocaux" class="fr-col-6">
        <DsfrInputGroup
          name="informationsLocaux.visiteLocauxAt"
          type="date"
          label="Date de la dernière visite (optionnel)"
          :max="dayjs().format('YYYY-MM-DD')"
          :label-visible="true"
          :model-value="visiteLocauxAt"
          :is-valid="visiteLocauxAtMeta.valid"
          :disabled="isDisabled"
          :error-message="visiteLocauxAtErrorMessage"
          @update:model-value="
            onVisiteLocauxAtChange($event === '' ? null : $event)
          "
        />
      </div>
      <DsfrAlert role="status">
        <p>
          Informations ERP : Selon la circulaire du 6 octobre 2023, il sera
          requis l’arrêté d’autorisation du maire et/ou la dernière attestation
          du passage de la commission de sécurité datant de moins de 5 ans pour
          séjours se déroulant en établissement recevant du public (ERP).
        </p>
        <p>
          A défaut de transmission de ces justificatifs, la DDETS met en demeure
          l'organisme de produire ces pièces et propose au Préfet de département
          une annulation des séjours, si absence de tous les justificatifs.
        </p>
        <p>On distingue 3 catégories d’hébergements :</p>
        <ol>
          <li>
            Les établissements recevant du public (ERP, tous les hôtels et les
            gros meubles de tourisme deplus de 15 personnes de type gîtes de
            groupes
          </li>
          <li>
            Les Bâtiments d’Habitation Collective (BHC, comme des résidences de
            tourisme)
          </li>
          <li>
            Les maisons individuelles (MI, comme des chambres d’hôtes et petits
            meublés, qui ne peuvent dépasser 5 chambres et hébergent 15
            personnes au maximum)
          </li>
        </ol>
      </DsfrAlert>
      <div class="fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.reglementationErp"
            legend="Le lieu d’hébergement est-il soumis à la réglementation ERP (établissement recevant du public) ?"
            :model-value="reglementationErp"
            :options="ouiNonOptions"
            :is-valid="reglementationErpMeta.valid"
            :inline="true"
            :error-message="reglementationErpErrorMessage"
            required
            :disabled="isDisabled"
            @update:model-value="onReglementationErpChange"
          />
        </div>
      </div>
      <div v-if="reglementationErp" class="fr-col-12">
        <FileUpload
          v-model="fileDerniereAttestationSecurite"
          label="Téléchargement du document Dernière attestation de passage de la commission sécurité"
          hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
          :modifiable="!isDisabled"
          :cdn-url="cdnUrl"
          :is-disabled="isDisabled"
          :error-message="fileDerniereAttestationSecuriteErrorMessage"
        />
        <FileUpload
          v-model="fileDernierArreteAutorisationMaire"
          label="Téléchargement du document Dernier arrêté d’autorisation du maire"
          hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
          :modifiable="!isDisabled"
          :cdn-url="cdnUrl"
          :is-disabled="isDisabled"
          :error-message="fileDernierArreteAutorisationMaireErrorMessage"
        />
      </div>
      <div v-if="reglementationErp === false" class="fr-col-12">
        <FileUpload
          v-model="fileReponseExploitantOuProprietaire"
          label="Téléchargement du document Réponse du propriétaire ou exploitant indiquant les raisons pour lesquelles le lieu d’hébergement n’est pas soumis à la réglementation ERP *"
          hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
          :modifiable="!isDisabled"
          :cdn-url="cdnUrl"
          :is-disabled="isDisabled"
          :error-message="fileReponseExploitantOuProprietaireErrorMessage"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.accessibilite"
            legend="Accessibilité"
            :model-value="accessibilite"
            :options="hebergementUtils.accessibiliteOptions"
            :is-valid="accessibiliteMeta.valid"
            :inline="false"
            :error-message="accessibiliteErrorMessage"
            required
            :disabled="isDisabled"
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
          label="Précisions (optionnel)"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="accessibilitePrecision"
          :error-message="accessibilitePrecisionErrorMessage"
          :is-valid="accessibilitePrecisionMeta.valid"
          :disabled="isDisabled"
          @update:model-value="onAccessibilitePrecisionChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.pension"
            legend="Type de pension"
            :model-value="pension"
            :options="hebergementUtils.pensionOptions"
            :is-valid="pensionMeta.valid"
            :inline="false"
            :error-message="pensionErrorMessage"
            :disabled="isDisabled"
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
          :error-message="prestationsHotelieresErrorMessage"
          :disabled="isDisabled"
          @update:model-value="onPrestationsHotelieresChange"
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsLocaux.descriptionLieuHebergement"
          label="Description du lieu d’hébergement (parties communes et notamment équipements sanitaires)"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="descriptionLieuHebergement"
          :error-message="descriptionLieuHebergementErrorMessage"
          :is-valid="descriptionLieuHebergementMeta.valid"
          required
          :disabled="isDisabled"
          @update:model-value="onDescriptionLieuHebergementChange"
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsLocaux.nombreLits"
          type="number"
          label="Nombre de lits dans le lieu d'hébergement"
          :label-visible="true"
          placeholder=""
          :model-value="nombreLits"
          :error-message="nombreLitsErrorMessage"
          :is-valid="nombreLitsMeta.valid"
          required
          :disabled="isDisabled"
          @update:model-value="
            onNombreLitsChange($event !== '' ? $event : null)
          "
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsLocaux.nombreLitsSuperposes"
          type="number"
          label="Nombre de lits superposés inclus (optionnel)"
          :label-visible="true"
          placeholder=""
          :model-value="nombreLitsSuperposes"
          :error-message="nombreLitsSuperposesErrorMessage"
          :is-valid="nombreLitsSuperposesMeta.valid"
          :disabled="isDisabled"
          @update:model-value="
            onNombreLitsSuperposesChange($event !== '' ? $event : null)
          "
        />
      </div>

      <div v-if="nombreLitsSuperposes > 0" class="fr-col-12">
        <div class="fr-fieldset__element fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.litsDessus"
            legend="Pour les lits superposés, les lits « du dessus » seront-ils occupés par des vacanciers  ?"
            :model-value="litsDessus"
            :options="ouiNonOptions"
            :is-valid="litsDessusMeta.valid"
            :inline="true"
            :error-message="litsDessusErrorMessage"
            required
            :disabled="isDisabled"
            @update:model-value="onLitsDessusChange"
          />
        </div>
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsLocaux.nombreMaxPersonnesCouchage"
          label="Nombre maximum de personnes prévues par espace de couchage"
          type="number"
          :label-visible="true"
          :model-value="nombreMaxPersonnesCouchage"
          :error-message="nombreMaxPersonnesCouchageErrorMessage"
          :is-valid="nombreMaxPersonnesCouchageMeta.valid"
          required
          :disabled="isDisabled"
          @update:model-value="
            onNombreMaxPersonnesCouchageChange($event !== '' ? $event : null)
          "
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.couchageIndividuel"
            legend="Chaque vacancier bénéficie-t-il d’un couchage individuel ?"
            :model-value="couchageIndividuel"
            :options="ouiNonOptions"
            :is-valid="couchageIndividuelMeta.valid"
            :inline="true"
            required
            :disabled="isDisabled"
            :error-message="couchageIndividuelErrorMessage"
            @update:model-value="onCouchageIndividuelChange"
          />
        </div>
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.rangementIndividuel"
            legend="Chaque vacancier bénéficie t-il d’un espace de rangement des affaires personnelles ?"
            :model-value="rangementIndividuel"
            :options="ouiNonOptions"
            :is-valid="rangementIndividuelMeta.valid"
            :inline="true"
            required
            :disabled="isDisabled"
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
            :model-value="chambresUnisexes"
            :options="ouiNonOptions"
            :is-valid="chambresUnisexesMeta.valid"
            :inline="true"
            :disabled="isDisabled"
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
            :model-value="chambresDoubles"
            :options="ouiNonOptions"
            :is-valid="chambresDoublesMeta.valid"
            :inline="true"
            required
            :disabled="isDisabled"
            :error-message="chambresDoublesErrorMessage"
            @update:model-value="onChambresDoublesChange"
          />
        </div>
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsLocaux.amenagementsSpecifiques"
            legend="Des aménagements spécifiques des locaux sont-ils prévus pour accueillir les vacanciers ?"
            :model-value="amenagementsSpecifiques"
            :options="ouiNonOptions"
            :is-valid="amenagementsSpecifiquesMeta.valid"
            :inline="true"
            required
            :disabled="isDisabled"
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
          label="Précisez"
          hint="Redimensionnez le champ pour saisir plus de ligne. Minumum 5 caractères"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionAmenagementsSpecifiques"
          :error-message="precisionAmenagementsSpecifiquesErrorMessage"
          :is-valid="precisionAmenagementsSpecifiquesMeta.valid"
          :disabled="isDisabled"
          hitn="Minumum 5 caractères"
          @update:model-value="onPrecisionAmenagementsSpecifiquesChange"
        />
      </div>
    </DsfrFieldset>

    <DsfrFieldset legend="Informations transports durant le séjour">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="informationsVisite.vehiculesAdaptes"
            legend="Les véhicules utilisés sont-ils adaptés ?"
            :model-value="vehiculesAdaptes"
            :options="ouiNonOptions"
            :is-valid="vehiculesAdaptesMeta.valid"
            :inline="true"
            required
            :disabled="isDisabled"
            :error-message="vehiculesAdaptesErrorMessage"
            @update:model-value="onVehiculesAdaptesChange"
          />
        </div>
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsVisite.deplacementProximite"
          label="Précisez la fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="deplacementProximite"
          :error-message="deplacementProximiteErrorMessage"
          :is-valid="deplacementProximiteMeta.valid"
          required
          :disabled="isDisabled"
          @update:model-value="onDeplacementProximiteChange"
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsVisite.excursion"
          label="Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="excursion"
          :error-message="excursionErrorMessage"
          :is-valid="excursionMeta.valid"
          required
          :disabled="isDisabled"
          @update:model-value="onExcursionChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-grid-row">
          <div v-if="!props.isDownloading" class="fr-col-4">
            <div class="fr-input-group">
              <nuxt-link :to="backRoute" class="back-button">
                <DsfrButton type="button" secondary>Retour</DsfrButton>
              </nuxt-link>
            </div>
          </div>
          <div v-if="isSaveVisible" class="fr-col-4">
            <div class="fr-input-group">
              <DsfrButton
                v-if="!props.isDownloading"
                id="next-step"
                :disabled="!meta.valid"
                type="button"
                @click="submit"
                >{{ labelNext }}
              </DsfrButton>
              <is-downloading
                :is-downloading="props.isDownloading"
                :message="props.message"
              />
            </div>
          </div>
        </div>
      </div>
    </DsfrFieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import {
  DsfrInputGroup,
  DsfrButton,
  DsfrRadioButtonSet,
  DsfrCheckboxSet,
} from "@gouvminint/vue-dsfr";
import IsDownloading from "./IsDownloading.vue";
import { hebergement as hebergementUtils } from "@vao/shared";
import FileUpload from "./FileUpload.vue";

const toaster = useToaster();

const emit = defineEmits(["cancel", "submit"]);

const ouiNonOptions = [
  {
    label: "Oui",
    value: true,
  },
  {
    label: "Non",
    value: false,
  },
];

const props = defineProps({
  initHebergement: {
    type: Object,
    default: () => ({}),
  },
  isDisabled: { type: Boolean, default: false },
  labelNext: { type: String, default: "Ajouter hébergement" },
  isDownloading: { type: Boolean, default: false },
  message: { type: String, required: false, default: null },
  isSaveVisible: { type: Boolean, default: false },
  defaultBackRoute: { type: String, required: true },
  cdnUrl: { type: String, required: true },
});

const log = logger("components/hebergement");

const validationSchema = yup.object(hebergementUtils.schema);

const initialValues = {
  nom: props.initHebergement.nom ?? null,
  coordonnees: {
    adresse: null,
    nomGestionnaire: null,
    numTelephone1: null,
    numTelephone2: null,
    email: null,
    ...(props.initHebergement.coordonnees || {}),
  },
  informationsLocaux: {
    type: null,
    accessibilite: null,
    accessibilitePrecision: null,
    pension: null,
    prestationsHotelieres: [],
    visiteLocaux: null,
    reglementationErp: null,
    fileDerniereAttestationSecurite: null,
    fileDernierArreteAutorisationMaire: null,
    fileReponseExploitantOuProprietaire: null,
    descriptionLieuHebergement: null,
    nombreLits: null,
    nombreLitsSuperposes: null,
    litsDessus: null,
    nombreMaxPersonnesCouchage: null,
    couchageIndividuel: null,
    rangementIndividuel: null,
    chambresUnisexes: null,
    chambresDoubles: null,
    amenagementsSpecifiques: null,
    precisionAmenagementsSpecifiques: null,
    ...(props.initHebergement.informationsLocaux || {}),
    visiteLocauxAt: props.initHebergement?.informationsLocaux?.visiteLocauxAt
      ? dayjs(props.initHebergement.informationsLocaux.visiteLocauxAt).format(
          "YYYY-MM-DD",
        )
      : null,
  },
  informationsTransport: {
    deplacementProximite: null,
    excursion: null,
    ...(props.initHebergement.informationsTransport || {}),
  },
};

const router = useRouter();
const backRoute = computed(
  () => router.options.history.state.back ?? props.defaultBackRoute,
);

const isCssDisabled = !document.styleSheets.length;

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});
const {
  value: nom,
  errorMessage: nomErrorMessage,
  handleChange: onNomChange,
  meta: nomMeta,
} = useField("nom");
const {
  value: nomGestionnaire,
  errorMessage: nomGestionnaireErrorMessage,
  handleChange: onNomGestionnaireChange,
  meta: nomGestionnaireMeta,
} = useField("coordonnees.nomGestionnaire");
const {
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAdresseChange,
} = useField("coordonnees.adresse");
const {
  value: numTelephone1,
  errorMessage: numTelephone1ErrorMessage,
  handleChange: onNumTelephone1Change,
  meta: numTelephone1Meta,
} = useField("coordonnees.numTelephone1");
const {
  value: numTelephone2,
  errorMessage: numTelephone2ErrorMessage,
  handleChange: onNumTelephone2Change,
  meta: numTelephone2Meta,
} = useField("coordonnees.numTelephone2");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("coordonnees.email");
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
  errorMessage: prestationsHotelieresErrorMessage,
  handleChange: onPrestationsHotelieresChange,
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

const markers = computed(() => {
  return [adresse.value.coordinates[1], adresse.value.coordinates[0]];
});

function verifFormatFile(file, toasterMessage) {
  if (checkFormatFile(file.value)) return true;
  else {
    toaster.error(
      toasterMessage + " doit obligatoirement être au format pdf, png ou jpg",
    );
    return false;
  }
}

function submit() {
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
  ) {
    log.i("submit", { ...toRaw(values) });
    emit("submit", { ...toRaw(values) });
  }
}
</script>

<style lang="scss" scoped>
.back-button {
  background-image: none;
}
</style>
