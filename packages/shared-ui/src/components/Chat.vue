<template>
  <div>
    <div class="chat">
      <p v-if="!props.messages?.length" class="chat__empty">
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
        :cdn-url="cdnUrl"
        :data="m"
      />
      <DsfrAlert>
        Il est interdit de saisir des données sensibles (personnelles,
        identifiantes, ...) au sens du RGPD dans la messagerie. Le responsable
        de traitement, non chargé du suivi individuel des vacanciers, se réserve
        le droit de retirer ou faire retirer toute donnée non conforme.
      </DsfrAlert>
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
          :maxlength="MAX_MESSAGE_LENGTH"
          @keydown.enter.exact="sendMessage"
        ></textarea>
        <DsfrButton
          label="Envoyer message"
          title="Envoyer message"
          :icon="isLoading ? 'fr-icon-refresh-line' : 'fr-icon-send-plane-fill'"
          icon-only
          tertiary1
          no-outline
          type="button"
          class="answer__form__send"
          aria-label="Envoyer un message"
          :disabled="isLoading"
          :class="{ 'answer__form__send--is-loading': isLoading }"
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
          :aria-label="`Supprimer le fichier importé : ${file.name}`"
          @click="file = null"
        />
      </div>
      <p class="char-counter">
        {{ message.length }} / {{ MAX_MESSAGE_LENGTH }} caractères
      </p>
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
    <FileUpload v-model="file" :cdn-url="props.cdnUrl" />
    <DsfrButton type="button" @click="isModalOpen = false">Valider</DsfrButton>
  </DsfrModal>
</template>

<script setup>
import { DsfrButton, DsfrModal } from "@gouvminint/vue-dsfr";
import { ref } from "vue";

import Message from "./Message.vue";
import FileUpload from "./FileUpload.vue";
import { useToaster } from '../composables/useToaster';

const MAX_MESSAGE_LENGTH = 1000;

const props = defineProps({
  messages: { type: Array, required: true },
  cdnUrl: { type: String, required: true },
  isLoading: { type: Boolean, default: true },
});

const emit = defineEmits(["send"]);

const message = ref("");
const file = ref(null);
const isModalOpen = ref(false);

const toaster = useToaster();

const sendMessage = (event) => {
  event.preventDefault();
  if ((!message.value && !file.value) || props.isLoading) return;
  if (message.value.length > MAX_MESSAGE_LENGTH) {
    toaster.error({
      titleTag: "h2",
      description: `Le message dépasse la limite autorisée de ${MAX_MESSAGE_LENGTH} caractères.`,
    });
    return;
  }
  emit("send", { file: file.value, message: message.value });
};

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

      &--is-loading {
        &::before {
          animation: spin 2s linear infinite;
        }
      }
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

.char-counter {
  margin-top: 0.5rem;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
