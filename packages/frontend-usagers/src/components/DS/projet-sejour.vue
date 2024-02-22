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
    <!-- <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="periode"
          label="Période"
          :label-visible="true"
          :model-value="periode"
          :disabled="true"
        />
      </div>
    </fieldset> -->

    <DsfrHighlight
      text="Activités spécifiques proposées"
      :small="false"
      :large="true"
    />
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <UtilsMultiSelect
          :options="sportOptions"
          :values="activitesSportives"
          label="Sports et loisirs"
          @update="addActiviteSport"
        ></UtilsMultiSelect>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <UtilsMultiSelect
          :options="cultureOptions"
          :values="activitesCulturelles"
          label="Culture et découverte"
          @update="addActiviteCulture"
        ></UtilsMultiSelect>
      </div>
    </fieldset>

    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="Suivant" :disabled="!meta" @click="valid"
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

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

const log = logger("components/DS/projet-sejour");

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
const schemaProjetSejour = {
  destination: yup
    .array()
    .min(1, "Vous devez cocher au moins une case")
    .required("La saisie de ce champ est obligatoire"),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaProjetSejour,
  }),
);

const initialValues = computed(() => ({
  destination: props.initData.informationsProjetSejour?.destination || [],
  activitesCulturelles: props.initData?.activitesCulturelles ?? [],
  activitesSportives: props.initData?.activitesSportives ?? [],
}));
const { meta, values, resetForm } = useForm({
  validationSchema,
  initialValues,
});

function addActiviteSport(liste) {
  log.d("addActiviteSport", liste);
  activitesSportives.value = liste;
}

function addActiviteCulture(liste) {
  activitesCulturelles.value = liste;
}

// const periode = computed(() => {
//   const moisDebut = dayjs(demandeCourante.value.dateDebut).month();
//   if (moisDebut < 3) return "hiver";
//   if (moisDebut < 6) return "printemps";
//   if (moisDebut < 9) return "été";
//   if (moisDebut < 12) return "automne";
// });

const { value: destination } = useField("destination");
const { value: activitesSportives } = useField("activitesSportives");
const { value: activitesCulturelles } = useField("activitesCulturelles");

function valid() {
  log.d("valid - IN");
  emit("valid", { ...values, meta: meta.value.valid });
}

onMounted(() => {
  resetForm({ values: initialValues.value });
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
