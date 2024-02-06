<template>
  <div>
    <DsfrBreadcrumb :links="links" />
    <DSStepper :step="6"></DSStepper>
    <div class="fr-container">
      <div class="fr-my-5v">
        <fieldset class="fr-fieldset">
          <div class="fr-fieldset__element fr-col-12">
            <div class="fr-input-group">
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
          <div class="fr-fieldset__element fr-col-12">
            <UtilsMultiSelect
              :options="transportOptions"
              :values="modeTransport ?? []"
              label="Précisez le ou les modes de transport utilisés *"
              @add-item="addModeTransport"
            ></UtilsMultiSelect>
          </div>
        </fieldset>
        <fieldset class="fr-fieldset">
          <div class="fr-fieldset__element fr-col-12">
            <DsfrInputGroup
              name="precisionModeOrganisation"
              :required="true"
              label="Précisez le mode d’organisation retenu (conditions d’accompagnement des vacanciers, gestion des correspondances/lieux de prise en charge, temps d’attente, etc.)"
              :label-visible="true"
              :is-textarea="true"
              :model-value="precisionModeOrganisation"
              :error-message="precisionModeOrganisationErrorMessage"
              :is-valid="precisionModeOrganisationMeta"
              @update:model-value="onPrecisionModeOrganisationChange"
            />
          </div>
        </fieldset>

        <fieldset class="fr-fieldset">
          <div class="fr-fieldset__element fr-col-12">
            <div class="fr-input-group">
              <DsfrRadioButtonSet
                name="deplacementDurantSejour"
                legend="Des
              déplacements sont-ils prévus durant le séjour ?"
                :required="true"
                :model-value="deplacementDurantSejour"
                :options="[
                  { label: 'Oui', value: 1 },
                  { label: 'Non', value: 0 },
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
          <div class="fr-col-4">
            <div class="fr-input-group">
              <DsfrButton id="retour" :secondary="true" @click="back"
                >Retour</DsfrButton
              >
            </div>
          </div>
          <div class="fr-col-4">
            <div class="fr-input-group">
              <DsfrButton id="precedent" :secondary="true" @click="previous"
                >Précédent</DsfrButton
              >
            </div>
          </div>
          <div class="fr-col-4">
            <div class="fr-input-group">
              <DsfrButton
                id="Suivant"
                :disabled="!meta.valid || modeTransport.length === 0"
                @click="next"
                >Suivant</DsfrButton
              >
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useDemandeSejourStore } from "@/stores/demande-sejour";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected"],
});

const log = logger("demande-sejour/informations-generales");
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/demande-sejour/liste",
    text: "Demande de séjour",
  },
  {
    text: "informations sur le transport des vacanciers",
  },
];

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

const demandeSejourStore = useDemandeSejourStore();
const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const modeTransport = ref([]);

const schemaInfosTransport = {
  responsableTransportLieuSejour: yup.string().required(),
  deplacementDurantSejour: yup.string().required(),
  precisionModeOrganisation: yup
    .string()
    .required()
    .min(5, "Les précisions sur le mode d'organisation sont obligatoires'"),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosTransport,
  })
);

const initialValues = computed(() => ({
  responsableTransportLieuSejour:
    demandeCourante.value?.informationsTransport
      ?.responsableTransportLieuSejour || "",
  precisionModeOrganisation:
    demandeCourante.value?.informationsTransport?.precisionModeOrganisation ||
    "",
  deplacementDurantSejour:
    demandeCourante.value?.informationsTransport?.deplacementDurantSejour || "",
  modeTransport:
    demandeCourante.value?.informationsTransport?.modeTransport ?? [],
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

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

function previous() {
  log.d("previous - IN");
  navigateTo(`/demande-sejour/projet-sejour/${route.params.idDemande}`);
}

function addModeTransport(liste) {
  log.d("addModeTransport -IN", liste);
  modeTransport.value = liste;
}

async function next() {
  log.d("next - IN");
  try {
    const url = `/front-server/sejour/${route.params.idDemande}`;
    await useFetch(url, {
      method: "POST",
      body: {
        parametre: {
          informationsTransport: {
            ...values,
            modeTransport: modeTransport.value,
          },
        },
        type: "informationsTransport",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde"
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success(
            "informations sur le transport des vacanciers sauvegardées"
          );
          await navigateTo(
            `/demande-sejour/informations-sanitaires/${route.params.idDemande}`
          );
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(async () => {
  await demandeSejourStore.setDemandeCourante(route.params.idDemande);
  modeTransport.value =
    demandeCourante.value.informationsTransport?.modeTransport || [];
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
