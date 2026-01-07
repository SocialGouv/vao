<template>
  <TitleWithIcon
    icon="fr-icon-map-pin-2-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Séjours prévus
  </TitleWithIcon>
  <p class="light-decisions-text-text-default-info fr-text--xs">
    <span class="fr-icon-info-fill" aria-hidden="true"></span>
    Ces informations sont recueillies à titre indicatif et n'ont pas de valeur
    contractuelles. <br />
    <span class="fr-ml-6v"
      >Seuls les séjours accueillant plus de 3 vacanciers et ayant une durée
      supérieure à 5 jours doivent être déclarés dans ce formulaire.</span
    >
  </p>
  <AgrementProjetsListeSejours ref="listeSejoursRef" />
  <hr />
  <p><b>Informations sur les vacanciers</b></p>
  <AgrementTypeDeficiences ref="typeDeficiencesRef" />
  <hr />
  <p class="fr-mb-1v"><b>Informations complémentaires</b></p>
  <div class="fr-col-6 fr-mb-4v">
    <DsfrInput
      name="sejourNbEnvisage"
      label="Nombre de séjours envisagés l'année suivante (optionnel)"
      type="number"
      :model-value="sejourNbEnvisage"
      :label-visible="true"
      :is-valid="sejourNbEnvisageMeta.valid"
      :error-message="sejourNbEnvisageErrorMessage"
      @update:model-value="onsejourNbEnvisageChange"
    />
  </div>
  <DsfrInputGroup
    name="sejourCommentaire"
    label="Ajouter un commentaire (optionnel)"
    :model-value="sejourCommentaire"
    :label-visible="true"
    :is-textarea="true"
    :is-valid="commentaireMeta.valid"
    :error-message="commentaireErrorMessage"
    @update:model-value="onCommentaireChange"
  />
  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursPrevus"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
  <div class="fr-p-4v fr-mt-6v bg-light-blue">
    <p>
      <b>Veuillez trouver le modèle de questionnaire à adresser</b>
      préalablement à la tenue du séjour à la personne accueillie, ou à son
      représentant légal, afin de connaître ses besoins ou ses problèmes de
      santé
    </p>
    <DsfrFileDownload
      format="pdf"
      size="61.88 Ko"
      :href="`${config.public.backendUrl}/documents/public/annexe-5-questionaire-vacanciers.pdf`"
      download=""
      title="questionnaire-vacanciers.pdf"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { useForm, useField } from "vee-validate";
import { ref } from "vue";

//ajouter props init

const config = useRuntimeConfig();

const typeDeficiencesRef = ref(null);
const listeSejoursRef = ref(null);

// todo: gerer file
// const filesMotivation = ref(
//   props.initAgrement?.agrementFiles.filter(
//     (file) => file.category === FILE_CATEGORY.SEJOUR,
//   ) || [],
// );

const filesProjetsSejoursPrevus = ref([]);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  sejourNbEnvisage: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre de jours de vacances ne peut pas être négatif.")
      .required("Ce champ est obligatoire."),
  ),
  sejourCommentaire: yup
    .string()
    .max(1000, "Le commentaire ne doit pas dépasser 1000 caractères.")
    .nullable(),
});

const initialValues = {
  statut: AGREMENT_STATUT.BROUILLON,
  sejourNbEnvisage: 0,
  sejourCommentaire: "",
};

// CORRECTION PRINCIPALE : Récupérer `values` de useForm
const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

// Définir les champs APRÈS useForm
const {
  value: sejourNbEnvisage,
  errorMessage: sejourNbEnvisageErrorMessage,
  handleChange: onsejourNbEnvisageChange,
  meta: sejourNbEnvisageMeta,
} = useField("sejourNbEnvisage");

const {
  value: sejourCommentaire,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
  meta: commentaireMeta,
} = useField("sejourCommentaire");

const validateForm = async () => {
  let formValid = true;

  try {
    // Appeler la méthode validateForm du composant enfant
    const sejoursData = await listeSejoursRef.value?.validateForm();

    // CORRECTION : handleSubmit retourne maintenant les valeurs actuelles
    const result = await handleSubmit((values) => {
      // Log des valeurs ACTUELLES du formulaire
      console.log("Valeurs du formulaire:", values);
      return values;
    })();

    // Validation du type de déficiences
    const typeDeficiencesValidation =
      await typeDeficiencesRef.value?.validateTypeDeficiences();

    if (!typeDeficiencesValidation?.valid) {
      console.error("Le type de déficiences n'est pas valide.");
      formValid = false;
    }

    if (!formValid) {
      console.error("Le formulaire n'est pas valide.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        sejours: sejoursData?.sejours || [],
        typeDeficiences: typeDeficiencesValidation.value,
        ...(filesProjetsSejoursPrevus.value.length > 0 && {
          filesProjetsSejoursPrevus: filesProjetsSejoursPrevus.value,
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

<style scoped>
.bg-light-blue {
  background: rgba(227, 227, 253, 0.4);
}
</style>
