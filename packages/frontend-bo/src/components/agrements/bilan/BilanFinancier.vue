<template>
  <TitleWithIcon
    icon="fr-icon-bank-card-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Bilan financier sur les 4 dernières années
  </TitleWithIcon>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DisplayInputCommon
          :value="props.initAgrement?.bilanFinancierComptabilite"
          :input="
            AgrementDisplayInput.IAgrementBilanAnnuel[
              'bilanFinancierComptabilite'
            ]
          "
        />
      </div>
    </div>
  </div>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DisplayInputCommon
          :value="props.initAgrement?.bilanFinancierComparatif"
          :input="
            AgrementDisplayInput.IAgrementBilanAnnuel[
              'bilanFinancierComparatif'
            ]
          "
        />
      </div>
    </div>
  </div>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DisplayInputCommon
          :value="props.initAgrement?.bilanFinancierRessourcesHumaines"
          :input="
            AgrementDisplayInput.IAgrementBilanAnnuel[
              'bilanFinancierRessourcesHumaines'
            ]
          "
        />
      </div>
    </div>
  </div>
  <div class="fr-mt-8v">
    <div class="fr-fieldset__element">
      <div class="fr-col-12">
        <DisplayInputCommon
          :value="props.initAgrement?.bilanFinancierCommentaire"
          :input="
            AgrementDisplayInput.IAgrementBilanAnnuel[
              'bilanFinancierCommentaire'
            ]
          "
        />
      </div>
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-6v">
    <MultiFilesUpload
      v-model="filesBilanFinancierQuatreAnnees"
      :modifiable="false"
      label="Ajouter des fichiers complémentaires (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import { useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
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
});

const filesBilanFinancierQuatreAnnees = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.BILANFINANCIERQUATREANNEES,
  ) || [],
);
</script>
