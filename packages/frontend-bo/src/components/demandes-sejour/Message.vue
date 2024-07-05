<template>
  <div class="fr-container fr-container--fluid fr-my-md-14v">
    <div class="fr-fieldset__element">
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
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-fieldset__element">
      <div class="fr-container fr-container--fluid fr-my-md-14v">
        <DsfrInput
          name="message"
          label="Nouveau message"
          :model-value="message"
          :label-visible="true"
          :is-textarea="true"
          @update:model-value="editMessage"
        />
      </div>
      <div>
        <UtilsFileUpload v-model="file"></UtilsFileUpload>
      </div>
    </div>
    <DsfrButton :disabled="!sendable" @click.prevent="sendMessage"
      >Envoyer le message</DsfrButton
    >
  </div>
</template>

<script setup>
import dayjs from "dayjs";
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

function editMessage(m) {
  message.value = m;
}

const sendable = computed(() => message.value && message.value.length > 0);

async function sendMessage() {
  if (file.value) {
    let newFile;
    try {
      const uuid = await UploadFile("message", file.value);
      newFile = {
        uuid,
        name: file.name,
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
      body: { message: message.value },
    });
    if (response.id) {
      emit("send");
      toaster.success(`message envoyé`);
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
  font-size: 14px;
  font-weight: 700px;
}

.chat-box .check-l span {
  color: #888888;
  font-size: 14px;
  font-weight: 700px;
}
</style>
