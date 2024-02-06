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
    <fieldset class="fr-fieldset">
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
import { useHebergementStore } from "@/stores/hebergement";
import "@vueform/multiselect/themes/default.css";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("component/hebergement");

// const emit = defineEmits(["add", "back"]);
const hebergementStore = useHebergementStore();

const hebergements = ref([]);
const adresses = ref([]);

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const zoom = ref(16);

const schemaHebergement = {
  typeHebergement: yup.string().required(),
  nomHebergement: yup.string().required(),
  numTelephone1: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (numTelephone1) => numTelephoneRegex.test(numTelephone1)
    )
    .required(),
  numTelephone2: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (numTelephone2) => numTelephoneRegex.test(numTelephone2)
    ),
  email: yup.string().email(),
};
const validationSchema = computed(() =>
  yup.object({
    ...schemaHebergement,
  })
);

const initialValues = computed(() => ({
  typeHebergement: "",
  nomHebergement: "",
  numTelephone1: "",
  numTelephone2: "",
  email: "",
  info: "",
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

async function searchAPIAdresse(queryString) {
  if (queryString.length > 4) {
    log.i("searchAPIAdresse -In");
    try {
      const url = "/front-server/geo/adresse/";
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

async function next() {
  log.d("next - IN");
  try {
    const url = `/front-server/hebergement`;
    await useFetch(url, {
      method: "POST",
      body: {
        ...values,
      },
      onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ??
              "Erreur lors de la sauvegarde de l'hébergement"
          );
        } else {
          log.d("hebergement sauvegardé");
          toaster.success("hebergement sauvegardé");
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(async () => {
  hebergements.value = await hebergementStore.fetchHebergement();
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
