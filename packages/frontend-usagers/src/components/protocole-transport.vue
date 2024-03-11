<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="responsableTransportLieuSejour"
            legend="Qui est responsable du transport jusqu'au lieu de séjour ?"
            :required="true"
            :model-value="responsableTransportLieuSejour"
            :options="protocoleTransport.responsableTransportLieuSejourOptions"
            :is-valid="responsableTransportLieuSejourMeta"
            :inline="true"
            :error-message="responsableTransportLieuSejourErrorMessage"
            @update:model-value="onResponsableTransportLieuSejourChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <UtilsMultiSelect
            :options="protocoleTransport.transportOptions"
            :values="modeTransport"
            label="Précisez le ou les modes de transport utilisés"
            :required="true"
            @update="addModeTransport"
          ></UtilsMultiSelect>
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionModeOrganisation"
            :required="true"
            label="Précisez le mode d’organisation retenu (conditions d’accompagnement des vacanciers, gestion des correspondances, lieux de prise en charge, temps d’attente, etc.)"
            :label-visible="true"
            :is-textarea="true"
            :model-value="precisionModeOrganisation"
            :error-message="precisionModeOrganisationErrorMessage"
            :is-valid="precisionModeOrganisationMeta"
            @update:model-value="onPrecisionModeOrganisationChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="deplacementDurantSejour"
            legend="Des déplacements sont-ils prévus durant le séjour ?"
            :required="true"
            :model-value="deplacementDurantSejour"
            :options="ouiNonOptions"
            :is-valid="deplacementDurantSejourMeta"
            :inline="true"
            :error-message="deplacementDurantSejourErrorMessage"
            @update:model-value="onDeplacementDurantSejourChange"
          />
        </div>
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
const log = logger("components/protocole-transport");

const props = defineProps({
  initData: { type: Object, required: true },
});
const emit = defineEmits(["previous", "next", "update"]);

const schemaInfosTransport = { ...protocoleTransport.schema };

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosTransport,
  }),
);

const initialValues = {
  responsableTransportLieuSejour: props.initData.responsableTransportLieuSejour,
  precisionModeOrganisation: props.initData.precisionModeOrganisation,
  deplacementDurantSejour: props.initData.deplacementDurantSejour,
  modeTransport: props.initData.modeTransport ?? [],
};
const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: responsableTransportLieuSejour,
  errorMessage: responsableTransportLieuSejourErrorMessage,
  handleChange: onResponsableTransportLieuSejourChange,
  meta: responsableTransportLieuSejourMeta,
} = useField("responsableTransportLieuSejour");
const {
  value: precisionModeOrganisation,
  errorMessage: precisionModeOrganisationErrorMessage,
  handleChange: onPrecisionModeOrganisationChange,
  meta: precisionModeOrganisationMeta,
} = useField("precisionModeOrganisation");
const {
  value: deplacementDurantSejour,
  errorMessage: deplacementDurantSejourErrorMessage,
  handleChange: onDeplacementDurantSejourChange,
  meta: deplacementDurantSejourMeta,
} = useField("deplacementDurantSejour");
const { value: modeTransport } = useField("modeTransport");

function addModeTransport(element) {
  log.d("addModeTransport -IN");
  modeTransport.value = element;
}

function next() {
  log.d("next - IN", meta.value.dirty);
  if (!meta.value.dirty) {
    return emit("next");
  }

  emit(
    "update",
    {
      ...values,
      modeTransport: modeTransport.value,
      meta: meta.value.valid,
    },
    "protocole_transport",
  );
}
</script>

<style lang="scss" scoped></style>
