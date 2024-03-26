<template>
  <div>
    <form>
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
              name="numero"
              type="text"
              :label-visible="true"
              label="Numéro d'agrément “Vacances adaptées organisées”"
              :model-value="numero"
              :is-valid="numeroMeta.valid"
              :error-message="numeroErrorMessage"
              placeholder="Veuillez saisir le numéro d'agrément"
              @update:model-value="onNumeroChange"
            />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
            <DsfrInputGroup
              name="dateObtention"
              type="date"
              label="Date d'obtention de l'agrément"
              :label-visible="true"
              :model-value="dateObtention"
              :is-valid="dateObtentionMeta.valid"
              :error-message="dateObtentionErrorMessage"
              placeholder="Date d'obtention de l'agrément"
              @update:model-value="onDateObtentionChange"
            />
          </div>
        </div>
      </fieldset>
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-6">
            <DsfrSelect
              :model-value="regionObtention"
              name="regionObtention"
              label="Région d’obtention de l’agrément"
              :options="regionStore.regions"
              :is-valid="regionObtentionMeta.valid"
              :error-message="regionObtentionErrorMessage"
              @update:model-value="onRegionObtentionChange"
            />
          </div>
        </div>
      </fieldset>
      <DsfrFieldset legend="Téléversement de l'attestation de l'agrément">
        <UtilsFileUpload
          v-model="file"
          :label="label"
          hint="Taille maximale : 5 Mo."
        />
      </DsfrFieldset>
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

const log = logger("components/organisme/agrement");
const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const emit = defineEmits(["previous", "next", "update"]);

const regionStore = useRegionStore();
regionStore.fetch();

const label = computed(() => {
  if (file.value) {
    return "Si vous souhaitez remplacer le fichier, veuillez cliquer sur le bouton Parcourir ci dessous.";
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
  meta: regionObtentionMeta,
} = useField("regionObtention");

const { value: file } = useField("file");

async function next() {
  log.i("next - IN");

  if (!meta.value.dirty) {
    return emit("next");
  }

  emit("update", {
    ...values,
  });
}
</script>

<style lang="scss" scoped></style>
