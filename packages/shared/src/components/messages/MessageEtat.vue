<template>
  <div>
    <div v-if="etat === messageEtat.etat.NON_LU" class="not-read">
      <span class="fr-icon-chat-delete-line" aria-hidden="true"></span>
      <span class="text-after-icon">Non lu</span>
    </div>
    <div v-if="etat === messageEtat.etat.LU" class="read">
      <span class="fr-icon-feedback-line" aria-hidden="true"></span>
      <span class="text-after-icon">Lu</span>
    </div>
    <div
      v-if="etat === messageEtat.etat.REPONDU"
      class="answered fr-icon-question-answer-line"
      aria-hidden="true"
    >
      <span class="text-after-icon">Répondu</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  etat: {
    required: true,
    type: String,
    validator: (value) => Object.values(messageEtat.etat).includes(value),
  },
});

import messageEtat from "@vao/shared/src/utils/messageUtils";
const etat = computed(() => props.etat);
</script>

<style scoped>
.text-after-icon {
  color: black;
}
.not-read {
  display: flex;
  gap: 1em;
  color: #e1000f;
}

.read {
  display: flex;
  gap: 1em;
  color: #fc5d00;
}

.answered {
  display: flex;
  gap: 1em;
  color: #1f8d49;
}

.height-days {
  padding-left: 2em;
}

.is_not_height_days {
  color: #cecece;
}

.unbreakable {
  white-space: nowrap;
}
</style>
