<template>
  <TitleWithIcon
    icon="fr-icon-arrow-up-down-line"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Changement ou évolution
  </TitleWithIcon>
  <div class="fr-my-2w">
    <DisplayLabel
      :value="props.initAgrement?.bilanChangementEvolution"
      :input="
        AgrementDisplayInput.AgrementBilanAnnuelInput[
          'bilanChangementEvolution'
        ]
      "
    />
  </div>
  <div class="fr-my-2w">
    <MultiFilesUpload
      v-model="filesChangeEvol"
      label="Ajouter des fichiers (optionnel)"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
    />
  </div>
  <p class="fr-my-2w fr-text--bold">
    {{
      bilanAucunChangementEvolution
        ? "Aucun changement ou évolution n'a été déclaré."
        : "Des changements ou évolutions ont été déclarés."
    }}
  </p>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FILE_CATEGORY } from "@vao/shared-bridge";
import {
  TitleWithIcon,
  AgrementDisplayInput,
  DisplayLabel,
  MultiFilesUpload,
} from "@vao/shared-ui";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesChangeEvol = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) => file.category === FILE_CATEGORY.CHANGEEVOL,
  ) || [],
);

const bilanAucunChangementEvolution =
  props.initAgrement.bilanAucunChangementEvolution;
</script>
