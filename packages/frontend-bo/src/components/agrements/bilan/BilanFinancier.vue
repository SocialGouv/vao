<template>
  <TitleWithIcon
    icon="fr-icon-bank-card-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Bilan financier sur les 4 dernières années
  </TitleWithIcon>
  <div class="fr-mt-8v">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.bilanFinancierComptabilite"
        :input="
          AgrementDisplayInput.AgrementBilanAnnuelInput[
            'bilanFinancierComptabilite'
          ]
        "
      />
    </div>
  </div>
  <div class="fr-my-2w">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.bilanFinancierComparatif"
        :input="
          AgrementDisplayInput.AgrementBilanAnnuelInput[
            'bilanFinancierComparatif'
          ]
        "
      />
    </div>
  </div>
  <div class="fr-my-2w">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.bilanFinancierRessourcesHumaines"
        :input="
          AgrementDisplayInput.AgrementBilanAnnuelInput[
            'bilanFinancierRessourcesHumaines'
          ]
        "
      />
    </div>
  </div>
  <div class="fr-my-2w">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.bilanFinancierCommentaire"
        :input="
          AgrementDisplayInput.AgrementBilanAnnuelInput[
            'bilanFinancierCommentaire'
          ]
        "
      />
    </div>
  </div>
  <div class="fr-my-2w">
    <MultiFilesUpload
      v-model="filesBilanFinancierQuatreAnnees"
      :modifiable="false"
      :cdn-url="props.cdnUrl"
      label="Ajouter des fichiers complémentaires (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
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
  modifiable: { type: Boolean, default: false },
  cdnUrl: { type: String, required: true },
});

const filesBilanFinancierQuatreAnnees = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANFINANCIERQUATREANNEES,
  ) || [],
);
</script>
