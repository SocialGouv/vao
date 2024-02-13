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
            :options="[
              {
                label: 'Les vacanciers viennent par leurs propres moyens',
                value: 'vacanciers',
              },
              {
                label:
                  'Le transport vers le lieu de séjour est assuré par l\'organisateur',
                value: 'organisateur',
              },
            ]"
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
            :options="transportOptions"
            :values="modeTransport"
            label="Précisez le ou les modes de transport utilisés *"
            @add-item="addModeTransport"
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
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="deplacementDurantSejourMeta"
            :inline="true"
            :error-message="deplacementDurantSejourErrorMessage"
            @update:model-value="onDeplacementDurantSejourChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrButton id="Suivant" @click="valid">Suivant</DsfrButton>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
const log = logger("components/protocole-transport");

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});
const emit = defineEmits(["valid"]);

const transportOptions = [
  { text: "Avion", value: "Avion", id: "1" },
  { text: "Train", value: "Train", id: "2" },
  {
    text: "Autobus, car",
    value: "Autobus, car",
    id: "3",
  },
  { text: "Automobile", value: "Automobile", id: "4" },
  { text: "Bateau", value: "Bateau", id: "5" },
  { text: "Autre", value: "Autre", id: "6" },
];

const schemaInfosTransport = {
  responsableTransportLieuSejour: yup.string().required(),
  deplacementDurantSejour: yup
    .string()
    .required("Le remplissage de ce champ est obligatoire"),
  precisionModeOrganisation: yup
    .string()
    .required()
    .min(5, "Les précisions sur le mode d'organisation sont obligatoires'"),
  modeTransport: yup
    .array()
    .min(1, "vous devez sélectionner au moins un mode de transport"),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosTransport,
  })
);

const initialValues = computed(() => ({
  responsableTransportLieuSejour:
    props.initData?.responsableTransportLieuSejour || "",
  precisionModeOrganisation: props.initData?.precisionModeOrganisation || "",
  deplacementDurantSejour: props.initData?.deplacementDurantSejour || "",
  modeTransport: props.initData?.modeTransport ?? [],
}));
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

function valid() {
  log.d("valid - IN");
  emit("valid", {
    ...values,
    modeTransport: modeTransport.value,
    meta: meta.value.valid,
  });
}
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
