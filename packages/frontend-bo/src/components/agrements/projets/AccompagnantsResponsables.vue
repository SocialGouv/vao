<template>
  <TitleWithIcon
    icon="fr-icon-team-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Accompagnants et responsable prévus
  </TitleWithIcon>
  <div class="fr-col-6 fr-mb-4v">
    <DisplayInputCommon
      :value="props.initAgrement.accompRespNb"
      :input="AgrementDisplayInput.AgrementProjetsInput['accompRespNb']"
    />
  </div>
  <div class="border fr-p-4v">
    <div class="fr-my-2w fr-text--lg fr-text--bold">
      Compétences et expériences des accompagnants prévus par lieu de vacances,
      notamment pour ce qui concerne l’encadrement de certaines activités
      sportives. Ou expériences du responsable du déroulement du séjour sur le
      lieu de vacances.
    </div>
    <div class="fr-my-2w">
      <div class="fr-col-12">
        <DisplayInputCommon
          :value="props.initAgrement.accompRespCompExp"
          :input="
            AgrementDisplayInput.AgrementProjetsInput['accompRespCompExp']
          "
        />
      </div>
    </div>
    <div class="fr-my-2w">
      <MultiFilesUpload
        v-model="filesProjetsSejoursCompetencesExperience"
        :modifiable="false"
        :cdn-url="props.cdnUrl"
        label="Ajouter des fichiers"
      />
    </div>
  </div>
  <div class="border fr-p-4v fr-mt-6v">
    <div class="fr-fr-my-2w fr-text--lg fr-text--bold">
      Mesures envisagées au cas où des accompagnants supplémentaires devraient
      être recrutés en urgence
    </div>
    <div class="fr-fr-my-2w">
      <DisplayInputCommon
        :value="props.initAgrement.accompRespRecruteUrg"
        :input="
          AgrementDisplayInput.AgrementProjetsInput['accompRespRecruteUrg']
        "
      />
    </div>
    <MultiFilesUpload
      v-model="filesProjetsSejoursMesures"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
      label="Ajouter des fichiers"
    />
  </div>
  <MultiFilesUpload
    v-model="filesProjetsSejoursComplementaires"
    :modifiable="false"
    :cdn-url="props.cdnUrl"
    label="Ajouter des fichiers complémentaires (optionnel)"
  />
</template>

<script setup lang="ts">
import {
  TitleWithIcon,
  MultiFilesUpload,
  DisplayInputCommon,
  AgrementDisplayInput,
} from "@vao/shared-ui";
import { ref } from "vue";
import { FILE_CATEGORY, getFilesByCategory } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesProjetsSejoursCompetencesExperience = ref(
  getFilesByCategory({
    category: FILE_CATEGORY.PROJETSSEJOURSCOMPETENCESEXPERIENCE,
    files: props.initAgrement?.agrementFiles,
  }),
);
const filesProjetsSejoursMesures = ref(
  getFilesByCategory({
    category: FILE_CATEGORY.PROJETSSEJOURSMESURES,
    files: props.initAgrement?.agrementFiles,
  }),
);
const filesProjetsSejoursComplementaires = ref(
  getFilesByCategory({
    category: FILE_CATEGORY.PROJETSSEJOURSCOMPLEMENTAIRES,
    files: props.initAgrement?.agrementFiles,
  }),
);
</script>
