<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <DsfrFieldset legend="Transports vers le lieu de séjour">
      <div class="fr-fieldset__element">
        <DsfrCheckboxSet
          v-model="responsableTransportLieuSejour"
          name="responsableTransportLieuSejour"
          legend="Qui est responsable du transport jusqu'au lieu de séjour ?"
          :options="protocoleTransport.responsableTransportLieuSejourOptions"
          :small="true"
          :error-message="responsableTransportLieuSejourErrorMessage"
          :disabled="!props.modifiable"
        >
        </DsfrCheckboxSet>
      </div>
      <div
        v-if="responsableTransportLieuSejour.includes('organisateur')"
        class="fr-fieldset__element"
      >
        <div class="fr-input-group fr-col-12">
          <UtilsMultiSelect
            name="modeTransport"
            label="Précisez le ou les modes de transport utilisés par l'organisateur"
            :values="modeTransport"
            :options="protocoleTransport.transportOptions"
            :modifiable="props.modifiable"
            :error-message="modeTransportErrorMessage"
            @update="updateModeTransport"
          ></UtilsMultiSelect>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-col-12">
            <DsfrInputGroup
              name="precisionModeOrganisation"
              label="Précisez le mode d’organisation retenu (conditions d’accompagnement des vacanciers, gestion des correspondances, lieux de prise en charge, temps d’attente, etc.)"
              :model-value="precisionModeOrganisation"
              :label-visible="true"
              :is-textarea="true"
              hint="Minumum 5 caractères"
              :readonly="!props.modifiable"
              :error-message="precisionModeOrganisationErrorMessage"
              :is-valid="precisionModeOrganisationMeta.valid"
              @update:model-value="onPrecisionModeOrganisationChange"
            />
          </div>
        </div>
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
              label="Précisez les spécificités des véhicules. Minumum 5 caractères"
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
        label="Vous avez la possibilité de joindre des documents relatifs à l'organisation des transports (optionnel)"
        hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
        :modifiable="props.modifiable"
      />
    </DsfrFieldset>
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

const log = logger("components/protocole-transport");

const toaster = useToaster();

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
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
  validateOnMount: props.validateOnMount,
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
const { value: modeTransport, errorMessage: modeTransportErrorMessage } =
  useField("modeTransport");
const { value: files } = useField("files");

function updateModeTransport(modes) {
  modeTransport.value = modes;
}

function next() {
  log.d("next - IN", meta.value.dirty);
  if (!meta.value.dirty || !props.modifiable) {
    return emit("next");
  }
  if (checkFormatFiles(files))
    emit(
      "update",
      {
        ...values,
      },
      "protocole_transport",
    );
  else
    toaster.error(
      "Les documents requis relatifs à l'organisation des transports  doivent obligatoirement être au format pdf, png ou jpg",
    );
}
</script>

<style lang="scss" scoped></style>
