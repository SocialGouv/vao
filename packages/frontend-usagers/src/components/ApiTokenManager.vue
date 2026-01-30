<template>
  <label class="fr-label" for="apiToken">Token d'api</label>
  <div class="api-token-manager">
    <div class="api-token-display">
      <template v-if="apiToken?.apiToken">
        <DsfrInput
          id="apiToken"
          :model-value="apiToken?.apiToken"
          aria-disabled="true"
          :type="inputType"
          disabled
        />
        <DsfrButton
          label="Afficher clé d'api"
          :icon="icon"
          icon-only
          @click="isKeyVisible = !isKeyVisible"
        />
      </template>
      <template v-else>
        <span class="api-token-display__not-available">
          Vous n'avez pas encore de token d'api
        </span>
      </template>
    </div>
    <DsfrButton type="button" primary @click="openModal">
      Générer une nouvelle clé d'api
    </DsfrButton>
  </div>
  <DsfrModal
    v-model:opened="isModalOpened"
    title="Attention !"
    icon="ri:error-warning-line"
    is-alert
    :actions="modalActions"
    @close="isModalOpened = false"
  >
    <template #default>
      <p>
        Cela va réinitialiser votre token. L'ancien token ne sera plus
        utilisable
      </p>
    </template>
  </DsfrModal>
</template>

<script setup lang="ts">
import { useToaster } from "@vao/shared-ui";

const userStore = useUserStore();
const toaster = useToaster();

const apiToken = computed(
  () =>
    userStore.apiToken as {
      apiToken: string | null;
      expiresAt: string | null;
    } | null,
);

const icon = computed(() =>
  isKeyVisible.value ? "ri:eye-line" : "ri:eye-close-line",
);
const inputType = computed(() => (isKeyVisible.value ? "text" : "password"));

const isKeyVisible = ref(false);

const isModalOpened = ref(false);
const modalActions = [
  {
    label: "Valider",
    async onClick() {
      isModalOpened.value = false;
      try {
        await userStore.generateApiToken();
        toaster.success({
          titleTag: "h2",
          description: `Votre token d'api a été regénéré`,
        });
      } catch (error) {
        toaster.error({
          titleTag: "h2",
          description: `Erreur lors de la génération de votre token d'api`,
          role: "alert",
        });
        throw error;
      }
    },
  },
  {
    label: "Annuler",
    tertiary: true,
    onClick() {
      isModalOpened.value = false;
    },
  },
];
const openModal = () => {
  isModalOpened.value = true;
};

userStore.getApiToken();
</script>

<style lang="css" scoped>
.api-token-manager {
  gap: 4rem;
  display: flex;
  flex-direction: row;
}

.api-token-display {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.api-token-display ::v-deep(.fr-input) {
  box-shadow: inset 0 -2px 0 0 var(--background-action-high-blue-france);
}

.api-token-display__not-available {
  font-style: italic;
  color: var(--text-disabled-grey);
}
</style>
