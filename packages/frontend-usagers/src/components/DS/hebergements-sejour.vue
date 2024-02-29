<template>
  <div>
    <div class="fr-col-12">
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element fr-col-12">
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
        <div v-if="sejourItinerant" class="fr-fieldset__element fr-col-12">
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
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element fr-col-12">
          <div>
            <h4>Liste des hébergements sélectionnés</h4>
            <DsfrTable :headers="headers" :rows="syntheseRows" />
          </div>
          <DsfrButton
            label="Ajouter une nuitée"
            :disabled="meta.valid"
            @click="nuiteeOnOpen"
          />
        </div>
      </fieldset>

      <DsfrButton label="Suivant" :disabled="!meta.valid" @click="next" />
    </div>
    <DsfrModal
      ref="nuitee"
      name="nuitee"
      :opened="nuiteeOpened"
      title="Sélection de la nuitée"
      size="md"
      @close="NuiteeOnClose"
    >
      <DSHebergementsSejourDetail
        :init-data="hebergements"
        :date-debut-ini="dayjs(props.initData.dateDebut).format('YYYY-MM-DD')"
        :date-fin-ini="dayjs(props.initData.dateFin).format('YYYY-MM-DD')"
        :current-index="currentIndex"
        @valid="addNuitee"
      />
    </DsfrModal>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useHebergementStore } from "@/stores/hebergement";

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

const log = logger("demande-sejour/hebergement");

const hebergementStore = useHebergementStore();
const nuiteeOpened = ref(false);
const currentIndex = ref(-1);
const headers = ref([
  "Numéro",
  "Nombre de nuits",
  "Du",
  "Au",
  "Nom",
  "Adresse",
]);

const schemaGlobal = {
  sejourItinerant: yup.boolean().required(),
  sejourEtranger: yup.boolean().when("sejourItinerant", {
    is: (sejourItinerant) => !!sejourItinerant,
    then: (sejourEtranger) => sejourEtranger.required(),
    otherwise: (sejourEtranger) => sejourEtranger.nullable(),
  }),
  hebergements: yup
    .array()
    .test(
      "sejourComplet",
      "La liste des hébergements n'est pas complète",
      (hebergements) => testSejourComplet(hebergements),
    )
    .required("le choix d'un hébergement dans la liste est obligatoire"),
};
const validationSchema = computed(() =>
  yup.object({
    ...schemaGlobal,
  }),
);
const initialValues = computed(() => ({
  sejourItinerant: props.initData.hebergement?.sejourItinerant ?? false,
  sejourEtranger: props.initData.hebergement?.sejourEtranger ?? false,
  hebergements: props.initData.hebergement?.hebergements ?? [],
}));

const { meta, values, resetForm } = useForm({
  initialValues,
  validationSchema,
});

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
const { value: hebergements } = useField("hebergements");

const syntheseRows = computed(() => {
  if (hebergementStore.hebergements.length > 0) {
    return hebergements.value.map((h, index) => {
      const currentHebergement = hebergementStore.hebergements.find((elem) => {
        return elem.id.toString() === h.id.toString();
      });
      if (currentHebergement) {
        const rows = [
          `${index + 1}`,
          dayjs(h.dateFin).diff(dayjs(h.dateDebut), "day").toString(),
          dayjs(h.dateDebut).format("DD/MM/YYYY"),
          dayjs(h.dateFin).format("DD/MM/YYYY"),
          currentHebergement.nom,
          currentHebergement.caracteristiques.adresse.properties.label,
        ];
        return {
          rowData: rows,
          rowAttrs: {
            class: "pointer",
            onClick: () => editRow(index),
          },
        };
      } else return [];
    });
  } else return [];
});

function testSejourComplet(h) {
  log.d("testSejourComplet - IN");
  if (h.length === 0) {
    return false;
  }
  // on check la date de debut et de fin
  if (
    dayjs(h[h.length - 1].dateFin).format("YYYY-MM-DD") ===
      dayjs(props.initData.dateFin).format("YYYY-MM-DD") &&
    dayjs(h[0].dateDebut).format("YYYY-MM-DD") ===
      dayjs(props.initData.dateDebut).format("YYYY-MM-DD")
  ) {
    // on checke toutes les dates intermédiaires.
    let nuiteesCoherentes = true;
    h.forEach((element, index) => {
      if (index > 0) {
        nuiteesCoherentes =
          dayjs(element[index].dateDebut).format("YYYY-MM-DD") ===
          dayjs(element[index - 1].dateFin).format("YYYY-MM-DD");
      }
    });
    return nuiteesCoherentes;
  } else {
    return false;
  }
}

function editRow(index) {
  log.i("editRow -IN", index);
  currentIndex.value = index;
  nuiteeOpened.value = true;
}

function addNuitee(data, index) {
  log.d("addNuitee - In");
  if (index === -1) {
    log.i("push");
    hebergements.value.push(data);
  } else {
    hebergements.value[index] = data;
  }
  nuiteeOpened.value = false;
  currentIndex.value = -1;
  resetForm({ values });
}
function nuiteeOnOpen() {
  currentIndex.value = -1;
  nuiteeOpened.value = true;
}

function NuiteeOnClose() {
  currentIndex.value = -1;
  nuiteeOpened.value = false;
}

async function next() {
  const data = {
    hebergements: hebergements.value,
    sejourItinerant: sejourItinerant.value,
    sejourEtranger: sejourEtranger.value,
    nombreHebergements: hebergements.value.length,
  };
  emit("valid", data, "hebergements");
}

hebergementStore.fetchHebergements();
</script>

<style lang="scss" scoped></style>
