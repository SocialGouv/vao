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
            @click.prevent="searchOrganisme"
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
const personneMorale = ref();
const organismeDejaExistant = ref();

const validationSchema = yup.object({ ...organisme.schema.personneMorale });

const initialValues = {
  siret: props.initData.siret,
  email: props.initData.email,
  telephoneEP: props.initData.telephoneEP,
  representantsLegaux: props.initData.representantsLegaux ?? [],
  etablissements: props.initData.etablissements ?? [],
  responsableSejour: props.initData.responsableSejour ?? {},
};

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
  // les infos proviennent d'un organisme déjà présent en base
  if (organismeDejaExistant.value) {
    return {
      siret: organismeDejaExistant.value.personneMorale?.siret,
      siren: organismeDejaExistant.value.personneMorale?.siren,
      siegeSocial: organismeDejaExistant.value.personneMorale?.siegeSocial,
      raisonSociale: organismeDejaExistant.value.personneMorale?.raisonSociale,
      statut: organismeDejaExistant.value.personneMorale?.statut,
      adresse: organismeDejaExistant.value.personneMorale?.adresseShort,
      adresseComplete: organismeDejaExistant.value.personneMorale?.adresse,
      pays: organismeDejaExistant.value.personneMorale?.pays,
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

async function searchOrganismeBySiret() {
  log.i("searchOrganismeBySiret - IN");
  const url = `/organisme/siret/${siret.value}`;
  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    log.d("searchOrganismeBySiret", data);
    if (data.organisme) {
      toaster.success("L'organisme est déjà présent en base");
      organismeDejaExistant.value = data.organisme;
      representantsLegaux.value =
        organismeDejaExistant.value.personneMorale.representantsLegaux ?? [];
      etablissements.value =
        organismeDejaExistant.value.personneMorale?.etablissements;
      responsableSejour.value =
        organismeDejaExistant.value.personneMorale?.responsableSejour;
      email.value = organismeDejaExistant.value.personneMorale?.email;
      telephoneEP.value =
        organismeDejaExistant.value.personneMorale?.telephoneEP;
      return organismeDejaExistant.value;
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
  organismeDejaExistant.value = await searchOrganismeBySiret();
  if (!organismeDejaExistant.value) {
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
