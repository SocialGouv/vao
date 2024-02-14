<template>
  <div class="fr-my-5v">
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nomHebergement"
          :required="true"
          label="Nom de l'hébergement"
          :label-visible="true"
          placeholder=""
          :model-value="nomHebergement"
          :error-message="nomHebergementErrorMessage"
          :is-valid="nomHebergementMeta"
          @update:model-value="onNomHebergementChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="typeHebergement"
            legend="Type du lieu d'hébergement"
            :required="true"
            :model-value="typeHebergement"
            :options="[
              { label: 'Hôtel', value: 'hotel' },
              { label: 'Meublé de tourisme', value: 'meuble_tourisme' },
              {
                label: 'Résidence de tourisme, chambre d\'hôte',
                value: 'residence_tourisme',
              },
              {
                label: 'Camping, caravaning, mobile home',
                value: 'camping',
              },
              { label: 'Autre', value: 'autre' },
            ]"
            :is-valid="typeHebergementMeta"
            :inline="false"
            :error-message="typeHebergementErrorMessage"
            @update:model-value="onTypeHebergementChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <label>Adresse :</label>
        <Multiselect
          v-model="adresse"
          mode="single"
          :close-on-select="false"
          :searchable="true"
          :internal-search="false"
          :options="adressesOptions"
          :options-limit="10"
          @search-change="searchAPIAdresse"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="numTelephone1"
          label="Numéro de téléphone 1"
          :label-visible="true"
          :model-value="numTelephone1"
          :required="true"
          :is-valid="numTelephone1Meta.valid"
          :error-message="numTelephone1ErrorMessage"
          hint="Le numéro de téléphone saisi doit être valide. Exemple : 0612345678"
          placeholder=""
          @update:model-value="onNumTelephone1Change"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="numTelephone2"
          label="Numéro de téléphone 2"
          :label-visible="true"
          :model-value="numTelephone2"
          :required="false"
          :is-valid="numTelephone2Meta.valid"
          :error-message="numTelephone2ErrorMessage"
          hint="Le numéro de téléphone saisi doit être valide. Exemple : 0612345678"
          placeholder=""
          @update:model-value="onNumTelephone2Change"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="email"
          label="Courriel"
          :label-visible="true"
          :model-value="email"
          :required="false"
          :is-valid="emailMeta.valid"
          :error-message="emailErrorMessage"
          hint="Format attendu : nom@domaine.fr"
          placeholder=""
          @update:model-value="onEmailChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="info"
            legend="Info"
            :required="true"
            :model-value="info"
            :options="[
              { label: 'Accesible', value: 'accesible' },
              { label: 'Signalé comme non adapté', value: 'non_adapte' },
              { label: 'Commentaires', value: 'commentaires' },
              { label: 'Non renseigné', value: 'non_renseigne' },
            ]"
            :is-valid="infoMeta"
            :inline="false"
            :error-message="infoErrorMessage"
            @update:model-value="onInfoChange"
          />
        </div>
      </div>
    </fieldset>
    <DsfrHighlight
      text="Informations sur les locaux "
      :small="false"
      :large="true"
    />
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <UtilsMultiSelect
            :options="prestationsHotelieresOptions"
            :values="prestationsHotelieres ?? []"
            label="Prestations hôtelières assurées par le lieu d’accueil"
            @add-item="addPrestationHoteliere"
          ></UtilsMultiSelect>
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="visiteLocaux"
            legend="Une visite des locaux par l’organisateur a-t-elle été effectuée ?"
            :required="true"
            :model-value="visiteLocaux"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="visiteLocauxMeta"
            :inline="true"
            :error-message="visiteLocauxErrorMessage"
            @update:model-value="onVisiteLocauxChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="descriptionLieuHebergement"
          :required="false"
          label="Description du lieu d’hébergement (parties communes et notamment équipements sanitaires)"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="descriptionLieuHebergement"
          :error-message="descriptionLieuHebergementErrorMessage"
          :is-valid="descriptionLieuHebergementMeta"
          @update:model-value="onDescriptionLieuHebergementChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nombreLits"
          type="number"
          :required="true"
          label="Nombre de lits"
          :label-visible="true"
          placeholder=""
          :model-value="nombreLits"
          :error-message="nombreLitsErrorMessage"
          :is-valid="nombreLitsMeta"
          @update:model-value="onNombreLitsChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nombreLitsSuperposes"
          :required="true"
          type="number"
          label="Nombre de lits superposés"
          :label-visible="true"
          placeholder=""
          :model-value="nombreLitsSuperposes"
          :error-message="nombreLitsSuperposesErrorMessage"
          :is-valid="nombreLitsSuperposesMeta"
          @update:model-value="onNombreLitsSuperposesChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="nombreLitsSuperposes > 0" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="litsDessus"
            legend="Pour les lits superposés, les lits « du dessus » seront-ils occupés par des vacanciers  ?"
            :required="true"
            :model-value="litsDessus"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="litsDessusMeta"
            :inline="true"
            :error-message="litsDessusErrorMessage"
            @update:model-value="onLitsDessusChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nombreMaxPersonnesCouchage"
          :required="true"
          label="Description du lieu d’hébergement (parties communes et notamment équipements sanitaires)"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="nombreMaxPersonnesCouchage"
          :error-message="nombreMaxPersonnesCouchageErrorMessage"
          :is-valid="nombreMaxPersonnesCouchageMeta"
          @update:model-value="onNombreMaxPersonnesCouchageChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="couchageIndividuel"
            legend="Chaque vacancier bénéficie-t-il d’un couchage individuel ?"
            :required="true"
            :model-value="couchageIndividuel"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="couchageIndividuelMeta"
            :inline="true"
            :error-message="couchageIndividuelErrorMessage"
            @update:model-value="onCouchageIndividuelChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="rangementIndividuel"
            legend="Chaque vacancier bénéficie t-il d’un espace de rangement des affaires personnelles ?"
            :required="true"
            :model-value="rangementIndividuel"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="rangementIndividuelMeta"
            :inline="true"
            :error-message="rangementIndividuelErrorMessage"
            @update:model-value="onRangementIndividuelChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="chambresUnisexes"
            legend="Les femmes et les hommes dorment-ils dans des lieux séparés ?"
            :required="true"
            :model-value="chambresUnisexes"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="chambresUnisexesMeta"
            :inline="true"
            :error-message="chambresUnisexesErrorMessage"
            @update:model-value="onChambresUnisexesChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="chambresDoubles"
            legend="Les couples de vacanciers bénéficient t-ils de chambres doubles ?"
            :required="true"
            :model-value="chambresDoubles"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="chambresDoublesMeta"
            :inline="true"
            :error-message="chambresDoublesErrorMessage"
            @update:model-value="onChambresDoublesChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="amenagementsSpecifiques"
            legend="Des aménagements spécifiques des locaux sont-ils prévus pour accueillir les vacanciers ?"
            :required="true"
            :model-value="amenagementsSpecifiques"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="amenagementsSpecifiquesMeta"
            :inline="true"
            :error-message="amenagementsSpecifiquesErrorMessage"
            @update:model-value="onAmenagementsSpecifiquesChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="amenagementsSpecifiques" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="precisionAmenagementsSpecifiques"
          :required="true"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionAmenagementsSpecifiques"
          :error-message="precisionAmenagementsSpecifiquesErrorMessage"
          :is-valid="precisionAmenagementsSpecifiquesMeta"
          @update:model-value="onPrecisionAmenagementsSpecifiquesChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="deplacementProximite"
          :required="true"
          label="Précisez la fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="deplacementProximite"
          :error-message="deplacementProximiteErrorMessage"
          valid-message="bien joué"
          :is-valid="deplacementProximiteMeta"
          @update:model-value="onDeplacementProximiteChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="excursion"
          :required="true"
          label="Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="excursion"
          :error-message="excursionErrorMessage"
          :is-valid="excursionMeta"
          @update:model-value="onExcursionChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="Suivant" :secondary="true" @click="back"
            >Retour</DsfrButton
          >
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="Suivant" :disabled="!meta.valid" @click="next"
            >Ajouter hebergement</DsfrButton
          >
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import Multiselect from "@vueform/multiselect";

import "@vueform/multiselect/themes/default.css";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const emit = defineEmits(["add", "back"]);
const log = logger("component/hebergement");

const config = useRuntimeConfig();

const adresses = ref([]);

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const zoom = ref(16);
const prestationsHotelieresOptions = [
  { text: "Hébergement seul", value: "hebergement_seul", id: "1" },
  { text: "Petit déjeuner", value: "petit_dejeuner", id: "2" },
  {
    text: "Demi-pension",
    value: "demi_pension",
    id: "3",
  },
  { text: "Pension complète", value: "pension_complete", id: "4" },
  { text: "Blanchisserie", value: "blanchisseries", id: "5" },
  { text: "Entretien des locaux", value: "entretien_locaux", id: "6" },
];
const schemaHebergement = {
  typeHebergement: yup.string().required(),
  nomHebergement: yup.string().required(),
  adresse: yup.object().required(),
  numTelephone1: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (numTelephone1) => numTelephoneRegex.test(numTelephone1),
    )
    .required(),
  numTelephone2: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (numTelephone2) => numTelephoneRegex.test(numTelephone2),
    )
    .nullable(),
  email: yup.string().email().nullable(),
  visiteLocaux: yup.string().required(),
  descriptionLieuHebergement: yup.string().nullable(),
  nombreLits: yup.number().required(),
  nombreLitsSuperposes: yup.number().required(),
  litsDessus: yup.string().nullable(),
  nombreMaxPersonnesCouchage: yup.string(),
  couchageIndividuel: yup.string().required(),
  rangementIndividuel: yup.string().required(),
  chambresUnisexes: yup.string().required(),
  chambresDoubles: yup.string().required(),
  amenagementsSpecifiques: yup.string().required(),
  precisionAmenagementsSpecifiques: yup.string().nullable(),
  deplacementProximite: yup.string().required(),
  excursion: yup.string().required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaHebergement,
  }),
);

const initialValues = computed(() => ({
  typeHebergement: "",
  nomHebergement: "",
  numTelephone1: "",
  numTelephone2: "",
  email: "",
  info: "",
  prestationsHotelieres: [],
  visiteLocaux: "",
  descriptionLieuHebergement: "",
  nombreLits: "",
  nombreLitsSuperposes: "",
  litsDessus: "",
  nombreMaxPersonnesCouchage: "",
  couchageIndividuel: "",
  rangementIndividuel: "",
  chambresUnisexes: "",
  chambresDoubles: "",
  amenagementsSpecifiques: "",
  precisionAmenagementsSpecifiques: "",
  deplacementProximite: "",
  excursion: "",
}));

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: typeHebergement,
  errorMessage: typeHebergementErrorMessage,
  handleChange: onTypeHebergementChange,
  meta: typeHebergementMeta,
} = useField("typeHebergement");
const {
  value: nomHebergement,
  errorMessage: nomHebergementErrorMessage,
  handleChange: onNomHebergementChange,
  meta: nomHebergementMeta,
} = useField("nomHebergement");
const { value: adresse } = useField("adresse");
const {
  value: numTelephone1,
  errorMessage: numTelephone1ErrorMessage,
  handleChange: onNumTelephone1Change,
  meta: numTelephone1Meta,
} = useField("numTelephone1");
const {
  value: numTelephone2,
  errorMessage: numTelephone2ErrorMessage,
  handleChange: onNumTelephone2Change,
  meta: numTelephone2Meta,
} = useField("numTelephone2");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");
const {
  value: info,
  errorMessage: infoErrorMessage,
  handleChange: onInfoChange,
  meta: infoMeta,
} = useField("info");
const { value: prestationsHotelieres } = useField("prestationsHotelieres");
const {
  value: visiteLocaux,
  errorMessage: visiteLocauxErrorMessage,
  handleChange: onVisiteLocauxChange,
  meta: visiteLocauxMeta,
} = useField("visiteLocaux");
const {
  value: descriptionLieuHebergement,
  errorMessage: descriptionLieuHebergementErrorMessage,
  handleChange: onDescriptionLieuHebergementChange,
  meta: descriptionLieuHebergementMeta,
} = useField("descriptionLieuHebergement");
const {
  value: nombreLits,
  errorMessage: nombreLitsErrorMessage,
  handleChange: onNombreLitsChange,
  meta: nombreLitsMeta,
} = useField("nombreLits");
const {
  value: nombreLitsSuperposes,
  errorMessage: nombreLitsSuperposesErrorMessage,
  handleChange: onNombreLitsSuperposesChange,
  meta: nombreLitsSuperposesMeta,
} = useField("nombreLitsSuperposes");
const {
  value: litsDessus,
  errorMessage: litsDessusErrorMessage,
  handleChange: onLitsDessusChange,
  meta: litsDessusMeta,
} = useField("litsDessus");
const {
  value: nombreMaxPersonnesCouchage,
  errorMessage: nombreMaxPersonnesCouchageErrorMessage,
  handleChange: onNombreMaxPersonnesCouchageChange,
  meta: nombreMaxPersonnesCouchageMeta,
} = useField("nombreMaxPersonnesCouchage");
const {
  value: couchageIndividuel,
  errorMessage: couchageIndividuelErrorMessage,
  handleChange: onCouchageIndividuelChange,
  meta: couchageIndividuelMeta,
} = useField("couchageIndividuel");
const {
  value: rangementIndividuel,
  errorMessage: rangementIndividuelErrorMessage,
  handleChange: onRangementIndividuelChange,
  meta: rangementIndividuelMeta,
} = useField("rangementIndividuel");
const {
  value: chambresUnisexes,
  errorMessage: chambresUnisexesErrorMessage,
  handleChange: onChambresUnisexesChange,
  meta: chambresUnisexesMeta,
} = useField("chambresUnisexes");
const {
  value: chambresDoubles,
  errorMessage: chambresDoublesErrorMessage,
  handleChange: onChambresDoublesChange,
  meta: chambresDoublesMeta,
} = useField("chambresDoubles");
const {
  value: amenagementsSpecifiques,
  errorMessage: amenagementsSpecifiquesErrorMessage,
  handleChange: onAmenagementsSpecifiquesChange,
  meta: amenagementsSpecifiquesMeta,
} = useField("amenagementsSpecifiques");
const {
  value: precisionAmenagementsSpecifiques,
  errorMessage: precisionAmenagementsSpecifiquesErrorMessage,
  handleChange: onPrecisionAmenagementsSpecifiquesChange,
  meta: precisionAmenagementsSpecifiquesMeta,
} = useField("precisionAmenagementsSpecifiques");
const {
  value: deplacementProximite,
  errorMessage: deplacementProximiteErrorMessage,
  handleChange: onDeplacementProximiteChange,
  meta: deplacementProximiteMeta,
} = useField("deplacementProximite");
const {
  value: excursion,
  errorMessage: excursionErrorMessage,
  handleChange: onExcursionChange,
  meta: excursionMeta,
} = useField("excursion");

const adressesOptions = computed(() => {
  if (adresses.value.length > 0) {
    return adresses.value.map((a) => {
      return { value: a, label: a.properties.label };
    });
  }
  return [];
});

const markerLatLng = computed(() => {
  return [
    adresse.value.geometry.coordinates[1],
    adresse.value.geometry.coordinates[0],
  ];
});

function addPrestationHoteliere(liste) {
  log.d("addPrestationHoteliere -IN", liste);
  prestationsHotelieres.value = liste;
}

async function searchAPIAdresse(queryString) {
  if (queryString.length > 4) {
    log.i("searchAPIAdresse -In");
    try {
      const url = config.public.backendUrl + "/geo/adresse/";
      await $fetch(url, {
        method: "POST",
        body: { queryString },
      })
        .then((response) => {
          // log.d(response.adresses);
          adresses.value = response.adresses;
        })
        .catch((error) => {
          log.w(error);
        });
    } catch (error) {
      log.w("searchAPIAdresse - erreur", { error });
    }
  }
}
function back() {
  emit("back");
}
async function next() {
  log.d("next - IN");
  try {
    const url = `${config.public.backendUrl}/hebergement`;
    await useFetch(url, {
      method: "POST",
      body: { nomHebergement, caracteristiques: { ...values } },
      onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ??
              "Erreur lors de la sauvegarde de l'hébergement",
          );
        } else {
          log.d("hebergement sauvegardé");
          toaster.success("hebergement sauvegardé");
          emit("add");
        }
      },
    });
  } catch (error) {
    toaster.error(
      response._data.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    );
    log.w("next - erreur", { error });
  }
}
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
