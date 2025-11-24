<template>
  <TitleWithIcon
    icon="fr-icon-bank-card-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Bilan financier sur les 4 dernières années
  </TitleWithIcon>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanFinancierComptabilite"
          label="Comptabilité analytique de l’activité"
          hint="Détaillez les dépenses et recettes rattachées spécifiquement à l’activité concernée, en précisant les postes budgétaires si possible."
          :model-value="bilanFinancierComptabilite"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanFinancierComptabiliteMeta.valid"
          :error-message="bilanFinancierComptabiliteErrorMessage"
          @update:model-value="onBilanFinancierComptabiliteChange"
        />
      </div>
    </div>
  </div>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanFinancierComparatif"
          label="Comparatif entre les périodes N et N-1"
          hint="Présentez les principales évolutions financières entre l’année en cours (N) et l’année précédente (N-1) : écarts, tendances ou variations significatives."
          :model-value="bilanFinancierComparatif"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanFinancierComparatifMeta.valid"
          :error-message="bilanFinancierComparatifErrorMessage"
          @update:model-value="onBilanFinancierComparatifChange"
        />
      </div>
    </div>
  </div>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanFinancierRessourcesHumaines"
          label="Ressources humaines mobilisées et montants financiers engagés pour l’action"
          hint="Indiquez le nombre de personnes impliquées (en ETP), leurs fonctions et compétences principales, ainsi que les coûts salariaux, dépenses de fonctionnement ou autres coûts associés à leur mobilisation."
          :model-value="bilanFinancierRessourcesHumaines"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanFinancierRessourcesHumainesMeta.valid"
          :error-message="bilanFinancierRessourcesHumainesErrorMessage"
          @update:model-value="onBilanFinancierRessourcesHumainesChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  bilanFinancierComptabilite: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
  bilanFinancierComparatif: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
  bilanFinancierRessourcesHumaines: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
};

// const { handleSubmit, meta } = useForm({
const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: bilanFinancierComptabilite,
  errorMessage: bilanFinancierComptabiliteErrorMessage,
  handleChange: onBilanFinancierComptabiliteChange,
  meta: bilanFinancierComptabiliteMeta,
} = useField("bilanFinancierComptabilite");

const {
  value: bilanFinancierComparatif,
  errorMessage: bilanFinancierComparatifErrorMessage,
  handleChange: onBilanFinancierComparatifChange,
  meta: bilanFinancierComparatifMeta,
} = useField("bilanFinancierComparatif");

const {
  value: bilanFinancierRessourcesHumaines,
  errorMessage: bilanFinancierRessourcesHumainesErrorMessage,
  handleChange: onBilanFinancierRessourcesHumainesChange,
  meta: bilanFinancierRessourcesHumainesMeta,
} = useField("bilanFinancierRessourcesHumaines");
const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  return result;
};

defineExpose({
  validateForm,
  // isValid: () => meta.value.valid, // Optionnel : pour vérifier la validité
});
</script>
