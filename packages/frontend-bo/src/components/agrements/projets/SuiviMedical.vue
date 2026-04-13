<template>
  <TitleWithIcon
    icon="fr-icon-capsule-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Suivi médical prévu
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.suiviMedDistribution"
        :input="
          AgrementDisplayInput.AgrementProjetsInput['suiviMedDistribution']
        "
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.suiviMedAccordSejour"
        :input="
          AgrementDisplayInput.AgrementProjetsInput['suiviMedAccordSejour']
        "
      />
    </div>
  </div>
  <div class="fr-fieldset__element">
    <MultiFilesUpload
      v-model="filesProjetsSejoursSuiviMed"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
      label="Ajouter des fichiers (optionnel)"
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
import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const filesProjetsSejoursSuiviMed = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSSUIVIMED,
  ) || [],
);
</script>
