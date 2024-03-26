<template>
  <div>
    <DsfrFieldset legend="Transports vers le lieu de séjour">
      <div class="fr-fieldset__element">
        <DsfrCheckboxSet
          v-model="responsableTransportLieuSejour"
          name="responsableTransportLieuSejour"
          :options="protocoleTransport.responsableTransportLieuSejourOptions"
          legend="Qui est responsable du transport jusqu'au lieu de séjour ?"
          :small="true"
          :required="true"
          :error-message="responsableTransportLieuSejourErrorMessage"
          :disabled="!props.modifiable"
        >
        </DsfrCheckboxSet>
      </div>
      <div v-if="responsableTransportLieuSejour.includes('organisateur')">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <UtilsMultiSelect
              :options="protocoleTransport.transportOptions"
              :values="modeTransport"
              label="Précisez le ou les modes de transport utilisés"
              :required="true"
              :modifiable="props.modifiable"
              @update="updateModeTransport"
            ></UtilsMultiSelect>
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrInputGroup
              name="precisionModeOrganisation"
              :required="true"
              :readonly="!props.modifiable"
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
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Déplacements sur le séjour">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="deplacementDurantSejour"
            legend="Des déplacements sont-ils prévus durant le séjour ?"
            :disabled="!props.modifiable"
            :model-value="deplacementDurantSejour"
            :options="ouiNonOptions"
            :is-valid="deplacementDurantSejourMeta"
            :inline="true"
            :error-message="deplacementDurantSejourErrorMessage"
            @update:model-value="onDeplacementDurantSejourChange"
          />
        </div>
      </div>
    </DsfrFieldset>
    <DsfrFieldset
      v-if="
        deplacementDurantSejour ||
        modeTransport?.includes('Autobus, car') ||
        modeTransport?.includes('Automobile')
      "
      legend="Véhicules adaptés"
    >
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="vehiculesAdaptes"
            legend="Les véhicules utilisés sont-ils adaptés ?"
            :disabled="!props.modifiable"
            :model-value="vehiculesAdaptes"
            :options="ouiNonOptions"
            :is-valid="vehiculesAdaptesMeta"
            :inline="true"
            :error-message="vehiculesAdaptesErrorMessage"
            @update:model-value="onVehiculesAdaptesChange"
          />
        </div>
      </div>
      <div v-if="vehiculesAdaptes">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-12">
            <DsfrInputGroup
              name="precisionVehiculesAdaptes"
              :required="true"
              :readonly="!props.modifiable"
              label="Précisez les spécificités des véhicules"
              :label-visible="true"
              :is-textarea="true"
              :model-value="precisionVehiculesAdaptes"
              :error-message="precisionVehiculesAdaptesErrorMessage"
              :is-valid="precisionVehiculesAdaptesMeta"
              @update:model-value="onPrecisionVehiculesAdaptesChange"
            />
          </div>
        </div>
      </div>
    </DsfrFieldset>
    <DsfrFieldset>
      <UtilsMultiFilesUpload
        v-model="files"
        label="Merci de joindre les documents requis pour les informations transport"
        hint="Taille maximale : 5 Mo."
        :modifiable="props.modifiable"
      />
    </DsfrFieldset>
    <DsfrFieldset>
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
});
const emit = defineEmits(["previous", "next", "update"]);

const validationSchema = yup.object(protocoleTransport.schema);

const initialValues = {
  responsableTransportLieuSejour:
    props.initData.responsableTransportLieuSejour ?? [],
  precisionModeOrganisation: props.initData.precisionModeOrganisation,
  deplacementDurantSejour: props.initData.deplacementDurantSejour,
  vehiculesAdaptes: props.initData.vehiculesAdaptes,
  precisionVehiculesAdaptes: props.initData.precisionVehiculesAdaptes,
  files: props.initData.files ?? [],
  modeTransport: props.initData.modeTransport ?? [],
};
const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: responsableTransportLieuSejour,
  errorMessage: responsableTransportLieuSejourErrorMessage,
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
  value: vehiculesAdaptes,
  errorMessage: vehiculesAdaptesErrorMessage,
  handleChange: onVehiculesAdaptesChange,
  meta: vehiculesAdaptesMeta,
} = useField("vehiculesAdaptes");
const {
  value: precisionVehiculesAdaptes,
  errorMessage: precisionVehiculesAdaptesErrorMessage,
  handleChange: onPrecisionVehiculesAdaptesChange,
  meta: precisionVehiculesAdaptesMeta,
} = useField("precisionVehiculesAdaptes");
const { value: modeTransport } = useField("modeTransport");
const { value: files } = useField("files");

watch(responsableTransportLieuSejour, (resp) => {
  if (resp.length === 1 && resp.includes("vacanciers")) {
    modeTransport.value = [];
    precisionModeOrganisation.value = null;
  }
});

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
