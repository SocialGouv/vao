<template>
  <div class="message" :class="isAnswer ? 'message--left' : 'message--right'">
    <div class="message__date">
      {{ `${name}, le ${dayjs(createdAt).format("DD/MM/YYYY à HH:mm")}` }}
    </div>
    <p v-if="message" class="message__text">
      {{ message }}
    </p>
    <slot />
    <div v-if="file">
      <span
        class="fr-icon--sm fr-icon-attachment-line"
        aria-hidden="true"
      ></span>
      <a class="attachement" :href="`${cdnUrl}${file.uuid}`"
        >{{ file.name }}
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import { defineProps } from "vue";
defineProps<{
  message: string;
  name: string;
  isAnswer: boolean;
  createdAt: string;
  file: { name: string; uuid: string; createdAt: string } | null;
  cdnUrl: string;
}>();
</script>

<style scoped lang="scss">
.message {
  display: flex;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 10px;
  max-width: 40%;
  word-wrap: break-word;
  flex-direction: column;
  &--left {
    justify-content: flex-start;
    background-color: #f5f5fe;
    .chat__message__date {
      color: #6a6af4;
    }
  }
  &--right {
    justify-content: flex-end;
    align-self: flex-end;
    background-color: #000091;
    color: #f5f5fe;
    .chat__message__date {
      color: #cbcbfa;
    }
  }
  &__date {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
  &__text {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
}
</style>
