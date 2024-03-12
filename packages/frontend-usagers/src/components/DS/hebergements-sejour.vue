<template>
  <div>
    <div v-if="!nuiteeOpened">
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
            @click.prevent="onOpenNuitee"
          />
        </div>
      </fieldset>

      <fieldset class="fr-fieldset">
        <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
          <DsfrButton
            id="previous-step"
            :secondary="true"
            @click.prevent="
              () => {
                emit('previous');
              }
            "
            >Précédent</DsfrButton
          >
          <DsfrButton id="next-step" @click.prevent="next">Suivant</DsfrButton>
        </DsfrButtonGroup>
      </fieldset>
    </div>
    <DSHebergementsSejourDetail
      v-else
      :hebergement="hebergementCourant"
      :date-debut-ini="nextMinDate"
      :date-fin-ini="dayjs(props.dateFin).format('YYYY-MM-DD')"
      @update="addNuitee"
      @cancel="onCloseNuitee"
    />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useHebergementStore } from "@/stores/hebergement";

const props = defineProps({
  dateDebut: {
    type: String,
    required: true,
  },
  dateFin: {
    type: String,
    required: true,
  },
  hebergement: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["previous", "next", "update"]);

const log = logger("demande-sejour/hebergement");

const headers = ["Numéro", "Nombre de nuits", "Du", "Au", "Nom", "Adresse"];
const hebergementStore = useHebergementStore();
const nuiteeOpened = ref(false);
const currentIndex = ref(-1);

const validationSchema = yup.object({
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
});

const initialValues = {
  sejourItinerant: props.hebergement.sejourItinerant ?? false,
  sejourEtranger: props.hebergement.sejourEtranger ?? false,
  hebergements: props.hebergement.hebergements ?? [],
};

const { meta, values } = useForm({
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
const { value: hebergements, handleChange: onHebergementsChange } =
  useField("hebergements");

const syntheseRows = computed(() => {
  if (hebergementStore.hebergements.length > 0) {
    return hebergements.value.map((hebergement, index) => {
      const currentHebergement = hebergementStore.hebergements.find((elem) => {
        return elem.id.toString() === hebergement.hebergementId.toString();
      });
      if (currentHebergement) {
        const rows = [
          `${index + 1}`,
          dayjs(hebergement.dateFin)
            .diff(dayjs(hebergement.dateDebut), "day")
            .toString(),
          dayjs(hebergement.dateDebut).format("DD/MM/YYYY"),
          dayjs(hebergement.dateFin).format("DD/MM/YYYY"),
          currentHebergement.nom,
          currentHebergement.adresse,
        ];
        return {
          rowData: rows,
          rowAttrs: {
            class: "pointer",
            onClick: () => editNuitee(index),
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

  let memoDate = props.dateDebut;

  for (let i = 0; i < h.length; i++) {
    log.i(h[i].dateDebut, memoDate);
    if (h[i].dateDebut !== memoDate) {
      return false;
    }
    memoDate = h[i].dateFin;
  }

  log.i(memoDate, props.dateFin);
  if (memoDate !== props.dateFin) {
    return false;
  }
  return true;
}

const hebergementCourant = ref();

const nextMinDate = computed(() => {
  if (currentIndex.value !== -1) {
    return dayjs(props.dateDebut).format("YYYY-MM-DD");
  }

  if (hebergements.value.length === 0) {
    return dayjs(props.dateDebut).format("YYYY-MM-DD");
  }
  return dayjs(
    Math.max(
      ...hebergements.value.map((hebergement) => dayjs(hebergement.dateFin)),
    ),
  ).format("YYYY-MM-DD");
});

function onOpenNuitee() {
  currentIndex.value = -1;
  nuiteeOpened.value = true;
  hebergementCourant.value = {};
}

function onCloseNuitee() {
  currentIndex.value = -1;
  nuiteeOpened.value = false;
}

function sortByDate(hebergements) {
  return hebergements.sort(({ dateDebut: a }, { dateDebut: b }) => {
    return dayjs(a).diff(dayjs(b));
  });
}

function addNuitee(hebergement) {
  log.d("addNuitee - In");
  let newHebergements;
  if (currentIndex.value === -1) {
    newHebergements = [...hebergements.value, hebergement];
  } else {
    newHebergements = [
      ...hebergements.value.slice(0, currentIndex.value),
      hebergement,
      ...hebergements.value.slice(currentIndex.value + 1),
    ];
  }
  sortByDate(newHebergements);
  onHebergementsChange(newHebergements);
  onCloseNuitee();
}

function editNuitee(index) {
  log.i("editNuitee -IN", index);
  currentIndex.value = index;
  nuiteeOpened.value = true;
  hebergementCourant.value = hebergements.value[index];
}

async function next() {
  if (!meta.value.dirty) {
    return emit("next");
  }
  const data = {
    ...values,
    nombreHebergements: hebergements.value.length,
  };
  emit("update", data, "hebergements");
}

hebergementStore.fetchHebergements();
</script>

<style lang="scss" scoped></style>
