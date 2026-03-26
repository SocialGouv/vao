<template>
  <div>
    <label class="fr-label" for="file-upload-with-error">
      Vous devez fournir un récépissé de complétude du dossier, qui sera
      transmis à l’organisateur.
      <span class="fr-hint-text">.</span>
    </label>
    <div class="fr-fieldset">
      <FileUpload
        :model-value="localFile"
        :cdn-url="props.cdnUrl"
        :modifiable="true"
        hint="Documents importés : taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        @update:model-value="handleFileChange"
      />
    </div>
    <DsfrAlert
      class="fr-grid-row fr-alert--sm fr-my-3v"
      :role="'alert'"
      type="info"
      ><p>
        Cette étape ne constitue pas une décision d’agrément. Elle atteste
        uniquement que le dossier est complet.
      </p>
      <p>
        La décision d’agrément intervient à l’étape suivante, dans un délai de
        deux mois.
      </p></DsfrAlert
    >
    <div class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true">
        <DsfrButton
          id="CancelDemandeComplement"
          secondary
          @click.prevent="cancelConfirmCompletude"
          >Annuler
        </DsfrButton>
        <DsfrButton
          id="ValidationDemandeComplement"
          primary
          :disabled="!localFile"
          @click.prevent="validateConfirmCompletude"
          >Confirmer
        </DsfrButton>
      </DsfrButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileUpload } from "@vao/shared-ui";

const emit = defineEmits(["valid", "update:file", "close"]);

const localFile = ref<File | null>(null);

const props = defineProps<{
  cdnUrl: string;
}>();

function handleFileChange(newFile: File | null) {
  localFile.value = newFile;
  emit("update:file", newFile);
}
function validateConfirmCompletude() {
  emit("valid");
}
function cancelConfirmCompletude() {
  emit("close");
}
</script>

<style scoped></style>
