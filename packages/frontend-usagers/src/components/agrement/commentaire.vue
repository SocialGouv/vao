<template>
  <textarea
    v-model="comment"
    class="fr-input answer__form__textare"
    name="textarea"
    rows="4"
    placeholder="Votre commentaire..."
  ></textarea>
</template>

<script setup>
import { ref } from "vue";
const comment = ref("");

function getComment() {
  return comment.value;
}
defineExpose({ getComment });
</script>
