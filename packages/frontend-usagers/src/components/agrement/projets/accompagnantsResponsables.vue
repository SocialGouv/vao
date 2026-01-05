<template>
  <TitleWithIcon
    icon="fr-icon-team-fill"
    :level="2"
    title-class="fr-text--lead fr-mb-0"
  >
    Accompagnants et responsable prévus
  </TitleWithIcon>
  <div class="fr-col-6 fr-mb-4v">
    <DsfrInput
      name="accompRespNb"
      label="Nombre d’accompagnants prévus par lieu de vacances"
      type="number"
      :model-value="accompRespNb"
      :label-visible="true"
      :is-valid="accompRespNbMeta.valid"
      :error-message="accompRespNbErrorMessage"
      @update:model-value="onAccompRespNbChange"
    />
  </div>
  <p class="light-decisions-text-text-default-info fr-text--xs fr-mt-8v">
    <span class="fr-icon-info-fill" aria-hidden="true"></span>
    Pour chaque section, renseignez au choix une description texte et/ou un
    fichier joint. L’un des deux est requis.
  </p>
  <div class="border fr-p-4v">
    <h4 class="fr-text fr-text--lg">
      <strong>
        Compétences et expériences des accompagnants prévus par lieu de
        vacances, notamment pour ce qui concerne l’encadrement de certaines
        activités sportives. Ou expériences du responsable du déroulement du
        séjour sur le lieu de vacances.
      </strong>
    </h4>
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          name="accompRespCompExp"
          label="description"
          :model-value="accompRespCompExp"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="accompRespCompExpMeta.valid"
          :error-message="accompRespCompExpErrorMessage"
          @update:model-value="onAccompRespCompExpChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <UtilsMultiFilesUpload
        v-model="filesProjetsSejoursCompetencesExperience"
        label="Ajouter des fichiers"
      />
    </div>
  </div>
  <div class="border fr-p-4v fr-mt-6v">
    <h4 class="fr-text fr-text--lg">
      <strong>
        Mesures envisagées au cas où des accompagnants supplémentaires devraient
        être recrutés en urgence
      </strong>
    </h4>
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DsfrInputGroup
          name="accompRespRecruteUrg"
          label="description"
          :model-value="accompRespRecruteUrg"
          :label-visible="true"
          :is-textarea="true"
          :is-valid="accompRespRecruteUrgMeta.valid"
          :error-message="accompRespRecruteUrgErrorMessage"
          @update:model-value="onAccompRespRecruteUrgChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <UtilsMultiFilesUpload
        v-model="filesProjetsSejoursMesures"
        label="Ajouter des fichiers"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-6v">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursComplementaires"
      label="Ajouter des fichiers complémentaires (optionnel)"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { ref } from "vue";

const validationSchema = yup.object({
  accompRespNb: yup
    .number()
    .typeError("Merci de saisir un nombre valide.")
    .min(0, "Le nombre d'accompagnants ne peut pas être négatif.")
    .required("Ce champ est obligatoire."),
  accompRespCompExp: yup
    .string()
    .max(1000, "Le texte ne doit pas dépasser 1000 caractères.")
    .required("Ce champ est obligatoire."),
  accompRespRecruteUrg: yup
    .string()
    .max(1000, "Le texte ne doit pas dépasser 1000 caractères.")
    .required("Ce champ est obligatoire."),
});

const filesProjetsSejoursCompetencesExperience = ref([]);
const filesProjetsSejoursMesures = ref([]);
const filesProjetsSejoursComplementaires = ref([]);

const initialValues = {
  accompRespNb: 0,
  accompRespCompExp: "",
  accompRespRecruteUrg: "",
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
} = useField("accompRespNb");

const {
  value: accompRespCompExp,
  errorMessage: accompRespCompExpErrorMessage,
  handleChange: onAccompRespCompExpChange,
  meta: accompRespCompExpMeta,
} = useField("accompRespCompExp");

const {
  value: accompRespRecruteUrg,
  errorMessage: accompRespRecruteUrgErrorMessage,
  handleChange: onAccompRespRecruteUrgChange,
  meta: accompRespRecruteUrgMeta,
} = useField("accompRespRecruteUrg");

const validateForm = async () => {
  const formValid = true;

  try {
    // CORRECTION : handleSubmit retourne maintenant les valeurs actuelles
    const result = await handleSubmit((values) => {
      // Log des valeurs ACTUELLES du formulaire
      console.log("Valeurs du formulaire:", values);
      return values;
    })();

    if (!formValid) {
      console.error("Le formulaire n'est pas valide.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(filesProjetsSejoursCompetencesExperience.value.length > 0 && {
          filesProjetsSejoursCompetencesExperience:
            filesProjetsSejoursCompetencesExperience.value,
        }),
        ...(filesProjetsSejoursMesures.value.length > 0 && {
          filesProjetsSejoursMesures: filesProjetsSejoursMesures.value,
        }),
        ...(filesProjetsSejoursComplementaires.value.length > 0 && {
          filesProjetsSejoursComplementaires:
            filesProjetsSejoursComplementaires.value,
        }),
      };
      console.log("Données finales:", finalData);
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire :", error);
  }
};

defineExpose({
  validateForm,
});
</script>
