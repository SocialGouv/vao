<template>
  <div class="fr-container">
    <h1>Modification de mon compte</h1>
    <form>
      <DsfrInputGroup
        v-for="(input, key) in inputs"
        :key="key"
        v-model="input.value"
        :label="input.label"
        :placeholder="input.label"
        :hint="input.hint"
        :readonly="input.isDisabled"
        :disabled="input.isDisabled"
        :error-message="input.errorMessage"
        label-visible
      />
      <ul class="fr-btns-group">
        <li>
          <dsfrButton
            type="button"
            :disabled="isDisabled"
            @click="handleOnClick"
            >Sauvegarder
          </dsfrButton>
        </li>
      </ul>
    </form>
    <h2>Token d'api</h2>
    <div class="token-api">
      <ApiTokenManager />
    </div>
  </div>
</template>

<script setup>
import { useField } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import ApiTokenManager from "~/components/ApiTokenManager.vue";

const toaster = useToaster();

definePageMeta({
  middleware: ["is-connected"],
});

useHead({
  title: "mon-compte | Vacances Adaptées Organisées",
  meta: [
    {
      name: "mon-compte",
      content: "Page pour editer ses informations",
    },
  ],
});

const userStore = useUserStore();

const reactiveValues = {
  nom: {
    label: "Nom",
    validation: yup.string().required("Le champs est obligatoire"),
    hint: "Dupont",
  },
  prenom: {
    label: "Prenom",
    validation: yup.string().required("Le champs est obligatoire"),
    hint: "Martin",
  },
};

const disabledValues = {
  email: {
    label: "Email",
    isDisabled: true,
  },
  createdAt: {
    label: "Date de création du compte",
    isDisabled: true,
    format: (date) => dayjs(date).format("DD/MM/YYYY"),
  },
  raisonSociale: {
    label: "Nom de l'organisme",
    isDisabled: true,
  },
  siret: {
    label: "Siret",
    isDisabled: true,
  },
};

const inputs = reactive({
  ...Object.keys(reactiveValues).reduce((acc, key) => {
    const { value, errorMessage } = useField(
      key,
      reactiveValues[key].validation,
    );
    value.value = userStore.user[key];

    acc[key] = {
      ...reactiveValues[key],
      value,
      errorMessage,
    };
    return acc;
  }, {}),
  ...Object.keys(disabledValues).reduce((acc, key) => {
    if (userStore.user[key] !== null) {
      acc[key] = {
        ...disabledValues[key],
        value: disabledValues[key].format
          ? disabledValues[key].format(userStore.user[key])
          : userStore.user[key],
      };
    }
    return acc;
  }, {}),
});

const handleOnClick = () => {
  const params = Object.keys(reactiveValues).reduce((acc, key) => {
    acc[key] = inputs[key].value;
    return acc;
  }, {});
  try {
    userStore.patchProfile(params);
    toaster.success({
      titleTag: "h2",
      description: "Le profil a été mis à jour",
    });
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la mise à jour du profil",
    });
    throw error;
  }
};

const isDisabled = computed(
  () =>
    Object.values(inputs).some((input) => input.errorMessage) ||
    Object.keys(inputs).every(
      (key) => inputs[key].value === userStore.user[key],
    ),
);
</script>

<style scoped>
.token-api {
  margin-bottom: 5rem;
}
</style>
