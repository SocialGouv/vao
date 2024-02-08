<template>
  <div class="fr-grid-row fr-grid-row--center fr-my-5v">
    <div class="fr-container fr-mt-5v">
      <div class="fr-grid-row fr-grid-row--center">
        <form
          ref="refFormAgrement"
          enctype="multipart/form-data"
          :meta="meta"
          @submit.prevent="upload"
        >
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-4 fr-col-lg-12"
            >
              <span>{{ props.textToDisplay }}</span>
            </div>
          </fieldset>
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-6 fr-col-lg-6"
            >
              <DsfrInputGroup
                name="numeroAgrement"
                type="text"
                :label-visible="true"
                label="Numéro d'agrément"
                :required="true"
                :model-value="numeroAgrement"
                :is-valid="numeroAgrementMeta.valid"
                :error-message="numeroAgrementErrorMessage"
                placeholder="Veuillez saisir le prénom de votre mère"
                @update:model-value="onNumeroAgrementChange"
              />
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-6 fr-col-lg-6"
            >
              <DsfrInputGroup
                name="dateDelivrance"
                type="date"
                label="Date de délivrance"
                :label-visible="true"
                :model-value="dateDelivrance"
                :required="true"
                :is-valid="dateDelivranceMeta.valid"
                :error-message="dateDelivranceErrorMessage"
                placeholder="Date de délivrance de l'agrément"
                @update:model-value="onDateDelivranceChange"
              />
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-6 fr-col-lg-6"
            >
              <DsfrSelect
                :model-value="regionDelivrance"
                name="regionDelivrance"
                label="Région de délivrance"
                :required="true"
                :options="regionStore.regions"
                :is-valid="regionDelivranceMeta.valid"
                :error-message="regionDelivranceErrorMessage"
                @update:model-value="onRegionDelivranceChange"
              />
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-6 fr-col-lg-6"
              style="margin-bottom: 2rem"
            >
              <DsfrFileUpload label="" @change="changeFile" />
            </div>
          </fieldset>
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-4 fr-col-lg-6"
            >
              <DsfrButton
                style="margin: 0 0.5rem 0 0.5rem"
                label="Annuler"
                @click.stop.prevent="cancelUpload"
              />
              <DsfrButton
                style="margin: 0 0.5rem 0 0.5rem"
                label="Déposer"
                :disabled="!meta.valid || !agrementFile"
              />
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";

import { DsfrSelect } from "@gouvminint/vue-dsfr";
import { useRegionStore } from "@/stores/referentiels";

const config = useRuntimeConfig()

const log = logger("pages/component/add-document");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const emit = defineEmits(["add", "back"]);
const props = defineProps({
  fileType: { type: String, required: true },
  agrement: { type: Object, required: true },
  textToDisplay: { type: String, default: null, required: false },
  operateurId: { type: Number, required: true },
});
const regionStore = useRegionStore();

const schemaAgrement = {
  regionDelivrance: yup
    .string()
    .test(
      "acceptedReferentiels",
      "Valeur non présente dans le référentiel",
      (regionDelivrance) => !regionStore.regions.includes(regionDelivrance)
    )
    .required(),
  numeroAgrement: yup.string().length(5).required(),
  dateDelivrance: yup
    .date()
    .max(new Date(), "La date doit être inférieure à la date du jour.")
    .min(
      dayjs().add(-5, "year"),
      "L'agrément ne peut pas avoir été délivré il y a plus de 5 ans"
    )
    .required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaAgrement,
  })
);

const initialValues = computed(() => ({
  regionDelivrance: props.agrement.regionDelivrance || null,
  numeroAgrement: props.agrement.numeroAgrement || null,
  dateDelivrance: props.agrement.dateDelivrance || null,
}));

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: numeroAgrement,
  errorMessage: numeroAgrementErrorMessage,
  handleChange: onNumeroAgrementChange,
  meta: numeroAgrementMeta,
} = useField("numeroAgrement");
const {
  value: dateDelivrance,
  errorMessage: dateDelivranceErrorMessage,
  handleChange: onDateDelivranceChange,
  meta: dateDelivranceMeta,
} = useField("dateDelivrance");
const {
  value: regionDelivrance,
  errorMessage: regionDelivranceErrorMessage,
  handleChange: onRegionDelivranceChange,
  meta: regionDelivranceMeta,
} = useField("regionDelivrance");

const agrementFile = ref(null);
const refFormAgrement = ref(null);

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

function cancelUpload() {
  agrementFile.value = null;
  refFormAgrement.value.reset();
  emit("back");
}

async function upload() {
  const body = new FormData();
  const options = JSON.stringify({
    ...values,
    operateurId: props.operateurId,
  });
  body.append("options", options);
  body.append("file", agrementFile.value);
  try {
    const url = `${config.public.backendUrl}/document`;
    await useFetch(url, {
      method: "post",
      body,
      onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.msg ?? "Une erreur inattendue est survenue."
          );
        } else {
          toaster.success("Bien reçu, merci.");
          emit("add");
        }
        cancelUpload();
      },
    });
  } catch (error) {
    cancelUpload();
    log.w("uploadFilePhd", { error });
  }
}

function changeFile(fileList) {
  agrementFile.value = fileList.length === 1 ? fileList[0] : null;
}

onMounted(() => {
  regionStore.fetch();
});
</script>

<style lang="scss" scoped></style>
