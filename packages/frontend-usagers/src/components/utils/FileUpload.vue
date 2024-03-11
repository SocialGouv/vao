<template>
  <div class="fr-fieldset__element">
    <div class="fr-input-group" style="margin-bottom: 2rem">
      <div v-if="initFile">
        <label> Fichier téléversé : </label>
        <ul>
          <li>
            <a
              :class="{
                line: file,
              }"
              :href="props.initFile.lien"
              >{{ props.initFile.filename }}</a
            >
          </li>
          <li v-if="file">
            <span>{{ file.name }}</span>
          </li>
        </ul>
      </div>

      <DsfrFileUpload v-bind="$attrs" @change="changeFile" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  initFile: {
    type: Object,
    default: null,
  },
});

const file = defineModel({ type: Object });

function changeFile(fileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>

<style lang="scss" scoped>
.line {
  text-decoration: line-through;
}
</style>
