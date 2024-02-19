<template>
  <div>
    <div class="fr-col-12">
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
        <div v-if="sejourItinerant" class="fr-fieldset__element fr-col-6">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
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
      <div v-if="sejourItinerant && hebergements.length > 0">
        <span>Récapitulatif des hébergements sélectionnés jusque là :</span>
        <DsfrTable :headers="headers" :rows="syntheseRows" />
      </div>
      <div v-if="displaySelectHebergement">
        <div v-if="demandeCourante.sejourItinerant">
          <h5>Hébergement n°{{ hebergements.length + 1 }}</h5>
        </div>
        <fieldset class="fr-fieldset">
          <div class="fr-fieldset__element fr-col-6">
            <div class="fr-input-group">
              <DsfrInputGroup
                name="dateDebut"
                type="date"
                label="Du "
                :min="dateDebMin"
                :max="dateFinMax"
                :label-visible="true"
                :model-value="dateDebut"
                :required="true"
                :is-valid="dateDebutMeta.valid"
                :error-message="dateDebutErrorMessage"
                placeholder="Date de début"
                @update:model-value="onDateDebutChange"
              />
            </div>
            +
          </div>
          <div class="fr-fieldset__element fr-col-6">
            <div class="fr-input-group">
              <DsfrInputGroup
                name="dateFin"
                type="date"
                label="Au : "
                :min="dateDebMin"
                :max="dateFinMax"
                :label-visible="true"
                :model-value="dateFin"
                :required="true"
                :is-valid="dateFinMeta.valid"
                :error-message="dateFinErrorMessage"
                placeholder="Date de début"
                @update:model-value="onDateFinChange"
              />
            </div>
            +
          </div>
        </fieldset>
        <fieldset v-if="!displayAddHebergement" class="fr-fieldset">
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-10 fr-col-lg-6"
          >
            <DsfrSelect
              :model-value="hebergementSelectionne"
              name="hebergementSelectionne"
              label="Hebergement"
              :required="true"
              :options="hebergementsFavoris"
              :is-valid="hebergementSelectionneMeta.valid"
              :error-message="hebergementSelectionneErrorMessage"
              @update:model-value="onHebergementSelectionneChange"
            />
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-10 fr-col-lg-6"
          >
            <DsfrButton
              id="retour"
              :secondary="true"
              @click="changeDisplayAddHebergement"
              >Ajouter un hébergement
            </DsfrButton>
          </div>
        </fieldset>
        <fieldset class="fr-fieldset">
          <div class="fr-fieldset__element fr-col-12">
            <DsfrInputGroup
              name="rejoindreEtape"
              :required="true"
              label="Précisez le mode de transport utilisé pour rejoindre cette étape"
              :label-visible="true"
              :is-textarea="true"
              placeholder=""
              :model-value="rejoindreEtape"
              @update:model-value="onRejoindreEtapeChange"
            />
          </div>
        </fieldset>
        <fieldset v-if="!displayAddHebergement" class="fr-fieldset">
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-10 fr-col-lg-6"
          >
            <DsfrButton
              id="valider"
              :primary="true"
              :disabled="!meta.valid"
              @click="nextHebergement"
              >{{ labelNext }}
            </DsfrButton>
          </div>
        </fieldset>
        <hebergement
          v-if="displayAddHebergement"
          @back="annulerAjoutHebergement"
          @add="ajoutHebergement"
        />
      </div>

      <fieldset v-if="!displayAddHebergement" class="fr-fieldset">
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
            <DsfrButton
              id="Suivant"
              :disabled="!meta.valid || !rejoindreEtape"
              @click="next"
              >Suivant
            </DsfrButton>
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { ouiNonOptions } from "@/helpers/ouiNonOptions";
import { useDemandeSejourStore } from "@/stores/demande-sejour";
import { useHebergementStore } from "@/stores/hebergement";
import { useLayoutStore } from "@/stores/layout";

const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected"],
  layout: "demande-sejour",
});

const log = logger("demande-sejour/hebergement");

const demandeSejourStore = useDemandeSejourStore();
const hebergementStore = useHebergementStore();
const layoutStore = useLayoutStore();

const hebergementsFavoris = computed(() => {
  return hebergementStore.hebergements.map((h) => {
    return { text: h.nomHebergement, value: h.hebergementId };
  });
});

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const headers = ref([
  "Numéro",
  "Nombre de nuits",
  "Du",
  "Au",
  "Nom",
  "Adresse",
]);
const displayAddHebergement = ref(false);
const displaySelectHebergement = ref(true);
// const hebergements = ref([]);
const schemaHebergement = {
  sejourItinerant: yup.boolean().required(),
  dateDebut: yup
    .date()
    .test(
      "dateDebut",
      "La date de début doit être identique à la date de fin précédente",
      (dateDebut) => testDateDebut(dateDebut),
    ),
  dateFin: yup
    .date()
    .test(
      "dateFin",
      "La date de fin ne peut pas être supérieure à la date de fin du séjour ou inférieure à une précédente date de fin",
      (dateFin) => testDateFin(dateFin),
    ),
  hebergements: yup
    .array()
    .min(1, "vous devez sélectionner au moins un hébergement")
    .required("le choix d'un hébergement dans la liste est obligatoire"),
};
const validationSchema = computed(() =>
  yup.object({
    ...schemaHebergement,
  }),
);
const initialValues = computed(() => ({
  sejourItinerant: demandeCourante.value?.hebergement?.sejourItinerant ?? false,
  sejourEtranger: demandeCourante.value?.hebergement?.sejourEtranger ?? false,
  hebergements: demandeCourante.value?.hebergement?.hebergements ?? [],
}));
const { meta } = useForm({ initialValues, validationSchema });
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
const {
  value: hebergementSelectionne,
  errorMessage: hebergementSelectionneErrorMessage,
  handleChange: onHebergementSelectionneChange,
  meta: hebergementSelectionneMeta,
} = useField("hebergementSelectionne");
const { value: hebergements } = useField("hebergements");
const { value: rejoindreEtape, handleChange: onRejoindreEtapeChange } =
  useField("rejoindreEtape");
const dateFinMax = computed(() => {
  return dayjs(demandeCourante.value.dateFin).format("YYYY-MM-DD");
});
const dateDebMin = computed(() => {
  return dayjs(demandeCourante.value.dateDebut).format("YYYY-MM-DD");
});

const labelNext = computed(() => {
  return dayjs(dateFin.value).format("YYYY-MM-DD") ===
    dayjs(demandeCourante.value.dateFin).format("YYYY-MM-DD")
    ? "Terminer la saisie des étapes"
    : "Passer à l'hébergement suivant";
});
const syntheseRows = computed(() => {
  return hebergements.value.map((h, index) => {
    const currentHebergement =
      hebergementStore.hebergements.find(
        (elem) => elem.hebergementId.toString() === h.hebergementId.toString(),
      ) ?? {};
    log.i(currentHebergement);
    return [
      `${index + 1}`,
      dayjs(h.dateFin).diff(dayjs(h.dateDebut), "day").toString(),
      dayjs(h.dateDebut).format("DD/MM/YYYY"),
      dayjs(h.dateFin).format("DD/MM/YYYY"),
      currentHebergement.nomHebergement,
      currentHebergement.caracteristiques.adresse.properties.label,
    ];
  });
});

watch(sejourItinerant, () => {
  if (sejourItinerant.value) {
    dateFin.value = dayjs(demandeCourante.value.dateDebut)
      .add(1, "day")
      .format("YYYY-MM-DD");
  } else {
    dateFin.value = dayjs(demandeCourante.value.dateFin).format("YYYY-MM-DD");
  }
});

function nextHebergement() {
  log.d("nextHebergement - IN");
  hebergements.value.push({
    dateDebut: dateDebut.value,
    dateFin: dateFin.value,
    hebergementId: hebergementSelectionne.value,
    rejoindreEtape: rejoindreEtape.value,
  });
  toaster.success(`hebergement n°${hebergements.value.length} défini`);
  if (
    dayjs(demandeCourante.value.dateFin).diff(dayjs(dateFin.value), "day") === 0
  ) {
    displaySelectHebergement.value = false;
  } else {
    hebergementSelectionne.value = null;
    rejoindreEtape.value = null;
  }
  dateDebut.value = dateFin.value;
  dateFin.value = dayjs(dateDebut.value).add(1, "day").format("YYYY-MM-DD");
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/informations-sanitaires/${route.params.idDemande}`,
  );
}

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

function changeDisplayAddHebergement() {
  log.d("changeDisplayAddHebergement - IN");
  displayAddHebergement.value = true;
}

function annulerAjoutHebergement() {
  displayAddHebergement.value = false;
}

function ajoutHebergement() {
  log.d("ajoutHebergement - IN");
  hebergementStore.fetchHebergement();
  displayAddHebergement.value = false;
}

function testDateDebut(d) {
  const precedenteDateFin =
    hebergements.value &&
    hebergements.value[hebergements.value.length - 1]?.dateFin;
  return precedenteDateFin
    ? dayjs(d).diff(dayjs(demandeCourante.value.dateDebut), "day") >= 0 &&
        dayjs(d).diff(dayjs(precedenteDateFin), "day") === 0
    : dayjs(d).diff(dayjs(demandeCourante.value.dateDebut), "day") >= 0;
}

function testDateFin(d) {
  const precedenteDateFin =
    hebergements.value &&
    hebergements.value[hebergements.value.length - 1]?.dateFin;
  return precedenteDateFin
    ? dayjs(demandeCourante.value.dateFin).diff(dayjs(d), "day") >= 0 &&
        dayjs(d).diff(dayjs(precedenteDateFin), "day") > 0 &&
        dayjs(d).diff(dayjs(dateDebut.value), "day") > 0
    : dayjs(demandeCourante.value.dateFin).diff(dayjs(d), "day") >= 0 &&
        dayjs(d).diff(dayjs(dateDebut.value), "day") > 0;
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
          hebergements: {
            hebergements: hebergements.value,
            sejourItinerant,
            sejourEtranger,
            nombreHebergements: hebergements.value.length,
          },
        },
        type: "hebergements",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde",
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("hébergements sauvegardées");
          await navigateTo(`/demande-sejour`);
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(async () => {
  layoutStore.breadCrumb = "choix des hébergements";
  layoutStore.stepperIndex = 8;
  await demandeSejourStore.setDemandeCourante(route.params.idDemande);
  hebergementStore.fetchHebergement();
  if (demandeCourante.value?.hebergements?.length > 0) {
    hebergements.value = demandeCourante.value?.hebergements;
  } else {
    dateDebut.value = dayjs(demandeCourante.value.dateDebut).format(
      "YYYY-MM-DD",
    );
    dateFin.value = dayjs(demandeCourante.value.dateFin).format("YYYY-MM-DD");
  }
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
