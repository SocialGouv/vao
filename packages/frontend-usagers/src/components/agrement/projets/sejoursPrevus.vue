<template>
  <div>
    <TitleWithIcon
      icon="fr-icon-map-pin-2-fill"
      :level="3"
      title-class="fr-text--lead fr-mb-0"
    >
      Séjours prévus
    </TitleWithIcon>

    <div class="light-decisions-text-text-default-info fr-text--xs">
      <div class="flex">
        <span class="fr-icon-info-fill" aria-hidden="true"></span>
        <div>
          <p class="fr-mb-0">
            Ces informations sont recueillies à titre indicatif et n'ont pas de
            valeur contractuelles.
          </p>
          <p>
            Seuls les séjours accueillant plus de 3 vacanciers et ayant une
            durée supérieure à 5 jours doivent être déclarés dans ce formulaire.
          </p>
        </div>
      </div>
    </div>
    <AgrementProjetsListeSejours
      ref="listeSejoursRef"
      :agrement-id="props.initAgrement.id"
      :initial-sejours="props.initAgrement.agrementSejours || []"
      :modifiable="props.modifiable"
    />
    <div class="separator fr-my-4w"></div>
    <p><span class="fr-text--bold">Informations sur les vacanciers</span></p>
    <AgrementTypeDeficiences
      ref="typeDeficiencesRef"
      :type-deficiences="props.initAgrement.sejourTypeHandicap || []"
      :modifiable="props.modifiable"
      :statut="props.initAgrement.statut || AGREMENT_STATUT.BROUILLON"
    />
    <div class="separator fr-mb-6v"></div>
    <fieldset class="no-border">
      <legend class="fr-fieldset__legend fr-text--lg">
        Informations complémentaires
      </legend>
      <div class="fr-col-6 fr-mb-4v">
        <DsfrInput
          v-if="props.modifiable"
          name="sejourNbEnvisage"
          :label="displayInput.AgrementProjetsInput['sejourNbEnvisage'].label"
          type="number"
          :model-value="sejourNbEnvisage"
          :label-visible="true"
          :is-valid="sejourNbEnvisageMeta.valid"
          :error-message="sejourNbEnvisageErrorMessage"
          @update:model-value="onsejourNbEnvisageChange"
        />
        <UtilsDisplayInput
          v-else
          :value="sejourNbEnvisage"
          :input="displayInput.AgrementProjetsInput['sejourNbEnvisage']"
          :is-valid="sejourNbEnvisageMeta.valid"
          :error-message="sejourNbEnvisageErrorMessage"
        />
      </div>
      <DsfrInputGroup
        v-if="props.modifiable"
        name="sejourCommentaire"
        label="Ajouter un commentaire (optionnel)"
        :model-value="sejourCommentaire"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="commentaireMeta.valid"
        :error-message="commentaireErrorMessage"
        @update:model-value="onCommentaireChange"
      />
      <UtilsDisplayInput
        v-else
        :value="sejourCommentaire"
        :input="displayInput.AgrementProjetsInput['sejourCommentaire']"
        :is-valid="commentaireMeta.valid"
        :error-message="commentaireErrorMessage"
      />
      <div class="fr-fieldset__element">
        <UtilsMultiFilesUpload
          v-model="filesProjetsSejoursPrevus"
          hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
          label="Ajouter des fichiers (optionnel)"
          :modifiable="props.modifiable"
        />
      </div>
    </fieldset>
    <div class="fr-p-4v fr-mt-6v bg-light-blue">
      <p>
        <span class="fr-text--bold"
          >Veuillez trouver le modèle de questionnaire à adresser</span
        >
        préalablement à la tenue du séjour à la personne accueillie, ou à son
        représentant légal, afin de connaître ses besoins ou ses problèmes de
        santé
      </p>
      <UtilsDownloadFile
        label="questionnaire-vacanciers.pdf"
        file-size="286 Ko"
        filename="questionnaire-vacanciers.pdf"
        :url="urlPdfQuestionnaireVacanciers"
        :open-in-new-tab="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";
import {
  AGREMENT_STATUT,
  FILE_CATEGORY,
  type AgrementFilesDto,
} from "@vao/shared-bridge";
import { TitleWithIcon } from "@vao/shared-ui";
import { useForm, useField } from "vee-validate";
import { ref } from "vue";
import displayInput from "../../../utils/display-input";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const log = logger("components/agrement/projets/sejoursPrevus");

const config = useRuntimeConfig();

const typeDeficiencesRef = ref<any>(null);
const listeSejoursRef = ref<any>(null);

const filesProjetsSejoursPrevus = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSPREVUS,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  sejourNbEnvisage: yup
    .number()
    .typeError("Merci de saisir un nombre valide.")
    .min(0, "Le nombre de jours de vacances ne peut pas être négatif.")
    .nullable(),

  sejourCommentaire: yup
    .string()
    .max(1000, "Veuillez saisir un commentaire. Maximum 1000 caractères.")
    .nullable(),
});

const initialValues = {
  statut: props.initAgrement?.statut ?? AGREMENT_STATUT.BROUILLON,
  sejourNbEnvisage: props.initAgrement.statut
    ? props.initAgrement.sejourNbEnvisage
    : 0,
  sejourCommentaire: props.initAgrement.statut
    ? props.initAgrement.sejourCommentaire
    : "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: sejourNbEnvisage,
  errorMessage: sejourNbEnvisageErrorMessage,
  handleChange: onsejourNbEnvisageChange,
  meta: sejourNbEnvisageMeta,
} = useField<number>("sejourNbEnvisage");

const {
  value: sejourCommentaire,
  errorMessage: commentaireErrorMessage,
  handleChange: onCommentaireChange,
  meta: commentaireMeta,
} = useField<string>("sejourCommentaire");

const urlPdfQuestionnaireVacanciers = computed(() => {
  return new URL(
    "/documents/public/annexe-5-questionnaire-vacanciers.pdf",
    config.public.backendUrl,
  ).toString();
});

const validateForm = async () => {
  const finalData = {
    valid: false,
    sejourNbEnvisage: sejourNbEnvisage.value,
    sejourCommentaire: sejourCommentaire.value,
    agrementSejours: [],
    sejourTypeHandicap: null,
    filesProjetsSejoursPrevus: filesProjetsSejoursPrevus.value,
  };

  try {
    const sejoursData = await listeSejoursRef.value?.validateForm();
    const result = await handleSubmit((values) => values)();
    const typeDeficiencesValidation =
      await typeDeficiencesRef.value?.validateTypeDeficiences();

    if (sejoursData?.sejours) {
      finalData.agrementSejours = sejoursData.sejours;
    }

    if (typeDeficiencesValidation?.value !== undefined) {
      finalData.sejourTypeHandicap = typeDeficiencesValidation.value;
    }

    if (result) {
      finalData.sejourNbEnvisage = result.sejourNbEnvisage;
      finalData.sejourCommentaire = result.sejourCommentaire;
      finalData.valid = true;
    }
  } catch (error) {
    log.w("Erreur lors de la validation du formulaire sejoursPrevus :", error);
  }

  return finalData;
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
.bg-light-blue {
  background: rgba(227, 227, 253, 0.4);
}
.flex {
  display: flex;
  gap: 0.5rem;
}

fieldset.no-border {
  border: none;
  padding: 0;
}
legend {
  padding-left: 0;
}
</style>
