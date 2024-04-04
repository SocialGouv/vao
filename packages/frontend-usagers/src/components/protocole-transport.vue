<template>
  <div>
    <DsfrFieldset legend="Transports vers le site de séjour">
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="responsableTransportLieuSejour"
          legend="Qui est responsable du transport jusqu'au lieu de séjour ?"
          :disabled="!props.modifiable"
          :model-value="responsableTransportLieuSejour"
          :options="protocoleTransport.responsableTransportLieuSejourOptions"
          :is-valid="responsableTransportLieuSejourMeta.valid"
          :inline="true"
          :error-message="responsableTransportLieuSejourErrorMessage"
          @update:model-value="onResponsableTransportLieuSejourChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group">
          <UtilsMultiSelect
            label="Précisez le ou les modes de transport utilisés"
            :options="protocoleTransport.transportOptions"
            :values="modeTransport"
            :is-valid="modeTransportMeta.valid"
            :error-message="modeTransportErrorMessage"
            :modifiable="props.modifiable"
            @update="updateModeTransport"
          ></UtilsMultiSelect>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionModeOrganisation"
          :readonly="!props.modifiable"
          label="Précisez le mode d’organisation retenu (conditions d’accompagnement des vacanciers, gestion des correspondances, lieux de prise en charge, temps d’attente, etc.)"
          :label-visible="true"
          :is-textarea="true"
          :model-value="precisionModeOrganisation"
          :error-message="precisionModeOrganisationErrorMessage"
          :is-valid="precisionModeOrganisationMeta.valid"
          @update:model-value="onPrecisionModeOrganisationChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Déplacements sur le séjour">
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          legend="Des déplacements sont-ils prévus durant le séjour "
          name="deplacementDurantSejour"
          :disabled="!props.modifiable"
          :model-value="deplacementDurantSejour"
          :options="ouiNonOptions"
          :is-valid="deplacementDurantSejourMeta.valid"
          :inline="true"
          :error-message="deplacementDurantSejourErrorMessage"
          @update:model-value="onDeplacementDurantSejourChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset
      legend="Téléversement des pièces justificatives concernant les protocoles de transport"
    >
      <UtilsMultiFilesUpload
        v-model="files"
        label="Merci de joindre les documents requis pour les informations transport"
        hint="Taille maximale : 5 Mo."
        :modifiable="props.modifiable"
      />
    </DsfrFieldset>
    <DsfrFieldset v-if="props.showButtons">
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
    </DsfrFieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
const log = logger("components/protocole-transport");

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
});
const emit = defineEmits(["previous", "next", "update"]);

const validationSchema = yup.object(protocoleTransport.schema);

const initialValues = {
  responsableTransportLieuSejour: props.initData.responsableTransportLieuSejour,
  precisionModeOrganisation: props.initData.precisionModeOrganisation,
  deplacementDurantSejour: props.initData.deplacementDurantSejour,
  files: props.initData.files ?? [],
  modeTransport: props.initData.modeTransport ?? [],
};
const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
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
const {
  value: modeTransport,
  meta: modeTransportMeta,
  errorMessage: modeTransportErrorMessage,
} = useField("modeTransport");
const { value: files } = useField("files");

function updateModeTransport(modes) {
  modeTransport.value = modes;
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
    },
    "protocole_transport",
  );
}
</script>

<style lang="scss" scoped></style>
