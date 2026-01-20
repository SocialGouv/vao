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
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanFinancierCommentaire"
          label="Ajouter un commentaire (optionnel)"
          :model-value="bilanFinancierCommentaire"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanFinancierCommentaireMeta.valid"
          :error-message="bilanFinancierCommentaireErrorMessage"
          @update:model-value="onBilanFinancierCommentaireChange"
        />
      </div>
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-6v">
    <UtilsMultiFilesUpload
      v-model="filesBilanFinancierQuatreAnnees"
      label="Ajouter des fichiers complémentaires (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";

const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const filesBilanFinancierQuatreAnnees = ref(
  props.initAgrement?.agrementFiles.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANFINANCIERQUATREANNEES,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  bilanFinancierComptabilite: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
  ),
  bilanFinancierComparatif: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
  ),
  bilanFinancierRessourcesHumaines: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
  ),
  bilanFinancierCommentaire: yup
    .string()
    .nullable()
    .when([], {
      is: (val: string | null) => val && val.length > 0,
      then: (schema) =>
        schema.min(20, "Merci de décrire au moins 20 caractères."),
      otherwise: (schema) => schema,
    }),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  bilanFinancierComptabilite:
    props.initAgrement.bilanFinancierComptabilite || "",
  bilanFinancierComparatif: props.initAgrement.bilanFinancierComparatif || "",
  bilanFinancierRessourcesHumaines:
    props.initAgrement.bilanFinancierRessourcesHumaines || "",
  bilanFinancierCommentaire: props.initAgrement.bilanFinancierCommentaire || "",
};

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
} = useField<string | null>("bilanFinancierComptabilite");

const {
  value: bilanFinancierComparatif,
  errorMessage: bilanFinancierComparatifErrorMessage,
  handleChange: onBilanFinancierComparatifChange,
  meta: bilanFinancierComparatifMeta,
} = useField<string | null>("bilanFinancierComparatif");

const {
  value: bilanFinancierRessourcesHumaines,
  errorMessage: bilanFinancierRessourcesHumainesErrorMessage,
  handleChange: onBilanFinancierRessourcesHumainesChange,
  meta: bilanFinancierRessourcesHumainesMeta,
} = useField<string | null>("bilanFinancierRessourcesHumaines");

const {
  value: bilanFinancierCommentaire,
  errorMessage: bilanFinancierCommentaireErrorMessage,
  handleChange: onBilanFinancierCommentaireChange,
  meta: bilanFinancierCommentaireMeta,
} = useField<string | null>("bilanFinancierCommentaire");

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  if (result) {
    return {
      ...result,
      ...(filesBilanFinancierQuatreAnnees.value.length > 0 && {
        filesBilanFinancierQuatreAnnees: filesBilanFinancierQuatreAnnees.value,
      }),
    };
  }
  return result;
};

defineExpose({
  validateForm,
});
</script>
