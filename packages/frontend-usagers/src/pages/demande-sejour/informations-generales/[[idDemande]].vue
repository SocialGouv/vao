<template>
  <div>
    <div class="fr-col-12">
      <div class="fr-input-group">
        <DsfrInputGroup
          name="libelle"
          label="Titre"
          :label-visible="true"
          :model-value="libelle"
          :required="true"
          :is-valid="libelleMeta.valid"
          :error-message="libelleErrorMessage"
          placeholder="nom de votre demande de séjour"
          @update:model-value="onLibelleChange"
        />
      </div>
    </div>

    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="dateDebut"
            type="date"
            label="Date de début"
            :label-visible="true"
            :model-value="dateDebut"
            :required="true"
            :is-valid="dateDebutMeta.valid"
            :error-message="dateDebutErrorMessage"
            placeholder="Date de début"
            @update:model-value="onDateDebutChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="dateFin"
            type="date"
            label="Date de fin"
            :label-visible="true"
            :model-value="dateFin"
            :required="true"
            :is-valid="dateFinMeta.valid"
            :error-message="dateFinErrorMessage"
            placeholder="Date de fin"
            @update:model-value="onDateFinChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-if="duree > 0"
            name="duree"
            label="Durée du séjour (en jours)"
            :label-visible="true"
            :model-value="duree"
            :disabled="true"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="sejourItinerant"
            legend="Séjour itinerant"
            :required="true"
            :model-value="sejourItinerant"
            :options="ouiNonOptions"
            :is-valid="sejourItinerantMeta"
            :inline="true"
            :error-message="sejourItinerantErrorMessage"
            @update:model-value="onSejourItinerantChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            v-if="sejourItinerant"
            name="sejourEtranger"
            legend="Séjour à l'étranger"
            :required="true"
            :model-value="sejourEtranger"
            :options="ouiNonOptions"
            :is-valid="sejourEtrangerMeta"
            :inline="true"
            :error-message="sejourEtrangerErrorMessage"
            @update:model-value="onSejourEtrangerChange"
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
          <DsfrButton id="Suivant" :disabled="!meta.valid" @click.prevent="next"
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
import dayjs from "dayjs";
import { useOperateurStore } from "@/stores/operateur";
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

const operateurStore = useOperateurStore();
const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const isUpdate = computed(() => {
  return !!route.params.idDemande;
});

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

const duree = computed(() => {
  const nbjours = dayjs(dateFin.value).diff(dateDebut.value, "day");
  return nbjours.toString();
});
const schemaInfosGenerales = {
  libelle: yup.string().typeError("le libellé est requis").required(),
  dateDebut: yup
    .date()
    .typeError("date invalide")
    .min(new Date(), "La date doit être supérieure à la date du jour.")
    .required(),
  dateFin: yup
    .date()
    .typeError("date invalide")
    .when("dateDebut", (dateDebut, schema) => {
      return schema.test({
        test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
        message: "La date de fin doit être supérieure à la date de début",
      });
    })
    .required(),
  sejourItinerant: yup.boolean().required(),
  sejourEtranger: yup.boolean(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosGenerales,
  }),
);

const initialValues = computed(() => ({
  libelle: demandeCourante.value.libelle ?? null,
  dateDebut: dayjs(demandeCourante.value.dateDebut).format("YYYY-MM-DD") ?? "",
  dateFin: dayjs(demandeCourante.value?.dateFin).format("YYYY-MM-DD") ?? "",
  sejourItinerant: demandeCourante.value?.sejourItinerant ? 1 : 0,
  sejourEtranger: demandeCourante.value?.sejourEtranger ? 1 : 0,
}));

const { meta, values } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: libelle,
  errorMessage: libelleErrorMessage,
  handleChange: onLibelleChange,
  meta: libelleMeta,
} = useField("libelle");
const {
  value: dateDebut,
  errorMessage: dateDebutErrorMessage,
  handleChange: onDateDebutChange,
  meta: dateDebutMeta,
} = useField("dateDebut");
const {
  value: dateFin,
  errorMessage: dateFinErrorMessage,
  handleChange: onDateFinChange,
  meta: dateFinMeta,
} = useField("dateFin");
const {
  value: sejourItinerant,
  errorMessage: sejourItinerantErrorMessage,
  handleChange: onSejourItinerantChange,
  meta: sejourItinerantMeta,
} = useField("sejourItinerant");
const {
  value: sejourEtranger,
  errorMessage: sejourEtrangerErrorMessage,
  handleChange: onSejourEtrangerChange,
  meta: sejourEtrangerMeta,
} = useField("sejourEtranger");

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/operateur/${isUpdate.value ? route.params.idDemande : ""}`,
  );
}

async function next() {
  log.d("next - IN");
  try {
    if (isUpdate.value) {
      const url = `${config.public.backendUrl}/sejour/${route.params.idDemande}`;
      await useFetch(url, {
        method: "POST",
        body: {
          parametre: { ...values, duree: duree.value },
          type: "informationsGenerales",
        },
        async onResponse({ response }) {
          if (!response.ok) {
            toaster.error(
              response._data.message ?? "Erreur lors de la sauvegarde",
            );
          } else {
            log.d("demande de sejour mise à jour");
            toaster.success("informations générales sauvegardées");
            await navigateTo(
              `/demande-sejour/informations-vacanciers/${route.params.idDemande}`,
            );
          }
        },
      });
    } else {
      const url = `${config.public.backendUrl}/sejour`;
      await useFetch(url, {
        method: "POST",
        body: {
          ...values,
          operateurId: operateurStore.operateurCourant.operateurId,
          duree: duree.value,
        },
        async onResponse({ response }) {
          if (!response.ok) {
            toaster.show(
              response._data.message ?? `Erreur lors de la sauvegarde`,
              {
                type: "error",
              },
            );
          } else {
            log.d("demande de sejour créée");
            const idDemande = response._data.id;
            toaster.success("Demande de séjour enregistrée");
            await navigateTo(
              `/demande-sejour/informations-vacanciers/${idDemande}`,
            );
          }
        },
      });
    }
  } catch (error) {
    log.w("submitCompte - erreur", { error });
  }
}

onMounted(() => {
  layoutStore.breadCrumb = "informations générales";
  layoutStore.stepperIndex = 1;
  operateurStore.setMyOperateur();
  if (isUpdate.value)
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
