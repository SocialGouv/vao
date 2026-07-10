<template>
  <TitleWithIcon
    icon="fr-icon-team-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Accompagnants et responsable prévus
  </TitleWithIcon>
  <div class="fr-col-6 fr-mb-4v">
    <DsfrInput
      v-if="props.modifiable"
      name="accompRespNb"
      :label="displayInput.AgrementProjetsInput['accompRespNb'].label"
      type="number"
      :model-value="accompRespNb"
      :label-visible="true"
      :is-valid="accompRespNbMeta.valid"
      :error-message="accompRespNbErrorMessage"
      @update:model-value="onAccompRespNbChange"
    />
    <UtilsDisplayInput
      v-else
      :value="accompRespNb"
      :input="displayInput.AgrementProjetsInput['accompRespNb']"
      :is-valid="accompRespNbMeta.valid"
      :error-message="accompRespNbErrorMessage"
    />
  </div>
  <p class="light-decisions-text-text-default-info fr-text--xs fr-mt-8v">
    <span class="fr-icon-info-fill" aria-hidden="true"></span>
    Pour chaque section, renseignez au choix une description texte et/ou un
    fichier joint. L’un des deux est requis.
  </p>
  <div class="border fr-p-4v">
    <fieldset class="no-border">
      <legend class="fr-fieldset__legend fr-text--lead">
        Compétences et expériences des accompagnants prévus par lieu de
        vacances, notamment pour ce qui concerne l’encadrement de certaines
        activités sportives. Ou expériences du responsable du déroulement du
        séjour sur le lieu de vacances.
      </legend>

      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <DsfrInputGroup
            v-if="props.modifiable"
            name="accompRespCompExp"
            label="Description"
            hint="Minimum 20 caractères."
            :model-value="accompRespCompExp"
            :label-visible="true"
            :is-textarea="true"
            :is-valid="accompRespCompExpMeta.valid"
            :error-message="accompRespCompExpErrorMessage"
            @update:model-value="onAccompRespCompExpChange"
          />
          <UtilsDisplayInput
            v-else
            :value="accompRespCompExp"
            :input="displayInput.AgrementProjetsInput['accompRespCompExp']"
            :is-valid="accompRespCompExpMeta.valid"
            :error-message="accompRespCompExpErrorMessage"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <UtilsMultiFilesUpload
          v-model="filesProjetsSejoursCompetencesExperience"
          hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
          :modifiable="props.modifiable"
          label="Ajouter des fichiers"
        />
        <p
          v-if="filesProjetsSejoursCompetencesExperienceError"
          class="fr-error-text"
        >
          {{ filesProjetsSejoursCompetencesExperienceError }}
        </p>
      </div>
    </fieldset>
  </div>
  <div class="border fr-p-4v fr-mt-6v">
    <fieldset class="no-border">
      <legend class="fr-fieldset__legend fr-text--lead">
        Mesures envisagées au cas où des accompagnants supplémentaires devraient
        être recrutés en urgence
      </legend>

      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <DsfrInputGroup
            v-if="props.modifiable"
            name="accompRespRecruteUrg"
            hint="Minimum 20 caractères."
            :label="
              displayInput.AgrementProjetsInput['accompRespRecruteUrg'].label
            "
            :model-value="accompRespRecruteUrg"
            :label-visible="true"
            :is-textarea="true"
            :is-valid="accompRespRecruteUrgMeta.valid"
            :error-message="accompRespRecruteUrgErrorMessage"
            @update:model-value="onAccompRespRecruteUrgChange"
          />
          <UtilsDisplayInput
            v-else
            :value="accompRespRecruteUrg"
            :input="displayInput.AgrementProjetsInput['accompRespRecruteUrg']"
            :is-valid="accompRespRecruteUrgMeta.valid"
            :error-message="accompRespRecruteUrgErrorMessage"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <UtilsMultiFilesUpload
          v-model="filesProjetsSejoursMesures"
          :modifiable="props.modifiable"
          label="Ajouter des fichiers"
          hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        />
        <p v-if="filesProjetsSejoursMesuresError" class="fr-error-text">
          {{ filesProjetsSejoursMesuresError }}
        </p>
      </div>
    </fieldset>
  </div>
  <!-- <div class="fr-fieldset__element fr-mt-6v">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursComplementaires"
      :modifiable="props.modifiable"
      label="Ajouter des fichiers complémentaires (optionnel)"
    />
  </div> -->
</template>

<script setup lang="ts">
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { ref } from "vue";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../../utils/display-input";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const log = logger("components/agrement/projets/accompagnantsResponsables");

const validationSchema = yup.object({
  accompRespNb: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre d'accompagnants ne peut pas être négatif."),
  ),
  accompRespCompExp: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez saisir une description pour les compétences et expériences des accompagnants. Minimum 20 caractères.",
      )
      .nullable(),
  ),
  accompRespRecruteUrg: requiredUnlessBrouillon(
    yup
      .string()
      .min(
        20,
        "Veuillez saisir une description pour les mesures envisagées au cas où des accompagnants supplémentaires devraient être recrutés en urgence. Minimum 20 caractères.",
      )
      .nullable(),
  ),
});

const filesProjetsSejoursCompetencesExperience = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSCOMPETENCESEXPERIENCE,
  ) || [],
);
const filesProjetsSejoursMesures = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSMESURES,
  ) || [],
);
const filesProjetsSejoursComplementaires = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSCOMPLEMENTAIRES,
  ) || [],
);

const filesProjetsSejoursCompetencesExperienceError = ref<string | null>(null);
const filesProjetsSejoursMesuresError = ref<string | null>(null);

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  accompRespNb: props.initAgrement.accompRespNb || 0,
  accompRespCompExp: props.initAgrement.accompRespCompExp || "",
  accompRespRecruteUrg: props.initAgrement.accompRespRecruteUrg || "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: accompRespNb,
  errorMessage: accompRespNbErrorMessage,
  handleChange: onAccompRespNbChange,
  meta: accompRespNbMeta,
} = useField<number>("accompRespNb");

const {
  value: accompRespCompExp,
  errorMessage: accompRespCompExpErrorMessage,
  handleChange: onAccompRespCompExpChange,
  meta: accompRespCompExpMeta,
} = useField<string>("accompRespCompExp");

const {
  value: accompRespRecruteUrg,
  errorMessage: accompRespRecruteUrgErrorMessage,
  handleChange: onAccompRespRecruteUrgChange,
  meta: accompRespRecruteUrgMeta,
} = useField<string>("accompRespRecruteUrg");

const validateForm = async () => {
  const finalData = {
    valid: false,
    accompRespNb: accompRespNb.value,
    accompRespCompExp: accompRespCompExp.value || null,
    accompRespRecruteUrg: accompRespRecruteUrg.value || null,
    filesProjetsSejoursCompetencesExperience:
      filesProjetsSejoursCompetencesExperience.value,
    filesProjetsSejoursMesures: filesProjetsSejoursMesures.value,
    filesProjetsSejoursComplementaires:
      filesProjetsSejoursComplementaires.value,
  };

  filesProjetsSejoursCompetencesExperienceError.value = null;
  filesProjetsSejoursMesuresError.value = null;

  let filesAreValid = true;

  if (filesProjetsSejoursCompetencesExperience.value.length === 0) {
    filesProjetsSejoursCompetencesExperienceError.value =
      "Veuillez ajouter au moins un fichier pour la partie compétences et expériences des accompagnants.";
    filesAreValid = false;
  }

  if (filesProjetsSejoursMesures.value.length === 0) {
    filesProjetsSejoursMesuresError.value =
      "Veuillez ajouter au moins un fichier pour la partie mesures envisagées en cas de recrutement d'accompagnants supplémentaires en urgence.";
    filesAreValid = false;
  }

  try {
    const result = await handleSubmit((values) => values)();

    if (result && filesAreValid) {
      finalData.accompRespNb = result.accompRespNb;
      finalData.accompRespCompExp = result.accompRespCompExp || null;
      finalData.accompRespRecruteUrg = result.accompRespRecruteUrg || null;
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
