<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrCheckboxSet
            v-model="destination"
            name="destination"
            legend="Destination"
            :inline="true"
            :options="[
              { label: 'Mer', id: 'mer', name: 'mer' },
              { label: 'Montagne', id: 'montagne', name: 'montagne' },
              { label: 'Campagne', id: 'campagne', name: 'campagne' },
              {
                label: 'Séjour à thème',
                id: 'sejour_a_theme',
                name: 'sejour_a_theme',
              },
              { label: 'Etranger', id: 'etranger', name: 'etranger' },
            ]"
            :small="true"
            :required="true"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="periode"
          label="Période"
          :label-visible="true"
          :model-value="periode"
          :disabled="true"
        />
      </div>
    </fieldset>

    <DsfrHighlight
      text="Activités spécifiques proposées"
      :small="false"
      :large="true"
    />
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <UtilsMultiSelect
          :options="sportOptions"
          :values="activitesSpecifiques.sport ?? []"
          label="Sports et loisirs"
          @add-item="addActiviteSport"
        ></UtilsMultiSelect>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <UtilsMultiSelect
          :options="cultureOptions"
          :values="activitesSpecifiques.culture ?? []"
          label="Culture et découverte"
          @add-item="addActiviteCulture"
        ></UtilsMultiSelect>
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
          <DsfrButton id="Suivant" :disabled="!meta" @click="next"
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
import dayjs from "dayjs";
import { useDemandeSejourStore } from "@/stores/demande-sejour";
import { useLayoutStore } from "@/stores/layout";

const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected"],
  layout: "demande-sejour",
});

const log = logger("demande-sejour/projet-sejour");

const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const sportOptions = [
  { text: "Baignade", value: "Baignade", id: "1" },
  { text: "Randonnée", value: "Randonnée", id: "2" },
  {
    text: "Voile, char à voile, rafting",
    value: "Voile, char à voile, rafting",
    id: "3",
  },
  { text: "Tir à l'arc", value: "Tir à l'arc", id: "4" },
  { text: "ULM", value: "ULM", id: "5" },
  { text: "Equitation", value: "Equitation", id: "6" },
  { text: "Ski", value: "Ski", id: "7" },
  { text: "Sports nautiques", value: "Sports nautiques", id: "8" },
  { text: "Pêche", value: "Pêche", id: "9" },
  { text: "Autres", value: "Autres", id: "10" },
];

const cultureOptions = [
  {
    text: "Visites touristiques, géographiques",
    value: "Visites touristiques, géographiques",
    id: "1",
  },
  {
    text: "Spectacles, animations, musées",
    value: "Spectacles, animations, musées",
    id: "2",
  },
  { text: "Musique", value: "Musique", id: "3" },
  { text: "Expression théâtrale", value: "Expression théätrale", id: "4" },
  { text: "Arts plastiques", value: "Arts plastiques", id: "5" },
  { text: "Danse", value: "Danse", id: "6" },
  { text: "Chant", value: "Chant", id: "7" },
  { text: "Soirées dansantes", value: "Soirées dansantes", id: "8" },
  { text: "Ferme pédagogique", value: "Ferme pédagogique", id: "9" },
  { text: "Autres", value: "Autres", id: "10" },
];

const activitesSpecifiques = reactive({
  sport: [],
  culture: [],
});

const schemaProjetSejour = {
  destination: yup.array().required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaProjetSejour,
  }),
);

const initialValues = computed(() => ({
  destination:
    demandeCourante.value?.informationsProjetSejour?.destination || [],
}));
const { meta } = useForm({
  validationSchema,
  initialValues,
});

function addActiviteSport(liste) {
  log.d("addActiviteSport", liste);
  activitesSpecifiques.sport = liste;
}

function addActiviteCulture(liste) {
  activitesSpecifiques.culture = liste;
}

const periode = computed(() => {
  const moisDebut = dayjs(demandeCourante.value.dateDebut).month();
  if (moisDebut < 3) return "hiver";
  if (moisDebut < 6) return "printemps";
  if (moisDebut < 9) return "été";
  if (moisDebut < 12) return "automne";
});

const { value: destination } = useField("destination");

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/informations-personnel");
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/informations-personnel/${route.params.idDemande}`,
  );
}

async function next() {
  log.d("next - IN");
  try {
    const url = `/sejour/${route.params.idDemande}`;
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: {
          informationsProjetSejour: {
            destination: destination.value,
            activitesSpecifiques: activitesSpecifiques.value,
            periode: periode.value,
          },
        },
        type: "informationsProjetSejour",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde",
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("informations sur les vacanciers sauvegardées");
          await navigateTo(
            `/demande-sejour/informations-transport/${route.params.idDemande}`,
          );
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(() => {
  layoutStore.breadCrumb = "Projet de séjour";
  layoutStore.stepperIndex = 4;
  demandeSejourStore.setDemandeCourante(route.params.idDemande);
  activitesSpecifiques.sport =
    demandeCourante.value.informationsProjetSejour?.activitesSpecifiques
      ?.sport || [];
  activitesSpecifiques.culture =
    demandeCourante.value.informationsProjetSejour?.activitesSpecifiques
      ?.culture || [];
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
