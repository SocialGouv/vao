<template>
  <div class="fr-fieldset__element">
    <div class="fr-input-group" style="margin-bottom: 2rem">
      <div v-if="props.initFiles.length > 0">
        <label> Fichier(s) téléversé(s) : </label>
        <ul>
          <li v-for="file in props.initFiles" :key="file.uid">
            <a
              :class="{
                line: files.length > 0,
              }"
              :href="file.lien"
              >{{ file.filename }}</a
            >
          </li>
          <li v-for="(file, index) in files" :key="index">
            <span>{{ file.name }}</span>
          </li>
        </ul>
      </div>

      <DsfrFileUpload v-bind="$attrs" @change="changeFiles" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  initFiles: {
    type: Array,
    default: () => [],
  },
});

const files = defineModel({ type: Array });

function changeFiles(fileList) {
  files.value = fileList;
}
</script>

<style lang="scss" scoped>
.line {
  text-decoration: line-through;
}
</style>
