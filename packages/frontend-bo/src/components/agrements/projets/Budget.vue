<template>
  <TitleWithIcon
    icon="fr-icon-bank-card-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Budget des personnes prévu
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DisplayLabel
        :value="props.initAgrement?.budgetGestionPerso"
        :input="AgrementDisplayInput.AgrementProjetsInput['budgetGestionPerso']"
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DisplayLabel
        :value="props.initAgrement?.budgetPersoGestionComplementaire"
        :input="
          AgrementDisplayInput.AgrementProjetsInput[
            'budgetPersoGestionComplementaire'
          ]
        "
      />
    </div>
  </div>

  <div class="fr-fieldset__element fr-mt-8v">
    <MultiFilesUpload
      v-model="filesProjSejoursBudgetPersonnes"
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
  DisplayLabel,
  MultiFilesUpload,
} from "@vao/shared-ui";
import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const filesProjSejoursBudgetPersonnes = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJSEJOURSBUDGETPERSONNES,
  ) || [],
);
</script>
