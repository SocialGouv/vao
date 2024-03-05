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
              placeholder="Veuillez saisir le numéro d'agrément"
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
            <DsfrFileUpload
              label="Ajouter une copie de votre agrément"
              hint="La copie de l'agrément qui vous a été délivré est obligatoire."
              @change="changeFile"
            />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <DsfrButtonGroup
            :buttons="boutonOptions"
            :inline-layout-when="true"
            :reverse="true"
          />
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useRegionStore } from "@/stores/referentiels";

const config = useRuntimeConfig();
const log = logger("components/operateur/agrement");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

const regionStore = useRegionStore();

const agrementCourant = computed(() => {
  if (props.initData.agrement) {
    return {
      filename: props.initData.agrement.filename,
      lien: `${config.public.backendUrl}/document/${props.initData.agrement.uuid}`,
    };
  }
});

const boutonOptions = [
  {
    label: "Retour",
    secondary: true,
  },
  {
    label: "Suivant",
  },
];
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
  numeroAgrement: yup.string().required(),
  dateDelivrance: yup
    .date()
    .max(new Date(), "La date doit être inférieure à la date du jour.")
    .min(
      dayjs().add(-5, "year"),
      "La date de validité de votre agrément a expiré",
    )
    .required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaAgrement,
  }),
);

const initialValues = computed(() => {
  if (props.initData.agrement) {
    return {
      regionDelivrance: props.initData.agrement.regionDelivrance,
      numeroAgrement: props.initData.agrement.numero,
      dateDelivrance: dayjs(props.initData.agrement.dateObtention).format(
        "YYYY-MM-DD",
      ),
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
    operateurId: props.initData.operateurId,
  });
  body.append("options", options);
  body.append("file", agrementFile.value);
  try {
    const url = `/document/agrement`;
    await $fetchBackend(url, {
      method: "post",
      credentials: "include",
      body,
      onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.msg ?? "Une erreur inattendue est survenue.",
          );
        } else {
          toaster.success("Bien reçu, merci.");
          emit("valid");
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

regionStore.fetch();
</script>

<style lang="scss" scoped></style>
