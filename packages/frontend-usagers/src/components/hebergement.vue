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
          @update:model-value="onNomGestionnaireChange"
        />
      </div>
      <SearchAddress
        name="coordonnees.adresse"
        :value="adresse"
        :label="
          props.initHebergement.coordonnees?.adresse
            ? 'Nouvelle adresse de l\'hébergement'
            : 'Adresse de l\'hébergement'
        "
        :initial-adress="props.initHebergement.coordonnees?.adresse?.label"
        :error-message="adresseErrorMessage"
        @select="onAdresseChange"
      ></SearchAddress>

      <div v-if="adresse" class="fr-fieldset__element fr-col-12">
        <div style="height: 50vh; width: 50vw">
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
          :model-value="visiteLocauxAt"
          :is-valid="visiteLocauxAtMeta.valid"
          :error-message="visiteLocauxAtErrorMessage"
          @update:model-value="onVisiteLocauxAtChange"
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
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="accessibilitePrecision"
          :error-message="accessibilitePrecisionErrorMessage"
          :is-valid="accessibilitePrecisionMeta.valid"
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
          @update:model-value="onNombreLitsChange"
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="informationsLocaux.nombreLitsSuperposes"
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
            name="informationsLocaux.litsDessus"
            legend="Pour les lits superposés, les lits « du dessus » seront-ils occupés par des vacanciers  ?"
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
            legend="Chaque vacancier bénéficie t-il d’un espace de rangement des affaires personnelles ?"
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
            legend="Des aménagements spécifiques des locaux sont-ils prévus pour accueillir les vacanciers ?"
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
          label="Précisez"
          hint="Redimensionnez le champ pour saisir plus de ligne"
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
            name="informationsVisite.vehiculesAdaptes"
            legend="Les véhicules utilisés sont-ils adaptés ?"
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
          name="informationsVisite.deplacementProximite"
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
          name="informationsVisite.excursion"
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
    </DsfrFieldset>

    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="previous-step" :secondary="true" @click.prevent="back"
            >Retour
          </DsfrButton>
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton
            id="next-step"
            :disabled="!meta.valid"
            @click.prevent="submit"
            >{{ labelNext }}
          </DsfrButton>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const emit = defineEmits(["cancel", "submit"]);

const props = defineProps({
  initHebergement: {
    type: Object,
    default: () => ({}),
  },
  labelNext: { type: String, default: "Ajouter hébergement" },
});

const log = logger("components/hebergement");

const zoom = 16;

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
    visiteLocauxAt: null,
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
  },
  informationsTransport: {
    deplacementProximite: null,
    excursion: null,
    ...(props.initHebergement.informationsTransport || {}),
  },
};

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

const markerLatLng = computed(() => {
  return [adresse.value.coordinates[1], adresse.value.coordinates[0]];
});

function back() {
  emit("cancel");
}

async function submit() {
  log.i("submit", { ...values });
  emit("submit", { ...values });
}
</script>

<style lang="scss" scoped></style>
