<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="typeOperateur"
            legend="Type de personne qui organise des séjours"
            :required="true"
            :model-value="typeOperateur"
            :options="typeOptions"
            :is-valid="typeOperateurMeta"
            :inline="false"
            :error-message="typeOperateurErrorMessage"
            @update:model-value="onTypeOperateurChange"
          />
        </div>
      </div>
    </fieldset>
    <div v-if="typeOperateur === 'personne_morale'">
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="siret"
              label="Numéro SIRET"
              :label-visible="true"
              :model-value="siret"
              :required="true"
              :is-valid="siretMeta.valid"
              :error-message="siretErrorMessage"
              placeholder=""
              hint="14 chiffres consécutifs qui indiquent l'établissement organisateur"
              @update:model-value="onSiretChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-4">
            <DsfrButton
              id="chercherSiret"
              :disabled="!siretMeta.valid"
              @click.prevent="searchOperateur"
              >Récupérer informations
            </DsfrButton>
          </div>
        </div>
      </fieldset>
      <div v-if="isEtablissementFound">
        <div v-if="isEtablissementDisplayable">
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
          <div class="fr-fieldset__element">
            <div class="fr-input-group fr-col-8">
              <DsfrHighlight text="Représentants légaux" :large="true" />
            </div>
          </div>
          <div class="fr-fieldset__element">
            <div class="fr-input-group fr-col-8">
              <DsfrAccordionsGroup>
                <div v-for="(item, index) in representantLegaux" :key="index">
                  <li>
                    <DsfrAccordion
                      :id="index + 1"
                      :title="nomPrenomRepresentantLegal[index]"
                      :expanded-id="expandedId"
                      @expand="(id) => (expandedId = id)"
                    >
                      <OperateurRepresentantLegal
                        :representant-legal="item"
                        :index="index"
                        @valid="validRepresentantLegal"
                      ></OperateurRepresentantLegal>
                    </DsfrAccordion>
                  </li>
                </div>
              </DsfrAccordionsGroup>
            </div>
          </div>
          <div class="fr-fieldset__element">
            <div class="fr-input-group fr-col-8">
              <DsfrButton
                :label="`Ajouter un représentant légal n°${
                  representantLegaux.length + 1
                }`"
                :disabled="expandedId !== 0"
                :secondary="true"
                @click="addRepresentantLegal"
              ></DsfrButton>
            </div>
          </div>
        </div>
        <div v-else>
          <DsfrAlert
            is="warningEtabSecondaire"
            title="Etablissement principal absent"
            description="La fiche organisateur de l'établissement principal n'a pas encore été créée. Veuillez réessayer plus tard"
            type="warning"
            :closeable="false"
            :small="true"
          />
        </div>
      </div>
    </div>
    <div v-if="typeOperateur === 'personne_physique'">
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="nomNaissance"
              label="Nom de naissance"
              :label-visible="true"
              :model-value="nomNaissance"
              :required="true"
              :is-valid="nomNaissanceMeta.valid"
              :error-message="nomNaissanceErrorMessage"
              placeholder=""
              @update:model-value="onNomNaissanceChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="nomUsage"
              label="Nom d'usage"
              :label-visible="true"
              :model-value="nomUsage"
              :required="false"
              :is-valid="nomUsageMeta.valid"
              :error-message="nomUsageErrorMessage"
              placeholder=""
              @update:model-value="onNomUsageChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="prenom"
              label="Prénom"
              :label-visible="true"
              :model-value="prenom"
              :required="true"
              :is-valid="prenomMeta.valid"
              :error-message="prenomErrorMessage"
              placeholder=""
              @update:model-value="onPrenomChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrSelect
              :model-value="profession"
              name="profession"
              label="Profession"
              :required="true"
              :options="professionOptions"
              :is-valid="professionMeta.valid"
              :error-message="professionErrorMessage"
              @update:model-value="onProfessionChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="telephone"
              label="numéro de téléphone"
              :label-visible="true"
              :model-value="telephone"
              :required="true"
              :is-valid="telephoneMeta.valid"
              :error-message="telephoneErrorMessage"
              placeholder=""
              @update:model-value="onTelephoneChange"
            />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div v-if="isUpdate" class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="adresseDomicileSauvegardée"
              label="Adresse du domicile enregistrée"
              :label-visible="true"
              :model-value="adresseDomicileInitiale"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <label>{{
              isUpdate ? "Nouvelle adresse de domicile " : "Adresse du domicile"
            }}</label>
            <Multiselect
              v-model="adresseDomicile"
              mode="single"
              :close-on-select="true"
              :searchable="true"
              :internal-search="false"
              :loading="searchAdresseDomicileInProgress"
              :options="adressesDomicileOptions"
              :options-limit="10"
              @search-change="searchAdresseDomicile"
            />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrRadioButtonSet
              name="adresseIdentique"
              legend="L'adresse du siège des activités de VAO est elle celle du domicile ?"
              :required="true"
              :model-value="adresseIdentique"
              :options="ouiNonOptions"
              :is-valid="adresseIdentiqueMeta"
              :inline="false"
              :error-message="adresseIdentiqueErrorMessage"
              @update:model-value="setAdresseSiege"
            />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div v-if="adresseIdentique === 0" class="fr-fieldset__element">
          <div v-if="isUpdate" class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="adresseSiegeSauvegardée"
              label="Adresse du siège enregistrée"
              :label-visible="true"
              :model-value="adresseSiegeInitiale"
              :disabled="true"
            />
          </div>
          <div class="fr-input-group fr-col-8">
            <label>{{
              isUpdate
                ? "Nouvelle adresse du siège des activités VAO "
                : "Adresse du siège des activités VAO"
            }}</label>
            <Multiselect
              v-model="adresseSiege"
              mode="single"
              :close-on-select="false"
              :searchable="true"
              :internal-search="false"
              :loading="searchAdresseSiegeInProgress"
              :options="adressesSiegeOptions"
              :options-limit="10"
              @search-change="searchAdresseSiege"
            />
          </div>
        </div>
      </fieldset>
    </div>
    <!-- <DsfrButtonGroup
      :buttons="boutonOptions"
      :inline-layout-when="true"
      :reverse="true"
    /> -->
    <DsfrButton
      label="Suivant"
      :disabled="!isOperateurComplete"
      @click="validateOperateur"
    />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import * as yup from "yup";
import { useLayoutStore } from "@/stores/layout";
import { useOperateurStore } from "@/stores/operateur";

const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/operateur/idOperateur");

definePageMeta({
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur",
});

const NB_CAR_ADRESSE_MIN = 6;
const operateurStore = useOperateurStore();
const layoutStore = useLayoutStore();

const operateurCourant = computed(() => {
  return operateurStore.operateurCourant;
});

const typeOptions = [
  {
    label: "Personne physique",
    value: "personne_physique",
  },
  {
    label: "Personne morale",
    value: "personne_morale",
  },
];
const ouiNonOptions = [
  {
    label: "Oui",
    value: 1,
  },
  {
    label: "Non",
    value: 0,
  },
];
const professionOptions = [
  {
    text: "Agriculture, sylviculture et pêche",
    value: "Agriculture, sylviculture et pêche",
  },
  { text: "Industries extractives", value: "Industries extractives" },
  { text: "Industries manufacturières", value: "Industries manufacturières" },
  {
    text: "Production et distribution d’électricité, de gaz, de vapeur et d’air conditionné",
    value:
      "Production et distribution d’électricité, de gaz, de vapeur et d’air conditionné",
  },
  {
    text: "Production et distribution d’eau ; assainissement, gestion des déchets et dépollution",
    value:
      "Production et distribution d’eau ; assainissement, gestion des déchets et dépollution",
  },
  { text: "Construction", value: "Construction" },
  {
    text: "Commerce ; réparation d’automobiles et de motocycles",
    value: "Commerce ; réparation d’automobiles et de motocycles",
  },
  { text: "Transports et entreposage", value: "Transports et entreposage" },
  { text: "Hébergement et restauration", value: "Hébergement et restauration" },
  {
    text: "Information et communication",
    value: "Information et communication",
  },
  {
    text: "Activités financières et d’assurances",
    value: "Activités financières et d’assurances",
  },
  { text: "Activités immobilières", value: "Activités immobilières" },
  {
    text: "Activités spécialisées, scientifiques et techniques",
    value: "Activités spécialisées, scientifiques et techniques",
  },
  {
    text: "Activités de services administratifs et de soutien",
    value: "Activités de services administratifs et de soutien",
  },
  { text: "Administration publique", value: "Administration publique" },
  { text: "Enseignement", value: "Enseignement" },
  {
    text: "Santé humaine et action sociale",
    value: "Santé humaine et action sociale",
  },
  {
    text: "Arts, spectacles et activités récréatives",
    value: "Arts, spectacles et activités récréatives",
  },
  {
    text: "Autres activités de services",
    value: "Autres activités de services",
  },
  {
    text: "Activités des ménages en tant qu’employeur ; activités indifférenciées des ménages en tant que",
    value:
      "Activités des ménages en tant qu’employeur ; activités indifférenciées des ménages en tant que",
  },
  {
    text: "producteur de biens et services pour usage propre",
    value: "producteur de biens et services pour usage propre",
  },
  {
    text: "Activités extraterritoriales. ",
    value: "Activités extraterritoriales. ",
  },
];
// const boutonOptions = [
//   {
//     label: "Retour",
//     secondary: true,
//   },
//   {
//     label: "Valider",
//     onClick: validateOperateur,
//   },
// ];

const isUpdate = computed(() => {
  return !!route.params.idOperateur;
});

const representantLegaux = ref([{}]);
const expandedId = ref(1);
const siretRegex = /^[0-9]{14}$/;
const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const acceptedCharsRegex =
  /^([AÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔPQRSTUÙÛÜVWXYŸZÆŒ\- ']+)$/i;
const spaceFollowingDashRegex = /( -)|(- )/i;
const doubleSpacesRegex = / {2}/i;
const tripleDashRegex = /-{3}/i;
const doubleDashRegex = /-{2}/i;
const adressesDomicile = ref([]);
const adresseDomicileInitiale = ref();
const adressesSiege = ref([]);
const adresseSiegeInitiale = ref();
const searchAdresseDomicileInProgress = ref(false);
const searchAdresseSiegeInProgress = ref(false);
const personneMorale = ref();
const operateurDejaExistant = ref();

// Schéma et données de base
const schemaBase = {
  typeOperateur: yup.string().required(),
};
const validationSchemaBase = computed(() => {
  return yup.object({ ...schemaBase });
});
const initialValuesBase = computed(() => {
  return {
    typeOperateur: operateurCourant.value.typeOperateur ?? "",
  };
});
const { meta: metaBase, resetForm: resetFormBase } = useForm({
  initialValues: initialValuesBase,
  validationSchema: validationSchemaBase,
});
const {
  value: typeOperateur,
  errorMessage: typeOperateurErrorMessage,
  handleChange: onTypeOperateurChange,
  meta: typeOperateurMeta,
} = useField("typeOperateur");

// Schéma et données liées à une personne morale
const schemaMorale = {
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
    .required(),
};
const validationSchemaMorale = computed(() => {
  return yup.object({ ...schemaMorale });
});
const initialValuesMorale = computed(() => {
  return {
    siret: operateurCourant.value.personneMorale?.siret ?? "",
    email: operateurCourant.value.personneMorale?.email ?? "",
    formatedPersonneMorale: {
      raisonSociale: operateurCourant.value.personneMorale?.raisonSociale ?? "",
      statut: operateurCourant.value.personneMorale?.statut ?? "",
    },
    telephoneEP: operateurCourant.value.personneMorale?.telephoneEP ?? "",
    representantLegaux:
      operateurCourant.value.personneMorale?.representantLegaux ?? [],
  };
});
const { meta: metaMorale, resetForm: resetFormMorale } = useForm({
  initialValues: initialValuesMorale,
  validationSchema: validationSchemaMorale,
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
  value: telephoneEP,
  errorMessage: telephoneEPErrorMessage,
  validMessage: telephoneEPValidMessage,
  handleChange: onTelephoneEPChange,
  meta: telephoneEPMeta,
} = useField("telephoneEP");

// Schéma et données liées à une personne physique
const schemaPhysique = {
  nomNaissance: yup
    .string()
    .test("acceptedChars", "Caractères non acceptés détectés", (nomNaissance) =>
      acceptedCharsRegex.test(nomNaissance),
    )
    .test(
      "doubleSpaces",
      "Le nom ne peut contenir deux espaces successifs",
      (nomNaissance) => !doubleSpacesRegex.test(nomNaissance),
    )
    .test(
      "spaceFollowingDash",
      "Le nom ne peut contenir d'espace suivant un tiret",
      (nomNaissance) => !spaceFollowingDashRegex.test(nomNaissance),
    )
    .test(
      "tripleDash",
      "Le nom ne peut contenir trois tirets consécutifs",
      (nomNaissance) => !tripleDashRegex.test(nomNaissance),
    )
    .required(),
  nomUsage: yup.string().nullable(true),
  prenom: yup
    .string()
    .test("acceptedChars", "Caractères non acceptés détectés", (prenom) =>
      acceptedCharsRegex.test(prenom),
    )
    .test(
      "doubleSpaces",
      "Le prénom ne peut contenir deux espaces successifs",
      (prenom) => !doubleSpacesRegex.test(prenom),
    )
    .test(
      "spaceFollowingDash",
      "Le prénom ne peut contenir d'espace suivant un tiret",
      (prenom) => !spaceFollowingDashRegex.test(prenom),
    )
    .test(
      "doubleDash",
      "Le prénom ne peut contenir deux tirets consécutifs",
      (prenom) => !doubleDashRegex.test(prenom),
    )
    .required(),
  profession: yup.string().required(),
  adresseIdentique: yup.number().required(),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (telephone) =>
      numTelephoneRegex.test(telephone),
    )
    .required(),
  adresseDomicile: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup.object().required(); // schema for object
      case "string":
        return yup.string().required();
    }
  }),
  adresseSiege: yup.lazy((value) => {
    switch (typeof value) {
      case "object":
        return yup.object().required(); // schema for object
      case "string":
        return yup.string().required();
    }
  }),
};
const validationSchemaPhysique = computed(() => {
  return yup.object({ ...schemaPhysique });
});
const initialValuesPhysique = computed(() => {
  return {
    nomNaissance: operateurCourant.value.personnePhysique?.nomNaissance ?? "",
    nomUsage: operateurCourant.value.personnePhysique?.nomUsage ?? "",
    prenom: operateurCourant.value.personnePhysique?.prenom ?? "",
    profession: operateurCourant.value.personnePhysique?.profession ?? "",
    adresseDomicile:
      operateurCourant.value.personnePhysique?.adresseDomicile ?? "",
    adresseSiege: operateurCourant.value.personnePhysique?.adresseSiege ?? "",
    telephone: operateurCourant.value.personnePhysique?.telephone ?? "",
    adresseIdentique:
      operateurCourant.value.personnePhysique?.adresseIdentique ?? "",
  };
});
const {
  meta: metaPhysique,
  values: valuesPhysique,
  resetForm: resetFormPhysique,
} = useForm({
  initialValues: initialValuesPhysique,
  validationSchema: validationSchemaPhysique,
});
const {
  value: nomNaissance,
  errorMessage: nomNaissanceErrorMessage,
  handleChange: onNomNaissanceChange,
  meta: nomNaissanceMeta,
} = useField("nomNaissance");
const {
  value: nomUsage,
  errorMessage: nomUsageErrorMessage,
  handleChange: onNomUsageChange,
  meta: nomUsageMeta,
} = useField("nomUsage");
const {
  value: prenom,
  errorMessage: prenomErrorMessage,
  handleChange: onPrenomChange,
  meta: prenomMeta,
} = useField("prenom");
const {
  value: profession,
  errorMessage: professionErrorMessage,
  handleChange: onProfessionChange,
  meta: professionMeta,
} = useField("profession");
const { value: adresseDomicile } = useField("adresseDomicile");
const {
  value: adresseIdentique,
  errorMessage: adresseIdentiqueErrorMessage,
  meta: adresseIdentiqueMeta,
} = useField("adresseIdentique");
const { value: adresseSiege } = useField("adresseSiege");
const {
  value: telephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");

function setAdresseSiege(v) {
  log.i("setAdresseSiege -IN");
  adresseSiege.value = adresseDomicile.value;
  adresseIdentique.value = v;
}

async function searchAdresseDomicile(queryString) {
  if (queryString.length > NB_CAR_ADRESSE_MIN) {
    searchAdresseDomicileInProgress.value = true;
    const url = "/geo/adresse/";
    const { adresses } = await $fetchBackend(url, {
      body: { queryString },
      method: "POST",
    });
    if (adresses) {
      log.i("resultat found");
      adressesDomicile.value = adresses;
      searchAdresseDomicileInProgress.value = false;
    }
  }
}

async function searchAdresseSiege(queryString) {
  if (queryString.length > NB_CAR_ADRESSE_MIN) {
    searchAdresseSiegeInProgress.value = true;
    const url = "/geo/adresse/";
    const { adresses } = await $fetchBackend(url, {
      body: { queryString },
      method: "POST",
    });
    if (adresses) {
      adressesSiege.value = adresses;
      searchAdresseSiegeInProgress.value = false;
    }
  }
}

const adressesDomicileOptions = computed(() => {
  if (adressesDomicile.value && adressesDomicile.value.length > 0) {
    return adressesDomicile.value.map((a) => {
      return { value: a, label: a.properties.label };
    });
  }
  return [];
});

const adressesSiegeOptions = computed(() => {
  if (adressesSiege.value && adressesSiege.value.length > 0) {
    return adressesSiege.value.map((a) => {
      return { value: a, label: a.properties.label };
    });
  }
  return [];
});

const isEtablissementFound = computed(() => {
  return !!siret.value;
});

const isEtablissementPrincipal = computed(() => {
  return isEtablissementFound.value && personneMorale.value.siege_social;
});

const isEtablissementDisplayable = computed(() => {
  return (
    isEtablissementFound.value &&
    (isEtablissementPrincipal ||
      !!operateurStore.operateurs.find((e) => e.siret === siret.value))
  );
});

const formatedPersonneMorale = computed(() => {
  if (personneMorale.value) {
    const adresse = `${personneMorale.value.adresse.numero_voie ?? ""} ${
      personneMorale.value.adresse.type_voie ?? ""
    } ${personneMorale.value.adresse.libelle_voie ?? ""} ${
      personneMorale.value.adresse.code_postal ?? ""
    } ${personneMorale.value.adresse.libelle_commune ?? ""}`;
    return {
      siret: personneMorale.value.siret,
      raisonSociale:
        personneMorale.value.unite_legale.personne_morale_attributs
          .raison_sociale,
      statut: personneMorale.value.unite_legale.forme_juridique.libelle,
      adresse: adresse.trim(),
      adresseComplete: personneMorale.value.adresse,
      pays: personneMorale.value.adresse.libelle_pays_etranger ?? "France",
    };
  }
  if (operateurDejaExistant.value) {
    representantLegaux.value =
      operateurDejaExistant.value.personneMorale.representantLegaux;
    email.value = operateurDejaExistant.value.personneMorale.email;
    telephoneEP.value = operateurDejaExistant.value.personneMorale.telephoneEP;
    return {
      siret: operateurDejaExistant.value.personneMorale.siret,
      raisonSociale: operateurDejaExistant.value.personneMorale.raisonSociale,
      statut: operateurDejaExistant.value.personneMorale.statut,
      adresse: operateurDejaExistant.value.personneMorale.adresseShort,
      adresseComplete: operateurDejaExistant.value.personneMorale.adresse,
      pays: operateurDejaExistant.value.personneMorale.pays,
    };
  }
  if (isUpdate.value) {
    return {
      siret: operateurCourant.value.personneMorale.siret,
      raisonSociale: operateurCourant.value.personneMorale.raisonSociale,
      statut: operateurCourant.value.personneMorale.statut,
      adresse: operateurCourant.value.personneMorale.adresseShort,
      adresseComplete: operateurCourant.value.personneMorale.adresse,
      pays: operateurCourant.value.personneMorale.pays,
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

const nomPrenomRepresentantLegal = computed(() => {
  return representantLegaux.value.map((r) => {
    return r.nom
      ? `${r.nom.toUpperCase()}  ${r.prenom.toUpperCase()} - ${r.fonction}`
      : "Nouveau représentant légal - A RENSEIGNER";
  });
});

async function searchApiEntreprise() {
  log.i("searchApiEntreprise - IN");
  const url = `/siret/${siret.value}`;
  if (personneMorale.value) {
    personneMorale.value = null;
  }
  try {
    const { uniteLegale } = await $fetchBackend(url, {
      method: "GET",
    });
    if (uniteLegale) {
      toaster.success("Données récupérées");
      personneMorale.value = uniteLegale[0];
      log.d(personneMorale.value);
    }
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données à partir du SIRET",
    );
    log.w("searchApiEntreprise - erreur:", { error });
  }
}

async function searchOperateurBySiret() {
  log.i("searchOperateurBySiret - IN");
  const url = `/operateur/siret/${siret.value}`;
  try {
    const { operateur } = await $fetchBackend(url, {
      method: "GET",
    });
    if (operateur) {
      toaster.success("L'opérateur est déjà présent en base");
      operateurDejaExistant.value = operateur;
      log.d(operateurDejaExistant.value);
    }
    if (error.value) {
      log.w(error.value);
    }
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données internes à partir du SIRET",
    );
    log.w("searchOperateurBySiret - erreur:", { error });
  }
}

async function searchOperateur() {
  const operateur = await searchOperateurBySiret();
  log.d("operateur", operateur);
  if (!operateur) {
    log.d("appel API entreprise");
    await searchApiEntreprise();
  }
}

function addRepresentantLegal() {
  representantLegaux.value.push({});
  expandedId.value = representantLegaux.value.length;
}

function validRepresentantLegal(representantLegal, index) {
  log.i("addRepresentantLegal - IN");
  representantLegaux.value[index] = representantLegal;
  expandedId.value = 0;
}

const isOperateurComplete = computed(() => {
  if (typeOperateur.value === "personne_physique") {
    return metaBase.value.valid && metaPhysique.value.valid;
  }
  if (typeOperateur.value === "personne_morale") {
    return (
      !!metaBase.value.valid &&
      !!metaMorale.value.valid &&
      !!representantLegaux.value.every((item) => item.nom && item.prenom)
    );
  }
  return false;
});

async function validateOperateur() {
  log.i("validateOperateur - IN");
  const parametre =
    typeOperateur.value === "personne_physique"
      ? {
          ...valuesPhysique,
          adresseDomicileShort: adresseDomicile?.value?.properties?.label,
          adresseSiegeShort:
            adresseIdentique.value === 1
              ? adresseDomicile?.value?.properties?.label
              : adresseSiege?.value?.properties?.label,
        }
      : {
          siret: siret.value,
          raisonSociale: formatedPersonneMorale.value.raisonSociale,
          statut: formatedPersonneMorale.value.statut,
          adresseShort: formatedPersonneMorale.value.adresse,
          adresse: formatedPersonneMorale.value.adresseComplete,
          pays: formatedPersonneMorale.value.pays,
          email: email.value,
          telephoneEP: telephoneEP.value,
          representantLegaux: representantLegaux.value,
          meta: metaBase.value.valid && metaMorale.value.valid,
        };

  try {
    const url = isUpdate.value
      ? `/operateur/${route.params.idOperateur}`
      : operateurDejaExistant?.value?.length > 0
        ? `/operateur/link/${operateurDejaExistant.value.operateurId}`
        : "/operateur";
    const { operateurId } = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre,
        type: typeOperateur.value,
      },
    });
    if (operateurId) {
      log.i("operateur créé", operateurId);
      const url = `/operateur/agrement/${operateurId}`;
      log.i(url);
      toaster.success("Fiche opérateur sauvegardée");
      navigateTo(url);
    }
  } catch (error) {
    toaster.error(`une erreur est survenue : ${error}`);
    log.w("Creation/modification d'operateur - erreur", { error });
  }
}

onMounted(async () => {
  layoutStore.stepperIndex = 1;
  await operateurStore.setMyOperateur();
  if (operateurCourant.value) {
    if (operateurCourant.value.typeOperateur === "personne_morale") {
      representantLegaux.value =
        operateurCourant.value.personneMorale.representantLegaux;
      expandedId.value = 0;
    }
    if (operateurCourant.value.typeOperateur === "personne_physique") {
      adresseDomicile.value =
        operateurCourant.value.personnePhysique.adresseDomicile;
      adresseDomicileInitiale.value =
        operateurCourant.value.personnePhysique.adresseDomicileShort;
      adresseSiege.value = operateurCourant.value.personnePhysique.adresseSiege;
      adresseSiegeInitiale.value =
        operateurCourant.value.personnePhysique.adresseSiegeShort;
    }
  }
  resetFormBase({ values: initialValuesBase.value });
  resetFormMorale({ values: initialValuesMorale.value });
  resetFormPhysique({ values: initialValuesPhysique.value });
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
