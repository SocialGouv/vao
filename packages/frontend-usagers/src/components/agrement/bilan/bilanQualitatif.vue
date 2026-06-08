<template>
  <div class="fr-mt-8v">
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
      <span class="fr-text--bold"
        >au choix une description texte et/ou un fichier joint</span
      >. L’un des deux est requis.
    </p>
    <div class="border fr-p-4v">
      <fieldset class="no-border">
        <legend class="fr-fieldset__legend fr-text--lead">
          Perception et ressenti des vacanciers sur les séjours réalisés
        </legend>
        <div class="fr-fieldset__element">
          <p
            id="bilanQualPerceptionSensibilite-desc"
            class="light-decisions-text-text-mention-grey"
          >
            Objectif : recueillir la perception globale du public accueilli
            (satisfaction, ressenti, difficultés rencontrées…). Le nombre de
            caractères est insuffisant.
          </p>
          <div class="fr-col-12">
            <DsfrInputGroup
              v-if="props.modifiable"
              name="bilanQualPerceptionSensibilite"
              hint="Minimum 20 caractères."
              :label="
                displayInput.AgrementBilanAnnuelInput[
                  'bilanQualPerceptionSensibilite'
                ].label
              "
              :model-value="bilanQualPerceptionSensibilite"
              :label-visible="true"
              :is-textarea="true"
              :is-valid="bilanQualPerceptionSensibiliteMeta.valid"
              :error-message="bilanQualPerceptionSensibiliteErrorMessage"
              aria-describedby="bilanQualPerceptionSensibilite-desc"
              @update:model-value="onBilanQualPerceptionSensibiliteChange"
            />
            <UtilsDisplayInput
              v-else
              :value="bilanQualPerceptionSensibilite"
              :input="
                displayInput.AgrementBilanAnnuelInput[
                  'bilanQualPerceptionSensibilite'
                ]
              "
              :is-valid="bilanQualPerceptionSensibiliteMeta.valid"
              :error-message="bilanQualPerceptionSensibiliteErrorMessage"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <UtilsMultiFilesUpload
            v-model="filesBilanQualitPerception"
            label="Ajouter des fichiers"
            hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
            :modifiable="props.modifiable"
          />
          <p v-if="filesBilanQualitPerceptionError" class="fr-error-text">
            {{ filesBilanQualitPerceptionError }}
          </p>
        </div>
      </fieldset>
    </div>
    <div class="border fr-p-4v fr-mt-6v">
      <fieldset class="no-border fr-p-4v">
        <legend class="fr-fieldset__legend fr-text--lead">
          Évolutions prévues des activités VAO et perspectives de développement
          à venir
        </legend>
        <div class="fr-fieldset__element">
          <p
            id="bilanQualPerspectiveEvol-desc"
            class="light-decisions-text-text-mention-grey"
          >
            Objectif : décrire les projets d’évolution de l’offre ou les
            ajustements envisagés à partir de l’expérience passée.
          </p>
          <div class="fr-col-12">
            <DsfrInputGroup
              v-if="props.modifiable"
              name="bilanQualPerspectiveEvol"
              hint="Minimum 20 caractères."
              :label="
                displayInput.AgrementBilanAnnuelInput[
                  'bilanQualPerspectiveEvol'
                ].label
              "
              :model-value="bilanQualPerspectiveEvol"
              :label-visible="true"
              :is-textarea="true"
              :is-valid="bilanQualPerspectiveEvolMeta.valid"
              :error-message="bilanQualPerspectiveEvolErrorMessage"
              aria-describedby="bilanQualPerspectiveEvol-desc"
              @update:model-value="onBilanQualPerspectiveEvolChange"
            />
            <UtilsDisplayInput
              v-else
              :value="bilanQualPerspectiveEvol"
              :input="
                displayInput.AgrementBilanAnnuelInput[
                  'bilanQualPerspectiveEvol'
                ]
              "
              :is-valid="bilanQualPerspectiveEvolMeta.valid"
              :error-message="bilanQualPerspectiveEvolErrorMessage"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <UtilsMultiFilesUpload
            v-model="filesBilanQualitPerspectives"
            label="Ajouter des fichiers"
            hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
            :modifiable="props.modifiable"
          />
          <p v-if="filesBilanQualitPerspectivesError" class="fr-error-text">
            {{ filesBilanQualitPerspectivesError }}
          </p>
        </div>
      </fieldset>
    </div>
    <div class="border fr-p-4v fr-mt-6v">
      <fieldset class="no-border fr-p-4v">
        <legend class="fr-fieldset__legend fr-text--lead">
          Eléments marquants autour des activités VAO
        </legend>
        <div class="fr-fieldset__element">
          <p
            id="bilanQualElementsMarquants-desc"
            class="light-decisions-text-text-mention-grey"
          >
            Objectif : mettre en avant les faits saillants, réussites,
            incidents, ou points d’attention de l’année.
          </p>
          <div class="fr-col-12">
            <DsfrInputGroup
              v-if="props.modifiable"
              name="bilanQualElementsMarquants"
              hint="Minimum 20 caractères."
              :label="
                displayInput.AgrementBilanAnnuelInput[
                  'bilanQualElementsMarquants'
                ].label
              "
              :model-value="bilanQualElementsMarquants"
              :label-visible="true"
              :is-textarea="true"
              :is-valid="bilanQualElementsMarquantsMeta.valid"
              :error-message="bilanQualElementsMarquantsErrorMessage"
              aria-describedby="bilanQualElementsMarquants-desc"
              @update:model-value="onBilanQualElementsMarquantsChange"
            />
            <UtilsDisplayInput
              v-else
              :value="bilanQualPerspectiveEvol"
              :input="
                displayInput.AgrementBilanAnnuelInput[
                  'bilanQualElementsMarquants'
                ]
              "
              :is-valid="bilanQualElementsMarquantsMeta.valid"
              :error-message="bilanQualElementsMarquantsErrorMessage"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <UtilsMultiFilesUpload
            v-model="filesBilanQualitElementsMarquants"
            label="Ajouter des fichiers complémentaires"
            hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
            :modifiable="props.modifiable"
          />
          <p
            v-if="filesBilanQualitElementsMarquantsError"
            class="fr-error-text"
          >
            {{ filesBilanQualitElementsMarquantsError }}
          </p>
        </div>
      </fieldset>
    </div>
    <div class="fr-fieldset__element fr-mt-6v">
      <UtilsMultiFilesUpload
        v-model="filesBilanQualitComplementaires"
        label="Ajouter des fichiers complémentaires (optionnel)"
        hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        :modifiable="props.modifiable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../../utils/display-input";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
});

const log = logger("components/agrement/bilan/bilanQualitatif");

const filesBilanQualitPerception = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITPERCEPTION,
  ) || [],
);
const filesBilanQualitPerspectives = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITPERSPECTIVE,
  ) || [],
);
const filesBilanQualitElementsMarquants = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITELEMARQ,
  ) || [],
);
const filesBilanQualitComplementaires = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITCOMPLEMENTAIRES,
  ) || [],
);

const filesBilanQualitPerceptionError = ref<string | null>(null);
const filesBilanQualitPerspectivesError = ref<string | null>(null);
const filesBilanQualitElementsMarquantsError = ref<string | null>(null);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  bilanQualPerceptionSensibilite: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez saisir une description pour la perception et le ressenti. Minimum 20 caractères.",
      ),
  ),
  bilanQualPerspectiveEvol: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez saisir une description pour les évolutions prévues des activités. Minimum 20 caractères.",
      ),
  ),
  bilanQualElementsMarquants: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez saisir une description pour les éléments marquants. Minimum 20 caractères.",
      ),
  ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  bilanQualPerceptionSensibilite:
    props.initAgrement.bilanQualPerceptionSensibilite || "",
  bilanQualPerspectiveEvol: props.initAgrement.bilanQualPerspectiveEvol || "",
  bilanQualElementsMarquants:
    props.initAgrement.bilanQualElementsMarquants || "",
};

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
} = useField<string | null>("bilanQualPerceptionSensibilite");

const {
  value: bilanQualPerspectiveEvol,
  errorMessage: bilanQualPerspectiveEvolErrorMessage,
  handleChange: onBilanQualPerspectiveEvolChange,
  meta: bilanQualPerspectiveEvolMeta,
} = useField<string | null>("bilanQualPerspectiveEvol");

const {
  value: bilanQualElementsMarquants,
  errorMessage: bilanQualElementsMarquantsErrorMessage,
  handleChange: onBilanQualElementsMarquantsChange,
  meta: bilanQualElementsMarquantsMeta,
} = useField<string | null>("bilanQualElementsMarquants");

const validateForm = async () => {
  const finalData = {
    valid: false,
    bilanQualPerceptionSensibilite: bilanQualPerceptionSensibilite.value,
    bilanQualPerspectiveEvol: bilanQualPerspectiveEvol.value,
    bilanQualElementsMarquants: bilanQualElementsMarquants.value,
    filesBilanQualitPerception: filesBilanQualitPerception.value,
    filesBilanQualitPerspectives: filesBilanQualitPerspectives.value,
    filesBilanQualitElementsMarquants: filesBilanQualitElementsMarquants.value,
    filesBilanQualitComplementaires: filesBilanQualitComplementaires.value,
  };

  filesBilanQualitPerceptionError.value = null;
  filesBilanQualitPerspectivesError.value = null;
  filesBilanQualitElementsMarquantsError.value = null;

  let filesAreValid = true;

  if (filesBilanQualitPerception.value.length === 0) {
    filesBilanQualitPerceptionError.value =
      "Veuillez ajouter au moins un fichier pour la partie perception et ressenti.";
    filesAreValid = false;
  }
  if (filesBilanQualitPerspectives.value.length === 0) {
    filesBilanQualitPerspectivesError.value =
      "Veuillez ajouter au moins un fichier pour la partie perspectives.";
    filesAreValid = false;
  }
  if (filesBilanQualitElementsMarquants.value.length === 0) {
    filesBilanQualitElementsMarquantsError.value =
      "Veuillez ajouter au moins un fichier pour la partie éléments marquants.";
    filesAreValid = false;
  }

  try {
    const result = await handleSubmit((values) => values)();

    if (result && filesAreValid) {
      finalData.bilanQualPerceptionSensibilite =
        result.bilanQualPerceptionSensibilite;
      finalData.bilanQualPerspectiveEvol = result.bilanQualPerspectiveEvol;
      finalData.bilanQualElementsMarquants = result.bilanQualElementsMarquants;
      finalData.valid = true;
    }
  } catch (error) {
    log.w("Erreur lors de la validation du formulaire :", error);
  }
  return finalData;
};

defineExpose({
  validateForm,
});
</script>
<style scoped>
fieldset.no-border {
  padding: 0;
}
legend {
  padding-left: 0;
}
</style>
