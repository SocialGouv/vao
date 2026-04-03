<template>
  <TitleWithIcon
    icon="fr-icon-alarm-warning-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Protocole de réorientation, évacuation, rapatriement prévu
  </TitleWithIcon>
  <p><b>Réorientation, évacuation</b></p>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.protocoleEvacUrg"
        :input="AgrementDisplayInput.IAgrementProjets['protocoleEvacUrg']"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.protocoleRapatUrg"
        :input="AgrementDisplayInput.IAgrementProjets['protocoleRapatUrg']"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <MultiFilesUpload
      v-model="filesProjetsSejoursProtocoleReorientation"
      :modifiable="false"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
  <hr class="fr-mt-8v" />
  <p><b>Rapatriement</b></p>
  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.protocoleRapatEtranger"
        :input="AgrementDisplayInput.IAgrementProjets['protocoleRapatEtranger']"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.protocoleInfoFamille"
        :input="AgrementDisplayInput.IAgrementProjets['protocoleInfoFamille']"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-8v">
    <MultiFilesUpload
      v-model="filesProjetsSejoursProtocoleRapatriement"
      :modifiable="false"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  AgrementDisplayInput,
  TitleWithIcon,
  DisplayInputCommon,
  MultiFilesUpload,
} from "@vao/shared-ui";

import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesProjetsSejoursProtocoleReorientation = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJSEJPROTCOREORIENT,
  ) || [],
);
const filesProjetsSejoursProtocoleRapatriement = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJSSEJOURSPROTCOLERAPATR,
  ) || [],
);
</script>
