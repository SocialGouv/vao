<template>
  <TitleWithIcon
    icon="fr-icon-bus-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Organisation des transports prévus
  </TitleWithIcon>

  <div class="fr-col-12">
    <DisplayInputCommon
      :value="props.initAgrement?.transportAllerRetour"
      :input="AgrementDisplayInput.AgrementProjetsInput['transportAllerRetour']"
    />
  </div>
  <div class="fr-col-12 fr-mt-6v">
    <DisplayInputCommon
      :value="props.initAgrement?.transportSejour"
      :input="AgrementDisplayInput.AgrementProjetsInput['transportSejour']"
    />
  </div>

  <div class="fr-fieldset__element fr-mt-6v">
    <MultiFilesUpload
      v-model="filesProjetsSejoursOrgaTransports"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AgrementDisplayInput,
  TitleWithIcon,
  MultiFilesUpload,
  DisplayInputCommon,
} from "@vao/shared-ui";
import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";
const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const filesProjetsSejoursOrgaTransports = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSORGATRANSPORT,
  ) || [],
);
</script>
