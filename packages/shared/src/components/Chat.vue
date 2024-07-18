<template>
  <div>
    <div class="chat">
      <p v-if="!props.messages.length" class="chat__empty">
        Pas encore de messages
      </p>
      <Message
        v-for="m in props.messages"
        :key="m.id"
        :message="m.message"
        :created-at="m.created"
        :is-answer="!m.frontUserId"
        :name="m.frontUserId ? m.frontUserPrenom : m.backUserPrenom"
        :file="m.file"
        :html-prefix="backendUrl"
        :data="m"
      />
    </div>

    <div class="answer">
      <div class="fr-input-group answer__form">
        <DsfrButton
          label="Importer un fichier"
          title="Importer un fichier"
          icon="fr-icon-attachment-line"
          icon-only
          tertiary
          no-outline
          type="button"
          class="answer__form__attachment"
          @click="isModalOpen = true"
        />
        <textarea
          v-model="message"
          class="fr-input answer__form__textare"
          name="textarea"
          @keyup.enter.exact="sendMessage"
        ></textarea>
        <DsfrButton
          label="Envoyer message"
          title="Envoyer message"
          icon="fr-icon-send-plane-fill"
          icon-only
          tertiary1
          no-outline
          type="button"
          class="answer__form__send"
          @click="sendMessage"
        />
      </div>
      <div v-if="file" class="answer__form__file">
        {{ file.name }}
        <DsfrButton
          label="Supprimer fichier importé"
          title="Supprimer fichier importé"
          icon="fr-icon-close-line"
          icon-only
          tertiary
          no-outline
          type="button"
          class="answer__form__file__remove-file"
          @click="file = null"
        />
      </div>
    </div>
  </div>
  <DsfrModal
    ref="modalPJ-1"
    name="modalPJ-1"
    :opened="isModalOpen"
    title="Ajour d'un fichier"
    size="md"
    @close="isModalOpen = false"
  >
    <FileUpload v-model="file" />
    <DsfrButton type="button" @click="isModalOpen = true">Valider</DsfrButton>
  </DsfrModal>
</template>

<script setup>
import { DsfrButton, DsfrModal } from "@gouvminint/vue-dsfr";
import { ref } from "vue";
import Message from "./Message.vue";
import FileUpload from "./FileUpload.vue";
const props = defineProps({
  messages: { type: Array, required: true },
  backendUrl: { type: String, required: true },
});
const emit = defineEmits(["send"]);
const message = ref("");
const file = ref(null);
const isModalOpen = ref(false);
function sendMessage() {
  if (!message.value && !file.value) return;
  emit("send", { file: file.value, message: message.value });
}
defineExpose({
  resetForm() {
    message.value = "";
    file.value = null;
  },
});
</script>

<style scoped lang="scss">
.fr-btn[class*=" fr-icon-"]:not([class*="fr-btn--icon-"]):before {
  margin-right: 0;
}
.chat {
  min-height: 10rem;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  &__empty {
    text-align: center;
    color: var(--text-label-grey);
  }
}
.answer {
  margin-bottom: 1.5rem;
  &__form {
    position: relative;
    display: flex;
    margin-bottom: 0;
    &__textare {
      flex: 1;
      padding-left: 3.5rem;
      height: 6rem;
    }
    &__attachment {
      position: absolute;
      top: 50%;
      left: 0.2rem;
      transform: translate(0, -50%);
    }
    &__send {
      margin: auto 0.5rem;
    }
    &__file {
      &__remove-file {
        padding: 0 !important;
        vertical-align: middle;
        min-height: auto;
      }
    }
  }
}
</style>