<template>
  <div class="fr-container">
    <h5>Informations de séjour</h5>
    <Summary :eig="eig" env="BO" />
    <h5>Personnel présent lors des événement</h5>
    <UtilsDisplayEncadrementAccompagnement :personnel="eig.personnel ?? []" />
    <h5>Les faits</h5>
    <h6>Déroulement des faits (date, heure, circonstance, etc…)</h6>
    <article>{{ eig.deroulement }}</article>
    <h6>
      Dispositions pour remédier aux carences, abus, ou faire cesser le danger
    </h6>
    <article>{{ eig.dispositionRemediation }}</article>
    <h6>
      Dispositions prises à l'égard de la victime, et le cas échéant, de
      l’auteur présumé
    </h6>
    <article>{{ eig.dispositionVictimes }}</article>
    <h6>
      Dispositions prises pour l’information des familles, proches ou tuteurs
      légaux
    </h6>
    <article>{{ eig.dispositionInformations }}</article>
    <div class="fr-fieldset">
      <FileUpload
        :model-value="localFile"
        :cdn-url="props.cdnUrl"
        :modifiable="false"
        label="Téléchargement de la déclaration EIG"
        hint="Télécharger le fichier Eig"
        @update:model-value="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Summary, FileUpload } from "@vao/shared";
const emit = defineEmits(["update:file"]);

const props = defineProps({
  eig: { type: Object, required: true },
  file: { type: Object, required: true },
  cdnUrl: { type: String, required: false, default: null },
});

const localFile = ref(props.file);

function handleFileChange(newFile) {
  localFile.value = newFile;
  emit("update:file", newFile);
}
</script>

<style scoped>
h5,
h6 {
  margin-top: 1.5rem;
  margin-bottom: 0;
}
</style>
