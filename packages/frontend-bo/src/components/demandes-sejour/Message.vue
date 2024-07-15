<template>
  <div>
    <div v-for="m in props.messages" :key="m.id">
      <div class="chat-box">
        <div :class="m.backUserId ? 'chat-l' : 'chat-r'">
          <div :class="m.backUserId ? 'mess-l' : 'mess-r'">
            <div :class="m.backUserId ? 'check-l' : 'check-r'">
              <span>{{
                m.backUserId
                  ? m.backUserPrenom +
                    ", le " +
                    dayjs(m.created).format("DD/MM/YYYY à HH:mm")
                  : m.frontUserPrenom +
                    ", le " +
                    dayjs(m.created).format("DD/MM/YYYY à HH:mm")
              }}</span>
            </div>
            <p>
              {{ m.message }}
            </p>
            <div v-if="m.file && m.file.name">
              <img class="icon" src="assets/attach_file.png" />
              <a
                class="attachement"
                :href="`${config.public.backendUrl}/documents/${m.file.uuid}`"
                >{{ m.file.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <textarea v-model="message" placeholder="Nouveau message"></textarea>
      <DsfrButton style="margin: 10px" @click.prevent="onOpenModal">{{
        file?.name ? "Modifier fichier" : "Ajouter fichier"
      }}</DsfrButton>

      <DsfrButton
        :disabled="!sendable"
        style="margin: 10px"
        @click.prevent="sendMessage"
        >Envoyer le message</DsfrButton
      >
    </div>
  </div>
  <DsfrModal
    ref="modalPJ-1"
    name="modalPJ-1"
    :opened="modalPJ.open"
    title="Ajour d'un fichier"
    size="md"
    @close="onCloseModal"
  >
    <UtilsFileUpload v-model="file"></UtilsFileUpload>
    <DsfrButton @click.prevent="onCloseModal">Valider</DsfrButton>
  </DsfrModal>
</template>

<script setup>
import dayjs from "dayjs";
const config = useRuntimeConfig();

const props = defineProps({
  messages: { type: Array, required: true },
});
const emit = defineEmits(["send"]);

const toaster = useToaster();
const log = logger("components/demande-sejours/Message");

const route = useRoute();
const declarationId = route.params.demandeId;
const message = ref();
const file = ref();
const modalPJ = reactive({
  open: false,
});

const sendable = computed(
  () => (message.value && message.value.length > 0) || file.value,
);

const onOpenModal = () => {
  modalPJ.open = true;
};

const onCloseModal = () => {
  modalPJ.open = false;
};

async function sendMessage() {
  let newFile;
  if (file.value) {
    try {
      const uuid = await UploadFile("message", file.value);
      newFile = {
        uuid,
        name: file.value.name ?? "document_messagerie",
        createdAt: new Date(),
      };
      toaster.info(`Document déposé`);
    } catch (error) {
      log.w(error);

      return toaster.error(
        `Une erreur est survenue lors du dépôt du document ${file.name}`,
      );
    }
  }
  try {
    const url = `/message/admin/${declarationId}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: { message: message.value ?? "", file: newFile },
    });
    if (response.id) {
      file.value = null;
      message.value = null;
      emit("send");
    }
  } catch (error) {
    log.w("envoi de message : ", { error });
    return toaster.error(
      `Une erreur est survenue lors de l'envoi de votre message`,
    );
  }
}
</script>
<style scoped>
.chat-r {
  display: flex;
  padding-left: 40%;
}
.chat-l {
  display: flex;
  padding-left: -40%;
}

.chat-box .mess-l {
  max-width: 500px;
  padding: 10px;
  border-radius: 10px;
  margin: 5px 0px;
  cursor: pointer;
  background: #e5e5f7;
  word-break: break-all;
  font-size: 18px;
  color: rgb(65, 64, 64);
}
.chat-box .mess-r {
  max-width: 500px;
  padding: 10px;
  border-radius: 10px;
  margin: 5px 0px;
  word-break: break-all;
  font-size: 18px;
  color: #cac7c7;
  background: #000091;
}

.chat-box .check-r span {
  color: #8d8d8d;
  font-size: 12px;
  font-weight: 700px;
}

.chat-box .check-l span {
  color: #888888;
  font-size: 12px;
  font-weight: 700px;
}

.chat-box .attachement {
  color: #555555;
  font-size: 12px;
  font-weight: 700px;
}

.chat-box .icon {
  display: inline-block;
  width: 25px;
  height: 25px;
  margin-bottom: -4%;
}
.chat-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.chat-footer textarea {
  display: block;
  flex: 1;
  width: 100%;
  height: 50px;
  margin: 5px;
  padding: 10px;
  outline: none;
  font-size: 19px;
  padding-left: 40px;
  padding-right: 90px;
  border: 2px solid #ccc;
  color: #555;
  resize: none;
}
</style>
