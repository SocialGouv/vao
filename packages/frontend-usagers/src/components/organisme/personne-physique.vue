<template>
  <div>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrInputGroup
            name="siret"
            label="Numéro SIRET du titulaire de l’agrément VAO"
            :label-visible="true"
            :model-value="formatedSiret"
            :is-valid="siretMeta.valid"
            :error-message="siretErrorMessage"
            :disabled="
              !props.modifiable ||
              !!organismeStore.organismeCourant?.complet ||
              userStore.user.userSiret
            "
            placeholder=""
            hint="14 chiffres consécutifs qui indiquent l'établissement organisateur. Exemple: 110 000 072 00014"
            @update:model-value="trimSiret"
          />
        </div>
      </div>
      <div
        v-if="props.modifiable && !organismeStore.organismeCourant?.complet"
        class="fr-fieldset__element"
      >
        <ApiUnavailable
          :api-unavailable-types="props.unavailableApi"
          :display-types="[apiTypes.ADRESSE]"
        ></ApiUnavailable>

        <div class="fr-input-group fr-col-8">
          <DsfrButton
            id="chercherSiret"
            :disabled="!siretMeta.valid"
            @click.prevent="searchOrganisme"
            >Récupérer les informations de la personne physique
          </DsfrButton>
        </div>
      </div>
      <div v-if="nomNaissance">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="nomNaissance"
              label="Nom de naissance"
              :label-visible="true"
              :model-value="nomNaissance"
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="nomUsage"
              label="Nom d'usage (optionnel)"
              :label-visible="true"
              :readonly="!props.modifiable"
              :model-value="nomUsage"
              :is-valid="nomUsageMeta.valid"
              :error-message="nomUsageErrorMessage"
              placeholder=""
              hint="Veuillez saisir votre nom d'usage. Exemple: Dupont"
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
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrSelect
              :model-value="profession"
              name="profession"
              :readonly="!props.modifiable"
              label="Profession"
              :options="organisme.professionOptions"
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
              :readonly="!props.modifiable"
              :label-visible="true"
              :model-value="telephone"
              :is-valid="telephoneMeta.valid"
              :error-message="telephoneErrorMessage"
              placeholder=""
              hint="Veuillez saisir votre numéro de téléphone. Exemple: 0612345678"
              @update:model-value="onTelephoneChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="adresse"
              label="Adresse du domicile"
              :label-visible="true"
              :model-value="adresseDomicile?.label"
              :readonly="true"
            />
          </div>
        </div>
        <div class="fr-fieldset">
          <div class="fr-fieldset__element">
            <div class="fr-input-group fr-col-8">
              <DsfrRadioButtonSet
                name="adresseIdentique"
                legend="L'adresse du lieu d’exercice des activités de VAO est-elle celle du
          domicile ?"
                :model-value="adresseIdentique"
                :options="ouiNonOptions"
                :disabled="!props.modifiable"
                :is-valid="adresseIdentiqueMeta.valid"
                :inline="true"
                :error-message="adresseIdentiqueErrorMessage"
                @update:model-value="setAdresseIdentique"
              />
            </div>
          </div>
        </div>
        <div class="fr-fieldset">
          <div v-if="adresseIdentique === false" class="fr-fieldset__element">
            <div class="fr-input-group fr-col-8">
              <AddressSearchAddress
                :initial-adress="props.initData.adresseSiege?.label"
                :modifiable="props.modifiable"
                :error-message="adresseSiegeErrorMessage"
                :label="
                  props.initData.adresseSiege
                    ? 'Nouvelle adresse du lieu d’exercice des activités VAO'
                    : 'Adresse du lieu d’exercice des activités VAO'
                "
                :value="adresseSiege"
                @select="onAdressSiegeChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <DsfrFieldset v-if="props.showButtons" class="fr-fieldset">
      <DsfrButton
        v-if="!props.isDownloading"
        id="next-step"
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
import { IsDownloading, ApiUnavailable } from "@vao/shared";
import { apiTypes } from "@vao/shared/src/models";

const toaster = useToaster();
const log = logger("components/organisme/personne-physique");

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  unavailableApi: { type: Object, required: false, default: () => ({}) },
});

const emit = defineEmits(["update", "next"]);
const organismeStore = useOrganismeStore();
organismeStore.fetchUsersOrganisme();
const userStore = useUserStore();

const validationSchema = computed(() => {
  return yup.object(organisme.personnePhysiqueSchema);
});
const initialValues = {
  siret: props.initData.siret ?? userStore.user?.userSiret,
  nomNaissance: props.initData.nomNaissance ?? null,
  nomUsage: props.initData.nomUsage ?? null,
  prenom: props.initData.prenom ?? null,
  profession: props.initData.profession ?? null,
  telephone: props.initData.telephone ?? null,
  adresseDomicile: props.initData.adresseDomicile ?? null,
  adresseIdentique: props.initData.adresseIdentique ?? null,
  adresseSiege: props.initData.adresseSiege ?? null,
};

const { meta, values, setValues } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: props.validateOnMount,
});

const {
  value: siret,
  errorMessage: siretErrorMessage,
  handleChange: onSiretChange,
  meta: siretMeta,
} = useField("siret");
const { value: nomNaissance } = useField("nomNaissance");
const {
  value: nomUsage,
  errorMessage: nomUsageErrorMessage,
  handleChange: onNomUsageChange,
  meta: nomUsageMeta,
} = useField("nomUsage");
const { value: prenom } = useField("prenom");
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
const {
  value: adresseSiege,
  errorMessage: adresseSiegeErrorMessage,
  resetField: resetAdressSiegeField,
  handleChange: onAdressSiegeChange,
} = useField("adresseSiege");
const {
  value: telephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");

function trimSiret(s) {
  return onSiretChange(s.replace(/ /g, ""));
}

const formatedSiret = computed(() => {
  if (!siret.value) {
    return "";
  }
  const siretSaisi = siret.value;
  let formatSiret = "";

  for (let i = 0; i < siretSaisi.length; i++) {
    formatSiret += siretSaisi[i];
    if ([2, 5, 8].includes(i)) {
      formatSiret += " ";
    }
  }

  return formatSiret;
});

async function searchOrganisme() {
  log.i("searchOrganisme - In");
  const organismeFound = await searchOrganismeBySiret();
  if (!organismeFound) {
    log.d("appel API INSEE");
    await searchApiInsee();
    if (siret.value) {
      toaster.success({ titleTag: "h2", description: "Données récupérées" });
    }
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
    if (
      data.organisme &&
      data.organisme.organismeId !==
        organismeStore.organismeCourant?.organismeId &&
      data.organisme.personnePhysique
    ) {
      toaster.error({
        titleTag: "h2",
        description: "Un organisme existe déjà pour ce SIRET",
      });
      return true;
    }
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "erreur lors de la récupération des données internes à partir du SIRET",
    });
    log.w("searchOrganismeBySiret - erreur:", { error });
    return true;
  }
  return false;
}

async function searchApiInsee() {
  log.i("searchApiInsee - IN");
  const url = `/siret/${siret.value}`;
  try {
    const { uniteLegale } = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });

    const adresse =
      `${uniteLegale.adresseEtablissement.numeroVoieEtablissement ?? ""} ${uniteLegale.adresseEtablissement.typeVoieEtablissement ?? ""} ${uniteLegale.adresseEtablissement.libelleVoieEtablissement} ${uniteLegale.adresseEtablissement.codePostalEtablissement} ${uniteLegale.adresseEtablissement.libelleCommuneEtablissement}`.trim();

    setValues({
      nomNaissance: uniteLegale.uniteLegale.nomUniteLegale,
      nomUsage: uniteLegale.uniteLegale.nomUsageUniteLegale ?? "",
      prenom: uniteLegale.uniteLegale.prenomUsuelUniteLegale,
      adresseDomicile: {
        label: adresse,
        codeInsee:
          uniteLegale.adresseEtablissement.codeCommuneEtablissement ?? "",
        codePostal: uniteLegale.adresseEtablissement.codePostalEtablissement,
        coordinates: uniteLegale.adresseEtablissement.coordinates,
        departement: uniteLegale.adresseEtablissement.departement,
      },
    });
  } catch (error) {
    if (error.response?.status === 403) {
      toaster.error({
        titleTag: "h2",
        description:
          "Le SIRET renseigné n’est plus valide. Veuillez utiliser le nouveau SIRET de votre établissement",
      });
    } else {
      toaster.error({
        titleTag: "h2",
        description:
          "erreur lors de la récupération des données à partir du SIRET",
      });
    }
    log.w("searchApiInsee - erreur:", { error });
  }
}

function setAdresseIdentique(v) {
  log.d("setAdresseIdentique - IN");
  resetAdressSiegeField({
    value: v ? adresseDomicile.value : null,
  });
  adresseIdentique.value = v;
  log.d("setAdresseIdentique - Done");
}

function next() {
  if (!meta.value.dirty) {
    return emit("next");
  }

  emit(
    "update",
    {
      ...values,
    },
    "personne_physique",
  );
}
</script>

<style lang="scss" scoped></style>
