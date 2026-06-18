<template>
  <TitleWithIcon
    icon="fr-icon-check-line"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Casier judiciaire
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <DsfrCheckbox
      v-model="accompRespAttestHono"
      name="checkbox-required-custom"
      label="L'OVA atteste que les accompagnants et le responsable du déroulement du séjour sur le lieu de vacances n'ont pas fait l'objet d'une condamnation inscrite au bulletin n° 3 du casier judiciaire"
      :readonly="true"
      :value="true"
    />
  </div>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="fileProjetsSejoursCasier"
      :cdn-url="props.cdnUrl"
      :modifiable="false"
      label="Ajouter un fichier (optionnel)"
    />
  </div>
</template>

<script setup lang="ts">
import { FileUpload, TitleWithIcon } from "@vao/shared-ui";
import { FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const accompRespAttestHono = props.initAgrement.accompRespAttestHono ?? false;

const fileProjetsSejoursCasier = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSCASIER,
  ) || null,
);
</script>

<style scoped>
.fr-error-text {
  color: var(--error-425-625);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
</style>
