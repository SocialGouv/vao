<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrInputGroup
            name="siret"
            label="Numéro SIRET du titulaire de l’agrément VAO"
            :label-visible="true"
            :model-value="formatedSiret"
            :required="true"
            :is-valid="siretMeta.valid"
            :error-message="siretErrorMessage"
            placeholder=""
            hint="14 chiffres consécutifs qui indiquent l'établissement organisateur"
            @update:model-value="trimSiret"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-4">
          <DsfrButton
            id="chercherSiret"
            :disabled="!siretMeta.valid"
            @click.prevent="searchOrganisme"
            >Récupérer informations</DsfrButton
          >
        </div>
      </div>
    </fieldset>
    <div v-if="siren">
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="raisonSociale"
              label="Raison sociale"
              :label-visible="true"
              :model-value="raisonSociale"
              :required="false"
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="statut"
              label="Statut, forme juridique"
              :label-visible="true"
              :model-value="statut"
              :required="false"
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="adresse"
              label="adresse"
              :label-visible="true"
              :model-value="adresse"
              :required="false"
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="pays"
              label="Pays"
              :label-visible="true"
              :model-value="pays"
              :required="false"
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="email"
              label="Courriel"
              :label-visible="true"
              :model-value="email"
              :required="true"
              :readonly="false"
              :is-valid="emailMeta.valid"
              :error-message="emailErrorMessage"
              placeholder=""
              hint="L'adresse mail doit être un email valide"
              @update:model-value="onEmailChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="telephone"
              label="Téléphone"
              :label-visible="true"
              :model-value="telephone"
              :required="true"
              :readonly="false"
              :is-valid="telephoneMeta.valid"
              :valid-message="telephoneValidMessage"
              :error-message="telephoneErrorMessage"
              placeholder=""
              hint="Au format 0X, +33X ou 0033"
              @update:model-value="onTelephoneChange"
            />
          </div>
        </div>
      </fieldset>
      <div v-if="siegeSocial">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrHighlight text="Liste des établissements" :large="true" />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrTable
              :headers="[
                'code NIC',
                'Adresse',
                'Code postal',
                'Commune',
                'Autorisé à déclarer des séjours ?',
              ]"
              :rows="formatedEtablissements"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrHighlight text="Représentants légaux" :large="true" />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <Personnes
              :personnes="representantsLegaux"
              :show-adresse="false"
              :show-telephone="false"
              :show-email="false"
              titre="Représentant légal"
              :headers="headers"
              @valid="onRepresentantsLegauxChange"
            >
            </Personnes>
          </div>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <h6>Responsable de l'organisation du séjour</h6>
          <Personne
            :key="randomId"
            :personne="responsableSejour"
            :show-adresse="true"
            :show-telephone="true"
            :show-email="true"
            :show-button="false"
            :model-value="responsableSejour"
            @update:personne="onResponsableSejourChange"
          ></Personne>
        </div>
      </div>
    </div>

    <fieldset class="fr-fieldset">
      <DsfrButton id="next-step" @click.prevent="next">Suivant</DsfrButton>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const log = logger("components/organisme/personne-morale");

const emit = defineEmits(["previous", "next", "update"]);

const props = defineProps({
  initData: { type: Object, required: true },
});

const headers = [
  {
    label: "Nom",
    value: "nom",
  },
  { label: "Prénom", value: "prenom" },
  {
    label: "Fonction",
    value: "fonction",
  },
];

const randomId = ref(random.getRandomId());

const validationSchema = computed(() =>
  yup.object(organisme.personneMoraleSchema),
);

const initialValues = {
  siret: null,
  siren: null,
  siegeSocial: null,
  raisonSociale: null,
  statut: null,
  adresse: null,
  pays: null,
  email: null,
  telephone: null,
  representantsLegaux: [],
  etablissements: [],
  responsableSejour: {},
  ...props.initData,
};

const { meta, values, setValues } = useForm({
  initialValues,
  validationSchema,
});

const {
  value: siret,
  errorMessage: siretErrorMessage,
  handleChange: onSiretChange,
  meta: siretMeta,
} = useField("siret");
const { value: siren } = useField("siren");
const { value: siegeSocial } = useField("siegeSocial");
const { value: raisonSociale } = useField("raisonSociale");
const { value: statut } = useField("statut");
const { value: adresse } = useField("adresse");
const { value: pays } = useField("pays");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");
const {
  value: telephone,
  errorMessage: telephoneErrorMessage,
  validMessage: telephoneValidMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");
const {
  value: representantsLegaux,
  handleChange: onRepresentantsLegauxChange,
} = useField("representantsLegaux");
const { value: etablissements } = useField("etablissements");
const { value: responsableSejour, handleChange: onResponsableSejourChange } =
  useField("responsableSejour");

const formatedSiret = computed(() => {
  if (!siret.value) {
    return "";
  }
  const siretSaisi = siret.value;
  let formatedSiret;
  for (let i = 0; i < siretSaisi.length; i++) {
    i === 0
      ? (formatedSiret = siretSaisi[i])
      : (formatedSiret = formatedSiret + siretSaisi[i]);
    switch (i) {
      case 2:
        formatedSiret = formatedSiret + " ";
        break;
      case 5:
        formatedSiret = formatedSiret + " ";
        break;
      case 8:
        formatedSiret = formatedSiret + " ";
        break;
    }
  }
  return formatedSiret;
});

const formatedEtablissements = computed(() => {
  return etablissements.value.map((e, index) => {
    const row = [
      e.nic,
      e.adresse,
      e.codePostal,
      e.commune,
      {
        component: "DsfrToggleSwitch",
        modelValue: etablissements.value[index].enabled,
        onChange: () => {
          etablissements.value[index].enabled =
            !etablissements.value[index].enabled;
        },
      },
    ];
    return row;
  });
});

function trimSiret(s) {
  return onSiretChange(s.replace(/ /g, ""));
}

async function searchApiInsee() {
  log.i("searchApiInsee - IN");
  const url = `/siret/${siret.value}`;
  try {
    const { uniteLegale, etablissements, representantsLegaux } =
      await $fetchBackend(url, {
        method: "GET",
        credentials: "include",
      });
    toaster.success("Données récupérées");

    const adresse =
      `${uniteLegale.adresseEtablissement.numeroVoieEtablissement ?? ""} ${uniteLegale.adresseEtablissement.typeVoieEtablissement ?? ""} ${uniteLegale.adresseEtablissement.libelleVoieEtablissement} ${uniteLegale.adresseEtablissement.codePostalEtablissement} ${uniteLegale.adresseEtablissement.libelleCommuneEtablissement}`.trim();

    setValues({
      siren: uniteLegale.siren,
      siegeSocial: uniteLegale.etablissementSiege,
      raisonSociale: uniteLegale.uniteLegale.denominationUniteLegale,
      statut: uniteLegale.uniteLegale.categorieJuridiqueUniteLegale,
      adresse,
      pays:
        uniteLegale.adresseEtablissement.libellePaysEtrangerEtablissement ??
        "France",
      representantsLegaux: representantsLegaux ?? [],
      etablissements: etablissements ?? [],
    });
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données à partir du SIRET",
    );
    log.w("searchApiInsee - erreur:", { error });
    setValues({
      siren: null,
      siegeSocial: null,
      raisonSociale: null,
      statut: null,
      adresse: null,
      pays: null,
      representantsLegaux: [],
      etablissements: [],
    });
  }
}

async function searchOrganismeBySiret() {
  log.i("searchOrganismeBySiret - IN");
  const url = `/organisme/siret/${siret.value}`;
  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    log.d("searchOrganismeBySiret", data);
    if (data.organisme && data.organisme.personneMorale) {
      setValues({
        ...data.organisme.personneMorale,
      });
      toaster.success("L'organisme est déjà présent en base");

      return data.organisme;
    }
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données internes à partir du SIRET",
    );
    log.w("searchOrganismeBySiret - erreur:", { error });
    return null;
  }
}

async function searchOrganisme() {
  log.i("searchOrganisme - In");
  const organismeFound = await searchOrganismeBySiret();
  if (!organismeFound) {
    log.d("appel API INSEE");
    await searchApiInsee();
  }
  randomId.value = random.getRandomId();
}

function next() {
  log.i("next - IN");
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    {
      ...values,
      meta: meta.value.valid,
    },
    "personne_morale",
  );
}
</script>
