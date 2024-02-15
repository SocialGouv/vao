<template>
  <div>
    <form
      ref="refFormAgrement"
      enctype="multipart/form-data"
      :meta="meta"
      @submit.prevent="upload"
    >
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrHighlight
              text="Disposer d'un agrément est obligatoire."
              :small="false"
              :large="true"
            ></DsfrHighlight>
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
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
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
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
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
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
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div
            v-if="agrementCourant"
            class="fr-input-group fr-col-6"
            style="margin-bottom: 2rem"
          >
            <label> Fichier téléversé : </label>
            <a :href="agrementCourant.lien">{{ agrementCourant.filename }}</a>
            <DsfrFileUpload
              class="fr-input-group fr-col-12"
              style="margin-top: 2rem"
              label="Si vous souhaitez remplacer le fichier, veuillez cliquer sur le bouton Parcourir ci dessous."
              @change="changeFile"
            />
          </div>
          <div
            v-else
            class="fr-input-group fr-col-6"
            style="margin-bottom: 2rem"
          >
            <DsfrFileUpload label="" @change="changeFile" />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrButton
              style="margin: 0 0.5rem 0 0.5rem"
              label="Annuler"
              @click.stop.prevent="cancelUpload"
            />
            <DsfrButton
              style="margin: 0 0.5rem 0 0.5rem"
              label="Suivant"
              :disabled="!meta.valid || !(agrementFile || agrementCourant)"
            />
          </div>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useLayoutStore } from "@/stores/layout";
import { useRegionStore } from "@/stores/referentiels";
import { useOperateurStore } from "@/stores/operateur";

definePageMeta({
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur",
});

const log = logger("pages/operateur/agrement");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const route = useRoute();

const layoutStore = useLayoutStore();
const regionStore = useRegionStore();
const operateurStore = useOperateurStore();

const operateurCourant = computed(() => {
  return operateurStore.operateurCourant ?? {};
});

const agrementCourant = computed(() => {
  if (operateurCourant.value.agrement) {
    return {
      filename:
        operateurCourant.value.agrement[
          operateurCourant.value.agrement.length - 1
        ].filename,
      lien: `/front-server/document/${
        operateurCourant.value.agrement[
          operateurCourant.value.agrement.length - 1
        ].uuid
      }`,
    };
  }
});

const agrementFile = ref(null);
const refFormAgrement = ref(null);

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

const schemaAgrement = {
  regionDelivrance: yup
    .string()
    .test(
      "acceptedReferentiels",
      "Valeur non présente dans le référentiel",
      (regionDelivrance) => !regionStore.regions.includes(regionDelivrance),
    )
    .required(),
  numeroAgrement: yup.string().length(5).required(),
  dateDelivrance: yup
    .date()
    .max(new Date(), "La date doit être inférieure à la date du jour.")
    .min(
      dayjs().add(-5, "year"),
      "L'agrément ne peut pas avoir été délivré il y a plus de 5 ans",
    )
    .required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaAgrement,
  }),
);

const initialValues = computed(() => {
  if (operateurCourant.value.agrement) {
    const lastIndex = operateurCourant.value.agrement.length - 1;
    return {
      regionDelivrance:
        operateurCourant.value.agrement[lastIndex].regionDelivrance || null,
      numeroAgrement: operateurCourant.value.agrement[lastIndex].numero || null,
      dateDelivrance:
        dayjs(operateurCourant.value.agrement[lastIndex].dateObtention).format(
          "YYYY-MM-DD",
        ) || null,
    };
  } else {
    return {
      regionDelivrance: null,
      numeroAgrement: null,
      dateDelivrance: null,
    };
  }
});

const { meta, values } = useForm({ initialValues, validationSchema });

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

function cancelUpload() {
  agrementFile.value = null;
  refFormAgrement.value.reset();
}

async function upload() {
  log.i("upload - IN");
  const body = new FormData();
  const options = JSON.stringify({
    ...values,
    operateurId: route.params.idOperateur,
  });
  body.append("options", options);
  body.append("file", agrementFile.value);
  try {
    const url = `/front-server/document/agrement`;
    await useFetch(url, {
      method: "post",
      body,
      onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.msg ?? "Une erreur inattendue est survenue.",
          );
        } else {
          toaster.success("Bien reçu, merci.");
          navigateTo(
            `/operateur/protocole-transport/${route.params.idOperateur}`,
          );
        }
        cancelUpload();
      },
    });
  } catch (error) {
    cancelUpload();
    log.w("upload", { error });
  }
}

function changeFile(fileList) {
  agrementFile.value = fileList.length === 1 ? fileList[0] : null;
}

onMounted(async () => {
  layoutStore.stepperIndex = 2;
  await regionStore.fetch();
  await operateurStore.setMyOperateur();
});
</script>

<style lang="scss" scoped></style>
