<template>
  <div>
    <label class="fr-label"> {{ description }} </label>
    <div class="fr-grid-row fr-alert--sm fr-my-3v">
      <FileUpload
        :model-value="localFile"
        :cdn-url="props.cdnUrl"
        :modifiable="true"
        hint="Documents importés : taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        @update:model-value="handleFileChange"
      />
    </div>
    <DsfrAlert
      v-if="textAlert"
      class="fr-grid-row fr-alert--sm fr-my-3v"
      :role="'alert'"
      type="info"
    >
      <p v-for="(item, index) in textAlert" :key="index">
        {{ item }}
      </p>
    </DsfrAlert>
    <div class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true">
        <DsfrButton id="CancelForm" secondary @click.prevent="cancelForm"
          >Annuler
        </DsfrButton>
        <DsfrButton
          id="ValidationDemandeComplement"
          primary
          :label="validButton"
          :disabled="!localFile"
          @click.prevent="validateForm"
        >
        </DsfrButton>
      </DsfrButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileUpload } from "@vao/shared-ui";

const localFile = ref<File | null>(null);

const props = defineProps<{
  cdnUrl: string;
  textAlert?: string[] | null;
  description: string;
  validButton: string;
}>();

const emit = defineEmits(["valid", "update:file", "close"]);

function handleFileChange(newFile: File | null) {
  localFile.value = newFile;
  emit("update:file", newFile);
}
function validateForm() {
  emit("valid");
}
function cancelForm() {
  emit("close");
}
</script>
