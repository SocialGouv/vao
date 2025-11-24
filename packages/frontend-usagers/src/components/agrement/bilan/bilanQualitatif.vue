<template>
  <TitleWithIcon
    icon="fr-icon-edit-box-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Bilan qualitatif sur les 4 dernières années
  </TitleWithIcon>
  <p class="light-decisions-text-text-default-info fr-text--xs">
    <span class="fr-icon-info-fill" aria-hidden="true"></span>
    Pour chaque section, renseignez
    <strong>au choix une description texte et/ou un fichier joint</strong>. L’un
    des deux est requis.
  </p>
  <div class="border fr-p-4v">
    <h4 class="fr-text fr-text--lg">
      <strong>
        Perception et ressenti des vacanciers sur les séjours réalisés.
      </strong>
    </h4>
    <div class="fr-fieldset__element">
      <p
        id="bilanQualPerceptionSensibilite-desc"
        class="light-decisions-text-text-mention-grey"
      >
        Objectif : recueillir la perception globale du public accueilli
        (satisfaction, ressenti, difficultés rencontrées…)
      </p>
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanQualPerceptionSensibilite"
          label="description"
          :model-value="bilanQualPerceptionSensibilite"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanQualPerceptionSensibiliteMeta.valid"
          :error-message="bilanQualPerceptionSensibiliteErrorMessage"
          aria-describedby="bilanQualPerceptionSensibilite-desc"
          @update:model-value="onBilanQualPerceptionSensibiliteChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <DsfrFileUpload
        v-model="fileBilanQualPerceptionSensibilite"
        label="Ajouter des fichiers"
        :modifiable="true"
      />
    </div>
  </div>
  <div class="border fr-p-4v fr-mt-6v">
    <h4 class="fr-text fr-text--lg">
      <strong
        >Évolutions prévues des activités VAO et perspectives de développement à
        venir</strong
      >
    </h4>
    <div class="fr-fieldset__element">
      <p
        id="bilanQualPerspectiveEvol-desc"
        class="light-decisions-text-text-mention-grey"
      >
        Objectif : décrire les projets d’évolution de l’offre ou les ajustements
        envisagés à partir de l’expérience passée.
      </p>
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanQualPerspectiveEvol"
          label="description"
          :model-value="bilanQualPerspectiveEvol"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanQualPerspectiveEvolMeta.valid"
          :error-message="bilanQualPerspectiveEvolErrorMessage"
          aria-describedby="bilanQualPerspectiveEvol-desc"
          @update:model-value="onBilanQualPerspectiveEvolChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <DsfrFileUpload
        v-model="fileBilanQualPerspectiveEvol"
        label="Ajouter des fichiers"
        :modifiable="true"
      />
    </div>
  </div>
  <div class="border fr-p-4v fr-mt-6v">
    <h4 class="fr-text fr-text--lg">
      <strong>Eléments marquants autour des activités VAO</strong>
    </h4>
    <div class="fr-fieldset__element">
      <p
        id="bilanQualElementsMarquants-desc"
        class="light-decisions-text-text-mention-grey"
      >
        Objectif : mettre en avant les faits saillants, réussites, incidents, ou
        points d’attention de l’année.
      </p>
      <div class="fr-col-12">
        <DsfrInputGroup
          name="bilanQualElementsMarquants"
          label="description"
          :model-value="bilanQualElementsMarquants"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="bilanQualElementsMarquantsMeta.valid"
          :error-message="bilanQualElementsMarquantsErrorMessage"
          aria-describedby="bilanQualElementsMarquants-desc"
          @update:model-value="onBilanQualElementsMarquantsChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <DsfrFileUpload
        v-model="fileBilanQualElementsMarquants"
        label="Ajouter des fichiers"
        :modifiable="true"
      />
    </div>
  </div>
  <hr class="fr-mt-4w" />
  <div class="fr-fieldset__element">
    <DsfrFileUpload
      v-model="fileBilanQualFichiersComplementaires"
      label="Ajouter des fichiers complémentaires (optionnel)"
      :modifiable="true"
    />
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

const fileBilanQualPerceptionSensibilite = ref([]);
const fileBilanQualPerspectiveEvol = ref([]);
const fileBilanQualElementsMarquants = ref([]);
const fileBilanQualFichiersComplementaires = ref([]);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  bilanQualPerceptionSensibilite: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
  bilanQualPerspectiveEvol: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
  bilanQualElementsMarquants: yup
    .string()
    .min(20, "Merci de décrire au moins 20 caractères.")
    .nullable(),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  bilanQualPerceptionSensibilite:
    props.initAgrement.bilan?.bilanQualPerceptionSensibilite || "",
};

// const { handleSubmit, meta } = useForm({
const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: bilanQualPerceptionSensibilite,
  errorMessage: bilanQualPerceptionSensibiliteErrorMessage,
  handleChange: onBilanQualPerceptionSensibiliteChange,
  meta: bilanQualPerceptionSensibiliteMeta,
} = useField("bilanQualPerceptionSensibilite");

const {
  value: bilanQualPerspectiveEvol,
  errorMessage: bilanQualPerspectiveEvolErrorMessage,
  handleChange: onBilanQualPerspectiveEvolChange,
  meta: bilanQualPerspectiveEvolMeta,
} = useField("bilanQualPerspectiveEvol");

const {
  value: bilanQualElementsMarquants,
  errorMessage: bilanQualElementsMarquantsErrorMessage,
  handleChange: onBilanQualElementsMarquantsChange,
  meta: bilanQualElementsMarquantsMeta,
} = useField("bilanQualElementsMarquants");

const validateForm = async () => {
  const result = await handleSubmit((values) => values)();
  if (result) {
    return {
      ...result,
      ...(fileBilanQualPerceptionSensibilite.value.length > 0 && {
        fileBilanQualPerceptionSensibilite:
          fileBilanQualPerceptionSensibilite.value,
      }),
      ...(fileBilanQualPerspectiveEvol.value.length > 0 && {
        fileBilanQualPerspectiveEvol: fileBilanQualPerspectiveEvol.value,
      }),
      ...(fileBilanQualElementsMarquants.value.length > 0 && {
        fileBilanQualElementsMarquants: fileBilanQualElementsMarquants.value,
      }),
      ...(fileBilanQualFichiersComplementaires.value.length > 0 && {
        fileBilanQualFichiersComplementaires:
          fileBilanQualFichiersComplementaires.value,
      }),
    };
  }
  return result;
};

defineExpose({
  validateForm,
  // isValid: () => meta.value.valid, // Optionnel : pour vérifier la validité
});
</script>
