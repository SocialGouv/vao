<template>
  <div>
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
      <div
        v-if="props.initData.adresseDomicile?.label"
        class="fr-fieldset__element"
      >
        <div class="fr-input-group fr-col-8">
          <DsfrInputGroup
            name="adresseDomicileSauvegardée"
            label="Adresse du domicile enregistrée"
            :label-visible="true"
            :model-value="props.initData.adresseDomicile?.label"
            :disabled="true"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <label>{{
            isUpdate ? "Nouvelle adresse de domicile " : "Adresse du domicile"
          }}</label>
          <SearchAddress
            :value="adresseDomicile"
            @select="onAddressDomicileChange"
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
        <div
          v-if="props.initData.adresseSiege?.label"
          class="fr-input-group fr-col-8"
        >
          <DsfrInputGroup
            name="adresseSiegeSauvegardée"
            label="Adresse du siège enregistrée"
            :label-visible="true"
            :model-value="props.initData.adresseSiege?.label"
            :disabled="true"
          />
        </div>
        <div class="fr-input-group fr-col-8">
          <label>{{
            isUpdate
              ? "Nouvelle adresse du siège des activités VAO "
              : "Adresse du siège des activités VAO"
          }}</label>
          <SearchAddress :value="adresseSiege" @select="onAddressSiegeChange" />
        </div>
      </div>
    </fieldset>
    <DsfrButton label="Suivant" @click="next" />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { ouiNonOptions } from "@/helpers/ouiNonOptions";
const log = logger("components/operateur/personne-physique");

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

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

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const acceptedCharsRegex =
  /^([AÀÂBCÇDEÉÈÊËFGHIÎÏJKLMNOÔPQRSTUÙÛÜVWXYŸZÆŒ\- ']+)$/i;
const spaceFollowingDashRegex = /( -)|(- )/i;
const doubleSpacesRegex = / {2}/i;
const tripleDashRegex = /-{3}/i;
const doubleDashRegex = /-{2}/i;

const isUpdate = computed(() => {
  return !!props.initData;
});
// Schéma et données liées à une personne physique
const schema = {
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
  adresseDomicile: yup.object().required(),
  adresseSiege: yup.object().required(),
};
const validationSchema = computed(() => {
  return yup.object({ ...schema });
});
const initialValues = computed(() => {
  return {
    nomNaissance: props.initData.nomNaissance ?? "",
    nomUsage: props.initData.nomUsage ?? "",
    prenom: props.initData.prenom ?? "",
    profession: props.initData.profession ?? "",
    telephone: props.initData.telephone ?? "",
    adresseDomicile: props.initData.adresseDomicile,
    adresseIdentique: props.initData.adresseIdentique,
    adresseSiege: props.initData.adresseSiege,
  };
});
const { meta, values } = useForm({
  initialValues,
  validationSchema,
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
const { value: adresseDomicile, handleChange: onAddressDomicileChange } =
  useField("adresseDomicile");
const {
  value: adresseIdentique,
  errorMessage: adresseIdentiqueErrorMessage,
  meta: adresseIdentiqueMeta,
} = useField("adresseIdentique");
const { value: adresseSiege, handleChange: onAddressSiegeChange } =
  useField("adresseSiege");
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

function next() {
  emit(
    "valid",
    {
      ...values,
      meta: meta.value.valid,
    },
    "personne_physique",
  );
}
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
