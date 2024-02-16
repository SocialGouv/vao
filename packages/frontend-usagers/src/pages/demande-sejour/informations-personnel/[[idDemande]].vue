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
            legend="Séjour à l'étranger"
            :required="true"
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
            :is-valid="nombreAccompagnantMeta.valid"
            :error-message="nombreAccompagnantErrorMessage"
            placeholder="nombre total d'accompagnant"
            @update:model-value="onNombreAccompagnantChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="retour" :secondary="true" @click="back"
            >Retour
          </DsfrButton>
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="precedent" :secondary="true" @click="previous"
            >Précédent
          </DsfrButton>
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="Suivant" :disabled="!meta.valid" @click="next"
            >Suivant
          </DsfrButton>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useDemandeSejourStore } from "@/stores/demande-sejour";
import { useLayoutStore } from "@/stores/layout";

const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected"],
  layout: "demande-sejour",
});

const log = logger("demande-sejour/informations-generales");

const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();
const ouiNonOptions = [
  {
    label: "Oui",
    value: 1,
  },
  {
    label: "Non",
    value: 0,
  },
];

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});
const schemaInfosPersonnel = {
  nombreResponsable: yup
    .number()
    .typeError("Doit être un nombre entier")
    .required(),
  procedureRecrutementSupplementaire: yup.bool().required(),
  nombreAccompagnant: yup
    .number()
    .typeError("Doit être un nombre entier")
    .required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosPersonnel,
  }),
);

const initialValues = computed(() => ({
  nombreResponsable:
    demandeCourante.value?.informationsPersonnel?.nombreResponsable || null,
  procedureRecrutementSupplementaire: demandeCourante.value
    ?.informationsPersonnel?.procedureRecrutementSupplementaire
    ? 1
    : 0,
  nombreAccompagnant:
    demandeCourante.value?.informationsPersonnel?.nombreAccompagnant || null,
}));

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

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

async function next() {
  log.d("next - IN");
  try {
    const url = `/sejour/${route.params.idDemande}`;
    await $fetchBackend(url, {
      credentials: "include",
      method: "POST",
      body: {
        parametre: { informationsPersonnel: { ...values } },
        type: "informationsPersonnel",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde",
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("informations sur le personnel sauvegardées");
          await navigateTo(
            `/demande-sejour/projet-sejour/${route.params.idDemande}`,
          );
        }
      },
    });
  } catch (error) {
    log.w("submitCompte - erreur", { error });
  }
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/informations-vacanciers/${route.params.idDemande}`,
  );
}

onMounted(async () => {
  layoutStore.breadCrumb = "informations sur le personnel";
  layoutStore.stepperIndex = 3;
  await demandeSejourStore.setDemandeCourante(route.params.idDemande);
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
