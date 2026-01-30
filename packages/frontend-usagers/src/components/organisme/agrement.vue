<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <form>
      <div class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrHighlight
              text="Disposer d'un agrément est obligatoire."
              :small="false"
              :large="true"
            ></DsfrHighlight>
          </div>
        </div>
      </div>
      <div class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
            <DsfrInputGroup
              name="numero"
              type="text"
              hint="Numéro d’agrément figurant sur l’arrêté portant décision d’agrément. Exemple: AGR.001-2024-001"
              placeholder=""
              label="Numéro d'agrément “Vacances adaptées organisées”"
              :label-visible="true"
              :readonly="!props.modifiable"
              :model-value="numero"
              :is-valid="numeroMeta.valid"
              required
              :error-message="numeroErrorMessage"
              @update:model-value="onNumeroChange"
            />
          </div>
        </div>
      </div>
      <div class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
            <DsfrInputGroup
              name="dateObtention"
              type="date"
              label="Date d'obtention de l'agrément"
              hint="Date d'obtention de l’agrément exemple: 08/20/2023"
              placeholder=""
              :readonly="!props.modifiable"
              :label-visible="true"
              :model-value="dateObtention"
              :is-valid="dateObtentionMeta.valid"
              :error-message="dateObtentionErrorMessage"
              :max="dayjs().format('YYYY-MM-DD')"
              required
              @update:model-value="onDateObtentionChange"
            />
          </div>
        </div>
      </div>
      <div class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
            <DsfrSelect
              :model-value="regionObtention"
              name="regionObtention"
              label="Région d’obtention de l’agrément"
              :options="regionStore.regions"
              :disabled="!props.modifiable"
              required
              :error-message="regionObtentionErrorMessage"
              @update:model-value="onRegionObtentionChange"
            />
          </div>
        </div>
      </div>

      <div class="fr-fieldset">
        <FileUpload
          v-model="file"
          :cdn-url="props.cdnUrl"
          :label="label"
          :modifiable="props.modifiable"
          hint="Format autorisé : PDF uniquement. Taille maximale : 5 Mo "
        />
      </div>
      <div v-if="props.showButtons">
        <div class="fr-fieldset__element">
          <UtilsNavigationButtons
            :show-buttons="props.showButtons"
            :is-downloading="props.isDownloading"
            :message="props.message"
            :disabled="!meta.valid"
            @next="next"
            @previous="emit('previous')"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { FileUpload, useToaster } from "@vao/shared-ui";

const toaster = useToaster();

const log = logger("components/organisme/agrement");
const props = defineProps({
  initAgrement: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  cdnUrl: { type: String, required: true },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const regionStore = useRegionStore();
regionStore.fetch();

const label = computed(() => {
  if (file.value) {
    return 'Si vous souhaitez remplacer le fichier, veuillez cliquer sur le bouton "Choisir un fichier" ci dessous.';
  } else {
    return "Ajouter une copie de votre agrément";
  }
});

const validationSchema = computed(() =>
  yup.object(organisme.agrementSchema(regionStore.regions)),
);

const initialValues = {
  regionObtention: null,
  numero: null,
  dateObtention: null,
  file: null,
  ...props.initAgrement,
};

const { meta, values } = useForm({ initialValues, validationSchema });

const {
  value: numero,
  errorMessage: numeroErrorMessage,
  handleChange: onNumeroChange,
  meta: numeroMeta,
} = useField("numero");
const {
  value: dateObtention,
  errorMessage: dateObtentionErrorMessage,
  handleChange: onDateObtentionChange,
  meta: dateObtentionMeta,
} = useField("dateObtention");
const {
  value: regionObtention,
  errorMessage: regionObtentionErrorMessage,
  handleChange: onRegionObtentionChange,
} = useField("regionObtention");

const { value: file } = useField("file");

async function next() {
  log.i("next - IN");
  if (file.value.type && file.value.type !== "application/pdf") {
    toaster.error({
      titleTag: "h2",
      description: "L'agrément doit obligatoirement être au format PDF",
      role: "alert",
    });
  } else {
    if (!meta.value.dirty) {
      return emit("next");
    }

    emit(
      "update",
      {
        ...values,
      },
      "agrement",
    );
  }
}
</script>

<style lang="scss" scoped></style>
