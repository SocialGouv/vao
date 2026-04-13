<template>
  <TitleWithIcon
    icon="fr-icon-edit-box-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Bilan qualitatif sur les 4 dernières années
  </TitleWithIcon>
  <div class="border fr-p-4v">
    <h4 class="fr-text fr-text--lg fr-text--bold">
      Perception et ressenti des vacanciers sur les séjours réalisés.
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
        <DisplayInputCommon
          :value="props.initAgrement?.bilanQualPerceptionSensibilite"
          :input="
            AgrementDisplayInput.AgrementBilanAnnuelInput[
              'bilanQualPerceptionSensibilite'
            ]
          "
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <MultiFilesUpload
        v-model="filesBilanQualitPerception"
        label="Ajouter des fichiers"
        :modifiable="false"
        :cdn-url="props.cdnUrl"
      />
    </div>
  </div>
  <div class="border fr-p-4v fr-mt-6v">
    <h4 class="fr-text fr-text--lg fr-text--bold">
      Évolutions prévues des activités VAO et perspectives de développement à
      venir
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
        <DisplayInputCommon
          :value="props.initAgrement?.bilanQualPerspectiveEvol"
          :input="
            AgrementDisplayInput.AgrementBilanAnnuelInput[
              'bilanQualPerspectiveEvol'
            ]
          "
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <MultiFilesUpload
        v-model="filesBilanQualitPerspectives"
        label="Ajouter des fichiers"
        :modifiable="false"
        :cdn-url="props.cdnUrl"
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
        <DisplayInputCommon
          :value="props.initAgrement?.bilanQualElementsMarquants"
          :input="
            AgrementDisplayInput.AgrementBilanAnnuelInput[
              'bilanQualElementsMarquants'
            ]
          "
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <MultiFilesUpload
        v-model="filesBilanQualitElementsMarquants"
        label="Ajouter des fichiers complémentaires"
        :modifiable="false"
        :cdn-url="props.cdnUrl"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-6v">
    <MultiFilesUpload
      v-model="filesBilanQualitComplementaires"
      label="Ajouter des fichiers complémentaires (optionnel)"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { FILE_CATEGORY, getFilesByCategory } from "@vao/shared-bridge";
import {
  TitleWithIcon,
  AgrementDisplayInput,
  DisplayInputCommon,
  MultiFilesUpload,
} from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
});

const filesBilanQualitPerception = computed(() =>
  getFilesByCategory({
    files: props.initAgrement?.agrementFiles,
    category: FILE_CATEGORY.BILANQUALITPERCEPTION,
  }),
);

const filesBilanQualitPerspectives = computed(() =>
  getFilesByCategory({
    files: props.initAgrement?.agrementFiles,
    category: FILE_CATEGORY.BILANQUALITPERSPECTIVE,
  }),
);
const filesBilanQualitElementsMarquants = computed(() =>
  getFilesByCategory({
    files: props.initAgrement?.agrementFiles,
    category: FILE_CATEGORY.BILANQUALITELEMARQ,
  }),
);
const filesBilanQualitComplementaires = computed(() =>
  getFilesByCategory({
    files: props.initAgrement?.agrementFiles,
    category: FILE_CATEGORY.BILANQUALITCOMPLEMENTAIRES,
  }),
);
</script>
