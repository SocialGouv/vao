<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrInputGroup
            name="siret"
            label="Numéro SIRET"
            :label-visible="true"
            :model-value="siretDisplayed"
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
            @click.prevent="searchOperateur"
            >Récupérer informations</DsfrButton
          >
        </div>
      </div>
    </fieldset>
    <div v-if="isEtablissementFound">
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="raisonSociale"
              label="Raison sociale"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.raisonSociale"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="statut"
              label="Status, forme juridique"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.statut"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="adresse"
              label="adresse"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.adresse"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="pays"
              label="Pays"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.pays"
              :required="false"
              :disabled="true"
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
              :disabled="false"
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
              name="telephoneEP"
              label="Téléphone"
              :label-visible="true"
              :model-value="telephoneEP"
              :required="true"
              :disabled="false"
              :is-valid="telephoneEPMeta.valid"
              :valid-message="telephoneEPValidMessage"
              :error-message="telephoneEPErrorMessage"
              placeholder=""
              hint="Au format 0X, +33X ou 0033"
              @update:model-value="onTelephoneEPChange"
            />
          </div>
        </div>
      </fieldset>
      <div v-if="isEtablissementPrincipal">
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
              :rows="etablissementsToDisplay"
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

const log = logger("components/operateur/personne-morale");

const emit = defineEmits(["previous", "next", "update"]);

const props = defineProps({
  initData: { type: Object, default: null, required: true },
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

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const siretRegex = /^[0-9]{14}$/;
const randomId = ref(random.getRandomId());
const personneMorale = ref();
const operateurDejaExistant = ref();

// Schéma et données liées à une personne morale
const schema = {
  siret: yup
    .string()
    .test(
      "siret",
      "Le numéro SIRET doit faire exactement 14 chiffres, sans espace",
      (siret) => siretRegex.test(siret),
    )
    .required(),
  email: yup
    .string()
    .email("le format de l'email n'est pas valide")
    .required("L'email de contact est obligatoire"),
  telephoneEP: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (telephoneEP) => numTelephoneRegex.test(telephoneEP),
    )
    .required("Le numéro de téléphone de l'établissement est obligatoire"),
  representantsLegaux: yup.array().min(1, "pas bien").required(),
  etablissements: yup.array().min(1, "pas bien").required(),
};
const validationSchema = computed(() => {
  return yup.object({ ...schema });
});

const initialValues = computed(() => {
  return {
    siret: props.initData?.siret,
    email: props.initData?.email,
    telephoneEP: props.initData?.telephoneEP,
    representantsLegaux: props.initData?.representantsLegaux ?? [],
    etablissements: props.initData?.etablissements ?? [],
    responsableSejour: props.initData?.responsableSejour ?? {},
  };
});

const { meta } = useForm({
  initialValues,
  validationSchema,
});

const {
  value: siret,
  errorMessage: siretErrorMessage,
  handleChange: onSiretChange,
  meta: siretMeta,
} = useField("siret");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");
const {
  value: representantsLegaux,
  handleChange: onRepresentantsLegauxChange,
} = useField("representantsLegaux");
const {
  value: telephoneEP,
  errorMessage: telephoneEPErrorMessage,
  validMessage: telephoneEPValidMessage,
  handleChange: onTelephoneEPChange,
  meta: telephoneEPMeta,
} = useField("telephoneEP");
const { value: etablissements } = useField("etablissements");
const { value: responsableSejour, handleChange: onResponsableSejourChange } =
  useField("responsableSejour");

const isEtablissementFound = computed(() => {
  return !!formatedPersonneMorale.value;
});

const isEtablissementPrincipal = computed(() => {
  return formatedPersonneMorale.value.siegeSocial;
});

const formatedPersonneMorale = computed(() => {
  // les infos proviennent d'un operateur déjà présent en base
  if (operateurDejaExistant.value) {
    return {
      siret: operateurDejaExistant.value.personneMorale?.siret,
      siren: operateurDejaExistant.value.personneMorale?.siren,
      siegeSocial: operateurDejaExistant.value.personneMorale?.siegeSocial,
      raisonSociale: operateurDejaExistant.value.personneMorale?.raisonSociale,
      statut: operateurDejaExistant.value.personneMorale?.statut,
      adresse: operateurDejaExistant.value.personneMorale?.adresseShort,
      adresseComplete: operateurDejaExistant.value.personneMorale?.adresse,
      pays: operateurDejaExistant.value.personneMorale?.pays,
    };
  }
  // les infos proviennent de l'API entreprise
  if (personneMorale.value) {
    const adresse = `${personneMorale.value.adresseEtablissement.numeroVoieEtablissement} ${personneMorale.value.adresseEtablissement.typeVoieEtablissement} ${personneMorale.value.adresseEtablissement.libelleVoieEtablissement} ${personneMorale.value.adresseEtablissement.codePostalEtablissement} ${personneMorale.value.adresseEtablissement.libelleCommuneEtablissement}`;
    return {
      siret: personneMorale.value.siret,
      siren: personneMorale.value.siren,
      siegeSocial: personneMorale.value.etablissementSiege,
      raisonSociale: personneMorale.value.uniteLegale.denominationUniteLegale,
      statut: personneMorale.value.uniteLegale.categorieJuridiqueUniteLegale,
      adresse: adresse.trim(),
      adresseComplete: personneMorale.value.adresseEtablissement,
      pays:
        personneMorale.value.adresseEtablissement
          .libellePaysEtrangerEtablissement ?? "France",
    };
  }
  // initialisation
  if (props.initData) {
    return {
      siret: props.initData.siret,
      siren: props.initData.siren,
      siegeSocial: props.initData.siegeSocial,
      raisonSociale: props.initData.raisonSociale,
      statut: props.initData.statut,
      adresse: props.initData.adresseShort,
      adresseComplete: props.initData.adresse,
      pays: props.initData.pays,
    };
  }
  return {
    siret: null,
    raisonSociale: null,
    statut: null,
    adresse: null,
    adresseComplete: null,
    pays: null,
  };
});

const siretDisplayed = computed(() => {
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

const etablissementsToDisplay = computed(() => {
  if (etablissements.value) {
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
  } else {
    return [];
  }
});

function trimSiret(s) {
  return onSiretChange(s.replace(/ /g, ""));
}

async function searchApiInsee() {
  log.i("searchApiEntreprise - IN");
  const url = `/siret/${siret.value}`;
  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    toaster.success("Données récupérées");
    personneMorale.value = data.uniteLegale;
    etablissements.value = data.etablissements;
    representantsLegaux.value = data.representantsLegaux;
    responsableSejour.value = {};
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données à partir du SIRET",
    );
    log.w("searchApiInsee - erreur:", { error });
    personneMorale.value = null;
    etablissements.value = null;
    representantsLegaux.value = null;
  }
}

async function searchOperateurBySiret() {
  log.i("searchOperateurBySiret - IN");
  const url = `/operateur/siret/${siret.value}`;
  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    log.d("searchOperateurBySiret", data);
    if (data.operateur) {
      toaster.success("L'opérateur est déjà présent en base");
      operateurDejaExistant.value = data.operateur;
      representantsLegaux.value =
        operateurDejaExistant.value.personneMorale.representantsLegaux ?? [];
      etablissements.value =
        operateurDejaExistant.value.personneMorale?.etablissements;
      responsableSejour.value =
        operateurDejaExistant.value.personneMorale?.responsableSejour;
      email.value = operateurDejaExistant.value.personneMorale?.email;
      telephoneEP.value =
        operateurDejaExistant.value.personneMorale?.telephoneEP;
      return operateurDejaExistant.value;
    }
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données internes à partir du SIRET",
    );
    log.w("searchOperateurBySiret - erreur:", { error });
    return null;
  }
}

async function searchOperateur() {
  log.i("searchOperateur - In");
  operateurDejaExistant.value = await searchOperateurBySiret();
  if (!operateurDejaExistant.value) {
    log.d("appel API INSEE");
    await searchApiInsee();
  }
  randomId.value = random.getRandomId();
}

function next() {
  log.i("next - IN");
  if (!meta.value.dirty) {
    emit("next");
  }
  emit(
    "update",
    {
      siret: siret.value,
      siren: formatedPersonneMorale.value.siren,
      siegeSocial: formatedPersonneMorale.value.siegeSocial,
      raisonSociale: formatedPersonneMorale.value.raisonSociale,
      statut: formatedPersonneMorale.value.statut,
      adresseShort: formatedPersonneMorale.value.adresse,
      adresse: formatedPersonneMorale.value.adresseComplete,
      pays: formatedPersonneMorale.value.pays,
      email: email.value,
      telephoneEP: telephoneEP.value,
      representantsLegaux: representantsLegaux.value,
      etablissements: etablissements.value,
      responsableSejour: responsableSejour.value,
      meta: meta.value.valid,
    },
    "personne_morale",
  );
}
</script>
