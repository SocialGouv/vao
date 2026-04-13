<template>
  <Chat
    ref="chatRef"
    :messages="genericMessages"
    :is-loading="isSendingMessage"
    @send="sendMessage"
  />
</template>

<script setup lang="ts">
import { Chat, useToaster } from "@vao/shared-ui";
import type { AgrementMessage, GenericMessage } from "@vao/shared-bridge";
import { useAgrementStore } from "~/stores/agrement";
import { ref } from "vue";

const { messages } = defineProps<{ messages: AgrementMessage[] }>();
const agrementStore = useAgrementStore();
const toaster = useToaster();
const isSendingMessage = ref(false);
const chatRef = ref<{ resetForm: () => void } | null>(null);

const genericMessages = computed<GenericMessage[]>(() =>
  messages.map((m) => ({
    id: m.id,
    message: m.message,
    createdAt: m.created_at,
    name: m.backUserPrenom
      ? m.backUserPrenom
      : (m.frontUserPrenom ?? "Utilisateur Inconnu"),
    isAnswer: !!m.back_user_id,
    file: null,
  })),
);

const sendMessage = async ({ message }: { message: string }) => {
  isSendingMessage.value = true;
  try {
    await agrementStore.postMessage({
      agrementId: String(agrementStore.agrementEnTraitement!.id),
      message: message ?? "",
    });
    chatRef.value?.resetForm();
    await agrementStore.getMessages(
      String(agrementStore.agrementEnTraitement?.id),
    );
    isSendingMessage.value = false;
    toaster.info({
      titleTag: "h2",
      description: "Message envoyé",
    });
  } catch (error) {
    isSendingMessage.value = false;
    toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors de l'envoi de votre message`,
      role: "alert",
    });
    throw error;
  }
};
</script>
