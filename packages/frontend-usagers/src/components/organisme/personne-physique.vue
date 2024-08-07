<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrInputGroup
            name="nomNaissance"
            label="Nom de naissance"
            :label-visible="true"
            :readonly="!props.modifiable"
            :model-value="nomNaissance"
            :is-valid="nomNaissanceMeta.valid"
            :error-message="nomNaissanceErrorMessage"
            placeholder=""
            hint="Veuillez saisir votre nom de naissance. Exemple: Martin"
            @update:model-value="onNomNaissanceChange"
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
            :readonly="!props.modifiable"
            :model-value="prenom"
            :is-valid="prenomMeta.valid"
            :error-message="prenomErrorMessage"
            placeholder=""
            hint="Veuillez saisir votre prénom. Exemple: Jean"
            @update:model-value="onPrenomChange"
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <SearchAddress
            :initial-adress="props.initData.adresseDomicile?.label"
            :modifiable="props.modifiable"
            :error-message="adresseDomicileErrorMessage"
            :label="
              props.initData.adresseDomicile
                ? 'Nouvelle adresse de domicile'
                : 'Adresse du domicile'
            "
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div v-if="adresseIdentique === false" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <SearchAddress
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
    </fieldset>
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
import { IsDownloading } from "@vao/shared";

const log = logger("components/organisme/personne-physique");

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["update", "next"]);

const validationSchema = computed(() => {
  return yup.object(organisme.personnePhysiqueSchema);
});
const initialValues = {
  nomNaissance: props.initData.nomNaissance,
  nomUsage: props.initData.nomUsage,
  prenom: props.initData.prenom,
  profession: props.initData.profession,
  telephone: props.initData.telephone,
  adresseDomicile: props.initData.adresseDomicile ?? null,
  adresseIdentique: props.initData.adresseIdentique,
  adresseSiege: props.initData.adresseSiege ?? null,
};

const { meta, values } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: props.validateOnMount,
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
const {
  value: adresseDomicile,
  errorMessage: adresseDomicileErrorMessage,
  handleChange: onAddressDomicileChange,
} = useField("adresseDomicile");
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
