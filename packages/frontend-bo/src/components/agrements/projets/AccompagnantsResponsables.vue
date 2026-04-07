<template>
  <TitleWithIcon
    icon="fr-icon-team-fill"
    :level="2"
    title-class="fr-text--lead fr-mb-0"
  >
    Accompagnants et responsable prévus
  </TitleWithIcon>
  <div class="fr-col-6 fr-mb-4v">
    <DisplayInputCommon
      :value="props.initAgrement.accompRespNb"
      :input="AgrementDisplayInput.IAgrementProjets['accompRespNb']"
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
        <DisplayInputCommon
          :value="props.initAgrement.accompRespCompExp"
          :input="AgrementDisplayInput.IAgrementProjets['accompRespCompExp']"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <MultiFilesUpload
        v-model="filesProjetsSejoursCompetencesExperience"
        :modifiable="false"
        :cdn-url="props.cdnUrl"
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
        <DisplayInputCommon
          :value="props.initAgrement.accompRespRecruteUrg"
          :input="AgrementDisplayInput.IAgrementProjets['accompRespRecruteUrg']"
        />
      </div>
    </div>
    <div class="fr-fieldset__element">
      <MultiFilesUpload
        v-model="filesProjetsSejoursMesures"
        :modifiable="false"
        :cdn-url="props.cdnUrl"
        label="Ajouter des fichiers"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-6v">
    <MultiFilesUpload
      v-model="filesProjetsSejoursComplementaires"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
      label="Ajouter des fichiers complémentaires (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  TitleWithIcon,
  MultiFilesUpload,
  DisplayInputCommon,
  AgrementDisplayInput,
} from "@vao/shared-ui";
import { ref } from "vue";
import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
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
</script>
