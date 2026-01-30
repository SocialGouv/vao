<template>
  <Chat
    ref="chatRef"
    :messages="messages"
    :cdn-url="`${config.public.backendUrl}/documents/admin/`"
    :is-loading="isSendingMessage"
    @send="sendMessage"
  />
</template>

<script setup>
import { Chat, fileUtils, useToaster } from "@vao/shared-ui";
const getFileUploadErrorMessage = fileUtils.getFileUploadErrorMessage;

const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();
const config = useRuntimeConfig();
const toaster = useToaster();

const messages = computed(() => demandeSejourStore.messages);

const isSendingMessage = ref(false);
const chatRef = ref(null);

const sendMessage = async ({ message, file }) => {
  let newFile;
  isSendingMessage.value = true;
  if (file) {
    try {
      const uuid = await UploadFile("message", file);
      newFile = {
        uuid,
        name: file.name ?? "document_messagerie",
        createdAt: new Date(),
      };
      toaster.info({
        titleTag: "h2",
        description: "Document déposé",
      });
    } catch (error) {
      const description = getFileUploadErrorMessage(
        file?.name,
        error?.data?.name,
      );
      isSendingMessage.value = false;
      toaster.error({
        titleTag: "h2",
        description,
        role: "alert",
      });
      return;
    }
  }
  try {
    await demandeSejourStore.postMessage(route.params.declarationId, {
      message: message ?? "",
      file: newFile,
    });
    chatRef.value.resetForm();
    isSendingMessage.value = false;
  } catch (error) {
    isSendingMessage.value = false;
    toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors de l'envoi de votre message`,
      role: "alert",
    });
    throw error;
  }
  demandeSejourStore.fetchMessages(route.params.declarationId);
};
</script>
