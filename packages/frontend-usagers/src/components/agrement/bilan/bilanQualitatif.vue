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
          label="Description"
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
      <UtilsMultiFilesUpload
        v-model="filesBilanQualitPerception"
        label="Ajouter des fichiers"
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
      <UtilsMultiFilesUpload
        v-model="filesBilanQualitPerspectives"
        label="Ajouter des fichiers"
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
      <UtilsMultiFilesUpload
        v-model="filesBilanQualitElementsMarquants"
        label="Ajouter des fichiers complémentaires"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-6v">
    <UtilsMultiFilesUpload
      v-model="filesBilanQualitComplementaires"
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
  cdnUrl: { type: String, required: true },
});

const filesBilanQualitPerception = ref(
  props.initAgrement?.agrementFiles.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITPERCEPTION,
  ) || [],
);
const filesBilanQualitPerspectives = ref(
  props.initAgrement?.agrementFiles.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITPERSPECTIVE,
  ) || [],
);
const filesBilanQualitElementsMarquants = ref(
  props.initAgrement?.agrementFiles.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITELEMARQ,
  ) || [],
);
const filesBilanQualitComplementaires = ref(
  props.initAgrement?.agrementFiles.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANQUALITCOMPLEMENTAIRES,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  bilanQualPerceptionSensibilite: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
  ),
  bilanQualPerspectiveEvol: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
  ),
  bilanQualElementsMarquants: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères."),
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
  const result = await handleSubmit((values) => values)();
  if (result) {
    return {
      ...result,
      ...(filesBilanQualitPerception.value.length > 0 && {
        filesBilanQualitPerception: filesBilanQualitPerception.value,
      }),
      ...(filesBilanQualitPerspectives.value.length > 0 && {
        filesBilanQualitPerspectives: filesBilanQualitPerspectives.value,
      }),
      ...(filesBilanQualitElementsMarquants.value.length > 0 && {
        filesBilanQualitElementsMarquants:
          filesBilanQualitElementsMarquants.value,
      }),
      ...(filesBilanQualitComplementaires.value.length > 0 && {
        filesBilanQualitComplementaires: filesBilanQualitComplementaires.value,
      }),
    };
  }
  return result;
};

defineExpose({
  validateForm,
});
</script>
