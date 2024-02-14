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
          :options="[
            { label: '18-39 ans', id: '18+', name: '18_39' },
            { label: '40-59 ans', id: '40+', name: '40_59' },
            { label: 'Plus de 59 ans', id: '59+', name: '59_et_plus' },
          ]"
          :small="true"
          :required="true"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          v-model="typeDeficiences"
          :inline="true"
          name="typeDeficiences"
          legend="Type de déficiences"
          :options="[
            { label: 'Auditif', id: 'auditif', name: 'auditif' },
            { label: 'Visuel', id: 'visuel', name: 'visuel' },
            { label: 'Mental/Psychique', id: 'mental', name: 'mental' },
            { label: 'Moteur', id: 'moteur', name: 'moteur' },
            {
              label: 'Polyhandicap',
              id: 'polyhandicap',
              name: 'polyhandicap',
            },
          ]"
          :small="true"
          :required="true"
        />
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
          <DsfrButton id="Suivant" :disabled="!meta.valid" @click="next"
            >Suivant</DsfrButton
          >
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

const log = logger("demande-sejour/informations-vacanciers");

const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const schemaInfosVacanciers = {
  effectifPrevisionnel: yup
    .number()
    .typeError("L'effectif prévisionnel doit être un nombre entier")
    .required(),
  effectifPrevisionnelHomme: yup
    .number()
    .typeError("Le nombre d'hommes doit un être un nombre entier")
    .required(),
  effectifPrevisionnelFemme: yup
    .number()
    .typeError("Le nombre de femmes doit un être un nombre entier")
    .required(),
  trancheAge: yup.array().required(),
  typeDeficiences: yup.array().required(),
  // dateFin: yup
  //   .date()
  //   .typeError("date invalide")
  //   .when("dateDebut", (dateDebut, schema) => {
  //     return schema.test({
  //       test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
  //       message: "La date de fin doit être supérieure à la date de début",
  //     });
  //   })
  //   .required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosVacanciers,
  })
);

const initialValues = computed(() => ({
  effectifPrevisionnel:
    demandeCourante.value?.informationsVacanciers?.effectifPrevisionnel || null,
  effectifPrevisionnelHomme:
    demandeCourante.value?.informationsVacanciers?.effectifPrevisionnelHomme ||
    null,
  effectifPrevisionnelFemme:
    demandeCourante.value?.informationsVacanciers?.effectifPrevisionnelFemme ||
    null,
  trancheAge: demandeCourante.value?.informationsVacanciers?.trancheAge || [],
  typeDeficiences:
    demandeCourante.value?.informationsVacanciers?.typeDeficiences || [],
}));
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

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

async function previous() {
  log.d("previous - IN");
  await navigateTo(
    `/demande-sejour/informations-generales/${route.params.idDemande}`
  );
}

async function next() {
  log.d("next - IN");
  try {
    const url = `/sejour/${route.params.idDemande}`;
    await useFetchWithCredentials(url, {
      method: "POST",
      body: {
        parametre: {
          informationsVacanciers: { ...values },
        },
        type: "informationsVacanciers",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde"
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("informations sur les vacanciers sauvegardées");
          await navigateTo(
            `/demande-sejour/informations-personnel/${route.params.idDemande}`
          );
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(() => {
  layoutStore.breadCrumb = "informations sur les vacanciers";
  layoutStore.stepperIndex = 2;
  demandeSejourStore.setDemandeCourante(route.params.idDemande);
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
