<template>
  <div>
    <form ref="refFormAgrement" enctype="multipart/form-data" :meta="meta">
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
        <UtilsFileUpload
          v-model="fileAgrement"
          :init-file="agrementCourant"
          :label="label"
        />
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
            <DsfrButton
              id="previous-step"
              :secondary="true"
              @click.prevent="
                () => {
                  emit('previous');
                }
              "
              >Précédent</DsfrButton
            >
            <DsfrButton id="next-step" @click.prevent="next"
              >Suivant</DsfrButton
            >
          </DsfrButtonGroup>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";

const config = useRuntimeConfig();
const log = logger("components/organisme/agrement");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const props = defineProps({
  initData: { type: Object, required: true },
});

const emit = defineEmits(["previous", "next"]);

const regionStore = useRegionStore();
regionStore.fetch();

const agrementCourant = computed(() => {
  if (props.initData.agrement) {
    return {
      filename: props.initData.agrement.filename,
      lien: `${config.public.backendUrl}/document/${props.initData.agrement.uuid}`,
    };
  }
});

const label = computed(() => {
  if (agrementCourant.value) {
    return "Si vous souhaitez remplacer le fichier, veuillez cliquer sur le bouton Parcourir ci dessous.";
  } else {
    return "Ajouter une copie de votre agrément";
  }
});

const schemaAgrement = { ...organisme.schema.agrement };

const validationSchema = computed(() =>
  yup.object({
    ...schemaAgrement,
  }),
);

const initialValues = (() => {
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
})();

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

const fileAgrement = ref(null);
const refFormAgrement = ref(null);

function cancelUpload() {
  fileAgrement.value = null;
  refFormAgrement.value.reset();
}

async function next() {
  log.i("next - IN");

  if (!meta.value.valid || !meta.value.dirty || fileAgrement.value === null) {
    return emit("next");
  }

  const body = new FormData();
  const options = JSON.stringify({
    ...values,
    organismeId: props.initData.organismeId,
  });
  body.append("options", options);
  body.append("file", fileAgrement.value);
  try {
    const url = `/document/agrement`;
    await $fetchBackend(url, {
      method: "post",
      credentials: "include",
      body,
    });
    toaster.success("Votre agrément a bien été déposé.");
    cancelUpload();
    emit("next");
    log.i("next - DONE");
  } catch (error) {
    toaster.error(error.data.message ?? "Une erreur inattendue est survenue.");
    log.w("next", { error });
  }
}
</script>

<style lang="scss" scoped></style>
