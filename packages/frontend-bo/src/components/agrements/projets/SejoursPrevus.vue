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
  <AgrementsProjetsListeSejours
    ref="listeSejoursRef"
    :agrement-id="props.initAgrement.id"
    :initial-sejours="props.initAgrement.agrementSejours || []"
  />
  <div class="fr-my-2w separator"></div>
  <p class="fr-text--bold">Informations sur les vacanciers</p>
  <AgrementsTypeDeficiences
    ref="typeDeficiencesRef"
    :type-deficiences="props.initAgrement.sejourTypeHandicap || []"
  />
  <div class="fr-my-2w separator"></div>
  <p class="fr-mb-1v fr-text--bold">Informations complémentaires</p>
  <div class="fr-col-6 fr-mb-4v">
    <DisplayInputCommon
      :value="props.initAgrement.sejourNbEnvisage"
      :input="AgrementDisplayInput.AgrementProjetsInput['sejourNbEnvisage']"
    />
  </div>
  <DisplayInputCommon
    :value="props.initAgrement.sejourCommentaire"
    :input="AgrementDisplayInput.AgrementProjetsInput['sejourCommentaire']"
  />
  <div class="fr-fieldset__element">
    <MultiFilesUpload
      v-model="filesProjetsSejoursPrevus"
      label="Ajouter des fichiers (optionnel)"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
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
import { FILE_CATEGORY, type AgrementFilesDto } from "@vao/shared-bridge";
import { ref } from "vue";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const typeDeficiencesRef = ref(null);
const listeSejoursRef = ref(null);

const filesProjetsSejoursPrevus = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSPREVUS,
  ) || [],
);
</script>

<style scoped>
.bg-light-blue {
  background: rgba(227, 227, 253, 0.4);
}
</style>
