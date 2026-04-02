<template>
  <TitleWithIcon
    icon="fr-icon-arrow-up-down-line"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Changement ou évolution
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.bilanChangementEvolution"
        :input="
          AgrementDisplayInput.IAgrementBilanAnnuel['bilanChangementEvolution']
        "
      />
    </div>
  </div>
  <div class="fr-fieldset__element">
    <MultiFilesUpload
      v-model="filesChangeEvol"
      label="Ajouter des fichiers (optionnel)"
      :modifiable="props.modifiable"
    />
  </div>
  <div class="fr-fieldset__element">
    <DsfrCheckbox
      v-model="bilanAucunChangementEvolution"
      name="checkbox-required-custom"
      label="Aucun changement ou évolution à déclarer."
      :readonly="true"
      :value="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FILE_CATEGORY } from "@vao/shared-bridge";
import {
  TitleWithIcon,
  AgrementDisplayInput,
  DisplayInputCommon,
  MultiFilesUpload,
} from "@vao/shared-ui";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
});

const filesChangeEvol = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) => file.category === FILE_CATEGORY.CHANGEEVOL,
  ) || [],
);

const bilanAucunChangementEvolution =
  props.initAgrement.bilanAucunChangementEvolution;
</script>
