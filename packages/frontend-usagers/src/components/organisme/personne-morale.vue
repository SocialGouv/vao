<template>
  <div>
    <DsfrFieldset>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="porteurAgrement"
          legend="Êtes-vous l’organisateur titulaire de l'agrément ?"
          :model-value="porteurAgrement"
          :options="ouiNonOptions"
          :is-valid="porteurAgrementMeta"
          :inline="false"
          :error-message="porteurAgrementErrorMessage"
          :disabled="!props.modifiable"
          @update:model-value="onPorteurAgrementChange"
        />
      </div>
      <DsfrInputGroup
        name="siret"
        :label="
          porteurAgrement
            ? 'Numéro SIRET du titulaire de l’agrément VAO'
            : 'Numéro SIRET de l\'établissement secondaire ou de la délégation locale organisant le séjour'
        "
        :label-visible="true"
        :model-value="formatedSiret"
        :is-valid="siretMeta.valid"
        :error-message="siretErrorMessage"
        :readonly="!props.modifiable"
        placeholder=""
        hint="14 chiffres consécutifs qui indiquent l'établissement organisateur. Exemple: 110 000 072 00014"
        @update:model-value="trimSiret"
      />
      <div v-if="props.modifiable" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrButton
            id="chercherSiret"
            :disabled="!siretMeta.valid"
            @click.prevent="searchOrganisme"
            >Récupérer les informations de la personne morale
          </DsfrButton>
        </div>
      </div>
    </DsfrFieldset>
    <div v-if="siren">
      <DsfrFieldset legend="Organisateur du séjour">
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="raisonSociale"
            label="Raison sociale"
            :label-visible="true"
            :model-value="raisonSociale"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="nomCommercial"
            label="Nom commercial (optionnel)"
            :label-visible="true"
            :model-value="nomCommercial"
            :is-valid="nomCommercialMeta.valid"
            :error-message="nomCommercialErrorMessage"
            :readonly="!props.modifiable"
            placeholder=""
            @update:model-value="onNomCommercialChange"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="statut"
            label="Statut, forme juridique"
            :label-visible="true"
            :model-value="statut"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="adresse"
            label="adresse"
            :label-visible="true"
            :model-value="adresse"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="pays"
            label="Pays"
            :label-visible="true"
            :model-value="pays"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="email"
            label="Adresse courriel"
            :label-visible="true"
            :model-value="email"
            :readonly="!props.modifiable"
            :is-valid="emailMeta.valid"
            :error-message="emailErrorMessage"
            placeholder=""
            hint="L'adresse de courriel doit être valide. Exemple: nom@domaine.fr"
            @update:model-value="onEmailChange"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="telephone"
            label="Téléphone"
            :label-visible="true"
            :model-value="telephone"
            :readonly="!props.modifiable"
            :is-valid="telephoneMeta.valid"
            :valid-message="telephoneValidMessage"
            :error-message="telephoneErrorMessage"
            placeholder=""
            hint="Au format 0X, +33X ou 0033. Exemple : 0612345678"
            @update:model-value="onTelephoneChange"
          />
        </div>
      </DsfrFieldset>
      <DsfrFieldset v-if="!porteurAgrement" legend="Organisateur agréé">
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="agreeSiret"
            label="SIRET agréé"
            :label-visible="true"
            :model-value="etablissementPrincipal.siret"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="agreeRaisonSociale"
            label="Raison sociale"
            :label-visible="true"
            :model-value="etablissementPrincipal.raisonSociale"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="agreeNomCommercial"
            label="Nom commercial (optionnel)"
            :label-visible="true"
            :model-value="etablissementPrincipal.nomCommercial"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="adresse"
            label="adresse"
            :label-visible="true"
            :model-value="etablissementPrincipal.adresse"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="pays"
            label="Pays"
            :label-visible="true"
            :model-value="etablissementPrincipal.pays"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="agreeEmail"
            label="Adresse courriel"
            :label-visible="true"
            :model-value="etablissementPrincipal.email"
            :readonly="true"
          />
        </div>
        <div class="fr-fieldset__element">
          <DsfrInputGroup
            name="agreeTelephone"
            label="Téléphone"
            :label-visible="true"
            :model-value="etablissementPrincipal.telephone"
            :readonly="true"
          />
        </div>
      </DsfrFieldset>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <Personnes
            :key="keyRepresentantLegaux"
            :personnes="representantsLegaux"
            :modifiable="props.modifiable"
            :show-adresse="false"
            :show-attestation="false"
            :show-competence="false"
            :show-date-naissance="false"
            :show-email="false"
            :show-fonction="true"
            :show-liste-fonction="false"
            :show-telephone="false"
            titre="Représentant légaux"
            :headers="headers"
            :current-page="currentPersonnesPage"
            label-bouton-ajouter="Ajouter un représentant légal"
            @valid="onRepresentantsLegauxChangeWithKeyChange"
          >
          </Personnes>
        </div>
      </div>
      <DsfrFieldset v-if="siegeSocial">
        <div class="fr-fieldset">
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
          >
            <div class="fr-input-group">
              <DsfrInputGroup
                v-model="etablissementFilter.siret"
                type="text"
                name="siret"
                label="SIRET"
                placeholder="SIRET"
                :label-visible="true"
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
          >
            <div class="fr-input-group">
              <DsfrInputGroup
                v-model="etablissementFilter.denomination"
                type="text"
                name="denomination"
                label="Dénomination"
                placeholder="Dénomination"
                :label-visible="true"
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
          >
            <div class="fr-input-group">
              <DsfrInputGroup
                v-model="etablissementFilter.commune"
                type="text"
                name="commune"
                label="Commune"
                placeholder="Commune"
                :label-visible="true"
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
          >
            <div class="fr-input-group">
              <DsfrSelect
                v-model="etablissementFilter.autorisation"
                label="Autorisation"
                name="Autorisation"
                :options="['Tous', 'En activité', 'Fermé']"
              />
            </div>
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrTable
              :title="`Etablissements secondaires (${etablissements.length}) dont ${formatedEtablissements.length} actifs`"
              :headers="[
                'SIRET',
                'Dénomination',
                'Adresse',
                'Code postal',
                'Commune',
                'Autorisé à organiser des séjours ?',
              ]"
              :rows="formatedEtablissements"
              :results-displayed="10"
              pagination
            />
          </div>
          <DsfrButton
            id="refresh-etablissement-sec"
            size="sm"
            :secondary="true"
            @click.prevent="refreshEtablissmentsSecondaires"
            >Rafraichir la liste des établissements secondaires
          </DsfrButton>
        </div>
      </DsfrFieldset>
      <DsfrFieldset
        v-if="props.showResponsableSejour"
        legend="Responsable de l'organisation du séjour"
      >
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <Personne
              :key="randomId"
              :personne="responsableSejour"
              :modifiable="props.modifiable"
              :show-adresse="true"
              :show-attestation="false"
              :show-competence="false"
              :show-date-naissance="false"
              :show-email="true"
              :show-fonction="true"
              :show-liste-fonction="false"
              :show-telephone="true"
              :show-button="false"
              :validate-on-mount="!props.modifiable"
              :model-value="responsableSejour"
              @update:personne="onResponsableSejourChange"
            ></Personne>
          </div>
        </div>
      </DsfrFieldset>
    </div>

    <DsfrFieldset v-if="props.showButtons" class="fr-fieldset">
      <DsfrButton
        v-if="!props.isDownloading"
        id="next-step"
        :disabled="!siren || !siret"
        @click.prevent="next"
        >Suivant
      </DsfrButton>
      <IsDownloading
        :is-downloading="props.isDownloading"
        :message="props.message"
      />
    </DsfrFieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { IsDownloading } from "@vao/shared";
import { DsfrToggleSwitch } from "@gouvminint/vue-dsfr";

const toaster = useToaster();

const log = logger("components/organisme/personne-morale");

const emit = defineEmits(["previous", "next", "update"]);

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  showResponsableSejour: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
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
const keyRepresentantLegaux = ref(1);
const currentPersonnesPage = ref(1);

const validationSchema = computed(() =>
  yup.object(organisme.personneMoraleSchema),
);

const etablissementFilter = ref({
  siret: "",
  denomination: "",
  commune: "",
  autorisation: "Tous",
});

const initialValues = {
  siret: null,
  siren: null,
  siegeSocial: null,
  porteurAgrement: null,
  raisonSociale: null,
  nomCommercial: null,
  statut: null,
  adresse: null,
  pays: null,
  email: null,
  telephone: null,
  representantsLegaux: [],
  etablissements: [],
  responsableSejour: {},
  etablissementPrincipal: {},
  ...props.initData,
};

const { meta, values, setValues } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: props.validateOnMount,
});

const {
  value: porteurAgrement,
  errorMessage: porteurAgrementErrorMessage,
  handleChange: onPorteurAgrementChange,
  meta: porteurAgrementMeta,
} = useField("porteurAgrement");
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
  value: nomCommercial,
  errorMessage: nomCommercialErrorMessage,
  handleChange: onNomCommercialChange,
  meta: nomCommercialMeta,
} = useField("nomCommercial");
const {
  value: representantsLegaux,
  handleChange: onRepresentantsLegauxChange,
} = useField("representantsLegaux");
const { value: etablissements } = useField("etablissements");
const { value: etablissementPrincipal } = useField("etablissementPrincipal");
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
  return etablissements.value
    .filter((e) => {
      return !props.modifiable ? e.enabled : e;
    })
    .filter(
      (e) =>
        new RegExp(etablissementFilter.value.siret, "i").test(e.siret) &&
        new RegExp(etablissementFilter.value.denomination, "i").test(
          e.denomination,
        ) &&
        new RegExp(etablissementFilter.value.commune, "i").test(e.commune) &&
        (etablissementFilter.value.autorisation === "Tous"
          ? "true"
          : (etablissementFilter.value.autorisation === "En activité" &&
              e.enabled) ||
            (etablissementFilter.value.autorisation === "Fermé" && !e.enabled)),
    )
    .map((e) => {
      const row = [
        e.siret ?? "",
        e.denomination ?? "",
        e.adresse ?? "",
        e.codePostal ?? "",
        e.commune ?? "",
        {
          component: DsfrToggleSwitch,
          modelValue: e.enabled,
          disabled:
            !props.modifiable ||
            (!e.enabled && !(e.etatAdministratif == "En activité")),
          onChange: () => {
            e.enabled = !e.enabled;
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
    const {
      uniteLegale,
      etablissements,
      representantsLegaux,
      nomCommercial,
      siege,
    } = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    const adresse =
      `${uniteLegale.adresseEtablissement.numeroVoieEtablissement ?? ""} ${uniteLegale.adresseEtablissement.typeVoieEtablissement ?? ""} ${uniteLegale.adresseEtablissement.libelleVoieEtablissement} ${uniteLegale.adresseEtablissement.codePostalEtablissement} ${uniteLegale.adresseEtablissement.libelleCommuneEtablissement}`.trim();

    const etablissementPrincipal =
      siege &&
      siege.complet &&
      siege.personneMorale?.etablissements?.find((e) => {
        return e.nic === siret.value.slice(9);
      })
        ? {
            siret: siege.personneMorale.siret ?? "",
            raisonSociale: siege.personneMorale.raisonSociale ?? "",
            nomCommercial: siege.personneMorale.nomCommercial ?? "",
            adresse: siege.personneMorale.adresse ?? "",
            pays: siege.personneMorale.pays ?? "",
            telephone: siege.personneMorale.telephone ?? "",
            email: siege.personneMorale.email ?? "",
          }
        : {};

    setValues({
      siren: uniteLegale.siren,
      siegeSocial: uniteLegale.etablissementSiege,
      raisonSociale:
        uniteLegale.uniteLegale.denominationUniteLegale ??
        uniteLegale.uniteLegale.nomUsageUniteLegale,
      nomCommercial: nomCommercial ?? null,
      statut: uniteLegale.uniteLegale.categorieJuridiqueUniteLegale,
      adresse,
      pays:
        uniteLegale.adresseEtablissement.libellePaysEtrangerEtablissement ??
        "France",
      representantsLegaux: representantsLegaux ?? [],
      etablissements: etablissements ?? [],
      etablissementPrincipal,
    });
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "erreur lors de la récupération des données à partir du SIRET",
    });
    log.w("searchApiInsee - erreur:", { error });
    setValues({
      siren: null,
      siegeSocial: null,
      raisonSociale: null,
      nomCommercial: null,
      statut: null,
      adresse: null,
      pays: null,
      representantsLegaux: [],
      etablissements: [],
      etablissementPrincipal: {},
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
        porteurAgrement: porteurAgrement.value,
      });
      return data.organisme;
    }
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "erreur lors de la récupération des données internes à partir du SIRET",
    });
    log.w("searchOrganismeBySiret - erreur:", { error });
    return null;
  }
}

async function searchOrganisme() {
  log.i("searchOrganisme - In");
  const organismeFound = await searchOrganismeBySiret();
  if (!organismeFound || !organismeFound?.personneMorale?.siren) {
    log.d("appel API INSEE");
    await searchApiInsee();
  }
  if (siren.value) {
    if (!porteurAgrement.value && siegeSocial.value) {
      toaster.error({
        titleTag: "h2",
        description:
          "Un établissement principal est nécessairement titulaire d'un agrément",
      });
      setValues({
        siren: null,
        siegeSocial: null,
        raisonSociale: null,
        nomCommercial: null,
        statut: null,
        adresse: null,
        pays: null,
        representantsLegaux: [],
        etablissements: [],
        etablissementPrincipal: {},
      });
      return false;
    }
    if (!porteurAgrement.value && !etablissementPrincipal.value.siret) {
      toaster.error({
        titleTag: "h2",
        description:
          "L'établissement principal ne s'est pas encore déclaré sur la plateforme. Veuillez réessayer plus tard.",
      });
      setValues({
        siren: null,
        siegeSocial: null,
        raisonSociale: null,
        nomCommercial: null,
        statut: null,
        adresse: null,
        pays: null,
        representantsLegaux: [],
        etablissements: [],
        etablissementPrincipal: {},
      });
      return false;
    }
    if (siren)
      toaster.success({ titleTag: "h2", description: "Données récupérées" });
    randomId.value = random.getRandomId();
    keyRepresentantLegaux.value += 1;
  }
}

async function refreshEtablissmentsSecondaires() {
  log.i("searchOrganismeBySiret - IN");
  const url = `/siret/${siret.value}`;
  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    const newList = [];
    for (const etablissement of data.etablissements) {
      newList.push({
        ...etablissement,
        enabled:
          etablissements.value?.find((e) => e.siret === etablissement.siret)
            ?.enabled ?? false,
      });
    }

    etablissements.value = newList;
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "erreur lors du rafraichissment des établissements secondaires",
    });
    log.w("searchOrganismeBySiret - erreur:", { error });
    return null;
  }
}

const onRepresentantsLegauxChangeWithKeyChange = (event) => {
  onRepresentantsLegauxChange(event);
  /* Le fait de changer la clé rernder le composant. Il semble que
  la cloture de la popup rentre en conflit avec ce rerender ce qui casse le scroll.

  On met un petit setTimeout pour eviter ce conflit.

  De plus, quand une ligne est ajoutée, il est possible qu'elle appartienne a la page suivante.
  Dans ce cas, comme le tableau est rerender avec 10 colonnes par defaut (ce le composant DsfrTable de Personnes),
  on peut choisir la page a affichée qui est celle du nouvel ajout via la formule suivante.*/
  setTimeout(() => {
    keyRepresentantLegaux.value += 1;
    currentPersonnesPage.value =
      Math.floor(((representantsLegaux.value ?? []).length - 1) / 10) + 1;
  }, 10);
};

function next() {
  log.i("next - IN");
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    {
      ...values,
    },
    "personne_morale",
  );
}
</script>
