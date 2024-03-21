<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="nombreResponsable"
            label="Nombre total de personnes responsables du déroulement du séjour sur le(s) lieu(x) de séjour"
            :label-visible="true"
            :model-value="nombreResponsable"
            :required="true"
            :disabled="!props.modifiable"
            :is-valid="nombreResponsableMeta.valid"
            :error-message="nombreResponsableErrorMessage"
            placeholder="nombre total de responsable"
            @update:model-value="onNombreResponsableChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="procedureRecrutementSupplementaire"
            legend="Procédure en cas de recrutement de personnels supplémentaires durant le séjour"
            :required="true"
            :disabled="!props.modifiable"
            :model-value="procedureRecrutementSupplementaire"
            :options="ouiNonOptions"
            :is-valid="procedureRecrutementSupplementaireMeta"
            :inline="true"
            :error-message="procedureRecrutementSupplementaireErrorMessage"
            @update:model-value="onProcedureRecrutementSupplementaireChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="nombreAccompagnant"
            label="Nombre total d'accompagnants sur le(s) lieu(x) de séjour"
            :label-visible="true"
            :model-value="nombreAccompagnant"
            :required="true"
            :disabled="!props.modifiable"
            :is-valid="nombreAccompagnantMeta.valid"
            :error-message="nombreAccompagnantErrorMessage"
            placeholder="nombre total d'accompagnant"
            @update:model-value="onNombreAccompagnantChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
        <DsfrButton
          id="previous-step"
          :secondary="true"
          :disabled="!props.modifiable"
          @click.prevent="
            () => {
              emit('previous');
            }
          "
          >Précédent</DsfrButton
        >
        <DsfrButton
          id="next-step"
          :disabled="!props.modifiable"
          @click.prevent="next"
          >Suivant</DsfrButton
        >
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

const validationSchema = yup.object(
  DeclarationSejour.informationsPersonnelSchema,
);

const initialValues = {
  nombreResponsable: props.initData.nombreResponsable ?? null,
  procedureRecrutementSupplementaire:
    props.initData.procedureRecrutementSupplementaire ?? null,
  nombreAccompagnant: props.initData.nombreAccompagnant ?? null,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: nombreResponsable,
  errorMessage: nombreResponsableErrorMessage,
  handleChange: onNombreResponsableChange,
  meta: nombreResponsableMeta,
} = useField("nombreResponsable");
const {
  value: nombreAccompagnant,
  errorMessage: nombreAccompagnantErrorMessage,
  handleChange: onNombreAccompagnantChange,
  meta: nombreAccompagnantMeta,
} = useField("nombreAccompagnant");
const {
  value: procedureRecrutementSupplementaire,
  errorMessage: procedureRecrutementSupplementaireErrorMessage,
  handleChange: onProcedureRecrutementSupplementaireChange,
  meta: procedureRecrutementSupplementaireMeta,
} = useField("procedureRecrutementSupplementaire");

function next() {
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    { ...values, meta: meta.value.valid },
    "informationsPersonnel",
  );
}
</script>

<style lang="scss" scoped></style>
