<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="effectifPrevisionnel"
          :label="`${DeclarationSejour.isPost8Jour(declarationStatut) ? 'Effectif des vacanciers' : 'Effectif prévisionnel des vacanciers'}`"
          :label-visible="true"
          :model-value="effectifPrevisionnel"
          :readonly="!props.modifiable"
          :is-valid="effectifPrevisionnelMeta.valid"
          :error-message="effectifPrevisionnelErrorMessage"
          placeholder="5"
          @update:model-value="onEffectifPrevisionnelChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="effectifPrevisionnelHomme"
          label="Hommes"
          :label-visible="true"
          :model-value="effectifPrevisionnelHomme"
          :readonly="!props.modifiable"
          :is-valid="effectifPrevisionnelHommeMeta.valid"
          :error-message="effectifPrevisionnelHommeErrorMessage"
          placeholder="5"
          @update:model-value="onEffectifPrevisionnelHommeChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="effectifPrevisionnelFemme"
          label="Femmes"
          :label-visible="true"
          :model-value="effectifPrevisionnelFemme"
          :readonly="!props.modifiable"
          :is-valid="effectifPrevisionnelFemmeMeta.valid"
          :error-message="effectifPrevisionnelFemmeErrorMessage"
          placeholder="5"
          @update:model-value="onEffectifPrevisionnelFemmeChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrCheckboxSet
          v-model="trancheAge"
          name="trancheAge"
          legend="Tranches d'âge"
          :inline="true"
          :error-message="trancheAgeErrorMessage"
          :options="informationsVacanciers.trancheAgeOptions"
          :small="true"
          :disabled="!props.modifiable"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrCheckboxSet
          v-model="typeDeficiences"
          name="typeDeficiences"
          legend="Type de déficiences"
          :inline="true"
          :error-message="typeDeficiencesErrorMessage"
          :options="informationsVacanciers.typeDeficiencesOptions"
          :small="true"
          :disabled="!props.modifiable"
        />
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <DsfrInputGroup
            name="precisionDeficiences"
            label="Apportez plus de précisions sur les déficiences des vacanciers"
            :model-value="precisionDeficiences"
            :label-visible="true"
            :is-textarea="true"
            :readonly="!props.modifiable"
            :error-message="precisionDeficiencesErrorMessage"
            :is-valid="precisionDeficiencesMeta.valid"
            @update:model-value="onPrecisionDeficiencesChange"
          />
        </div>
      </div>
    </fieldset>
    <UtilsNavigationButtons
      :show-buttons="props.showButtons"
      :is-downloading="props.isDownloading"
      :message="props.message"
      @next="next"
      @previous="emit('previous')"
    />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const demandeSejourStore = useDemandeSejourStore();
const declarationStatut = computed(() => {
  return demandeSejourStore.demandeCourante.statut;
});

const validationSchema = yup.object(informationsVacanciers.schema);

const initialValues = {
  effectifPrevisionnel: props.initData.effectifPrevisionnel ?? null,
  effectifPrevisionnelHomme: props.initData.effectifPrevisionnelHomme ?? null,
  effectifPrevisionnelFemme: props.initData.effectifPrevisionnelFemme ?? null,
  trancheAge: props.initData.trancheAge ?? [],
  typeDeficiences: props.initData.typeDeficiences ?? [],
  precisionDeficiences: props.initData.precisionDeficiences,
  ...props.initData,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
});

const {
  value: effectifPrevisionnel,
  errorMessage: effectifPrevisionnelErrorMessage,
  handleChange: onEffectifPrevisionnelChange,
  meta: effectifPrevisionnelMeta,
} = useField("effectifPrevisionnel");
const {
  value: effectifPrevisionnelHomme,
  errorMessage: effectifPrevisionnelHommeErrorMessage,
  handleChange: onEffectifPrevisionnelHommeChange,
  meta: effectifPrevisionnelHommeMeta,
} = useField("effectifPrevisionnelHomme");
const {
  value: effectifPrevisionnelFemme,
  errorMessage: effectifPrevisionnelFemmeErrorMessage,
  handleChange: onEffectifPrevisionnelFemmeChange,
  meta: effectifPrevisionnelFemmeMeta,
} = useField("effectifPrevisionnelFemme");
const { value: trancheAge, errorMessage: trancheAgeErrorMessage } =
  useField("trancheAge");
const { value: typeDeficiences, errorMessage: typeDeficiencesErrorMessage } =
  useField("typeDeficiences");
const {
  value: precisionDeficiences,
  errorMessage: precisionDeficiencesErrorMessage,
  handleChange: onPrecisionDeficiencesChange,
  meta: precisionDeficiencesMeta,
} = useField("precisionDeficiences");

function next() {
  if (!meta.value.dirty || !props.modifiable) {
    return emit("next");
  }
  emit(
    "update",
    { ...values, meta: meta.value.valid },
    "informationsVacanciers",
  );
}
</script>

<style lang="scss" scoped></style>
