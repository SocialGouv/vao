<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="effectifPrevisionnel"
            label="Effectif prévisionnel des vacanciers"
            :label-visible="true"
            :model-value="effectifPrevisionnel"
            :required="true"
            :readonly="!props.modifiable"
            :is-valid="effectifPrevisionnelMeta.valid"
            :error-message="effectifPrevisionnelErrorMessage"
            placeholder="nombre de vacanciers"
            @update:model-value="onEffectifPrevisionnelChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="effectifPrevisionnelHomme"
            label="Hommes"
            :label-visible="true"
            :model-value="effectifPrevisionnelHomme"
            :required="true"
            :readonly="!props.modifiable"
            :is-valid="effectifPrevisionnelHommeMeta.valid"
            :error-message="effectifPrevisionnelHommeErrorMessage"
            placeholder="nombre d'hommes prévus"
            @update:model-value="onEffectifPrevisionnelHommeChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="effectifPrevisionnelFemme"
            label="Femmes"
            :label-visible="true"
            :model-value="effectifPrevisionnelFemme"
            :required="true"
            :readonly="!props.modifiable"
            :is-valid="effectifPrevisionnelFemmeMeta.valid"
            :error-message="effectifPrevisionnelFemmeErrorMessage"
            placeholder="nombre de femmes prévues"
            @update:model-value="onEffectifPrevisionnelFemmeChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          v-model="trancheAge"
          :inline="true"
          name="trancheAge"
          legend="Tranches d'âge"
          :options="informationsVacanciers.trancheAgeOptions"
          :small="true"
          :required="true"
          :disabled="!props.modifiable"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          v-model="typeDeficiences"
          :inline="true"
          name="typeDeficiences"
          legend="Type de déficiences"
          :options="informationsVacanciers.typeDeficiencesOptions"
          :small="true"
          :required="true"
          :disabled="!props.modifiable"
        />
      </div>
    </fieldset>

    <fieldset class="fr-fieldset">
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
        <DsfrButton id="next-step" @click.prevent="next">Suivant</DsfrButton>
      </DsfrButtonGroup>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
});

const emit = defineEmits(["previous", "next", "update"]);

const validationSchema = yup.object(informationsVacanciers.schema);

const initialValues = {
  effectifPrevisionnel: props.initData.effectifPrevisionnel ?? null,
  effectifPrevisionnelHomme: props.initData.effectifPrevisionnelHomme ?? null,
  effectifPrevisionnelFemme: props.initData.effectifPrevisionnelFemme ?? null,
  trancheAge: props.initData.trancheAge ?? [],
  typeDeficiences: props.initData.typeDeficiences ?? [],
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
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
const { value: trancheAge } = useField("trancheAge");
const { value: typeDeficiences } = useField("typeDeficiences");

function next() {
  if (!meta.value.dirty) {
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
