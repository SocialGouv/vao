<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <span class="fr-hint-text"
          >Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires</span
        >
      </div>          
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="nombreResponsable"
          label="Nombre total de personnes responsables du déroulement du séjour sur le(s) lieu(x) de séjour"
          :label-visible="true"
          :model-value="nombreResponsable"
          :readonly="!props.modifiable"
          :is-valid="nombreResponsableMeta.valid"
          :error-message="nombreResponsableErrorMessage"
          placeholder="nombre total de responsable"
          @update:model-value="onNombreResponsableChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="procedureRecrutementSupplementaire"
          legend="Procédure en cas de recrutement de personnels supplémentaires durant
          le séjour"
          :disabled="!props.modifiable"
          :model-value="procedureRecrutementSupplementaire"
          :options="ouiNonOptions"
          :is-valid="procedureRecrutementSupplementaireMeta.valid"
          :inline="true"
          :error-message="procedureRecrutementSupplementaireErrorMessage"
          @update:model-value="onProcedureRecrutementSupplementaireChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="nombreAccompagnant"
          label="Nombre total d'accompagnants sur le(s) lieu(x) de séjour"
          :label-visible="true"
          :model-value="nombreAccompagnant"
          :readonly="!props.modifiable"
          :is-valid="nombreAccompagnantMeta.valid"
          :error-message="nombreAccompagnantErrorMessage"
          placeholder="nombre total d'accompagnant"
          @update:model-value="onNombreAccompagnantChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="props.showButtons" class="fr-fieldset">
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
import { DsfrInputGroup } from "@gouvminint/vue-dsfr";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
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
  validateOnMount: props.validateOnMount,
});
const {
  value: nombreAccompagnant,
  errorMessage: nombreAccompagnantErrorMessage,
  handleChange: onNombreAccompagnantChange,
  meta: nombreAccompagnantMeta,
} = useField("nombreAccompagnant");
const {
  value: nombreResponsable,
  errorMessage: nombreResponsableErrorMessage,
  handleChange: onNombreResponsableChange,
  meta: nombreResponsableMeta,
} = useField("nombreResponsable");
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
