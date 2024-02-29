<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset_element fr-col-offset-1 fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="dateDebut"
            type="date"
            label="Du "
            :min="props.dateDebutIni"
            :max="props.dateFinIni"
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset_element fr-col-offset-1 fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            name="dateFin"
            type="date"
            label="Au : "
            :min="props.dateDebutIni"
            :max="props.dateFinIni"
            :label-visible="true"
            :model-value="dateFin"
            :required="true"
            :is-valid="dateFinMeta.valid"
            :error-message="dateFinErrorMessage"
            placeholder="Date de début"
            @update:model-value="onDateFinChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset_element fr-col-offset-1 fr-col-6">
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
      <div class="fr-fieldset_element fr-col-offset-1 fr-col-4">
        <DsfrButton id="retour" :secondary="true" @click="addHebergementOnOpen"
          >Ajouter un hébergement
        </DsfrButton>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset_element fr-col-offset-1 fr-col-10">
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
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset_element fr-col-offset-1 fr-col-4">
        <DsfrButton
          id="valider"
          :label="labelNext"
          :primary="true"
          :disabled="!meta.valid"
          @click="next"
        >
        </DsfrButton>
      </div>
    </fieldset>
    <DsfrModal
      ref="addHebergement"
      name="addHebergement"
      :opened="addHebergementOpened"
      title="Défintion d'un hébergement"
      size="xl"
      @close="addHebergementOnClose"
    >
      <hebergement @back="addHebergementOnClose" @add="ajoutHebergement" />
    </DsfrModal>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useHebergementStore } from "@/stores/hebergement";

const props = defineProps({
  initData: { type: Array, required: true },
  dateDebutIni: { type: String, required: true },
  dateFinIni: { type: String, required: true },
  currentIndex: { type: Number, default: -1, required: false },
});

const emit = defineEmits(["valid"]);

const log = logger("components/DS/hebergement-sejour-detail");
const addHebergementOpened = ref(false);

const hebergementStore = useHebergementStore();
const hebergementsFavoris = computed(() => {
  return hebergementStore.hebergements.map((h) => {
    return { text: h.nom, value: h.id };
  });
});

const schemaHebergement = {
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
  hebergementSelectionne: yup
    .string()
    .required("le choix d'un hébergement dans la liste est obligatoire"),
  rejoindreEtape: yup
    .string()
    .min(1, "Il est impératif de préciser le mode de transport utilisé")
    .required(),
};
const validationSchema = computed(() =>
  yup.object({
    ...schemaHebergement,
  }),
);

const initialValues = computed(() => {
  if (props.initData.length === 0) {
    log.i("init");
    return {
      dateDebut: dayjs(props.dateDebutIni).format("YYYY-MM-DD") ?? null,
      dateFin: dayjs(props.dateFinIni).format("YYYY-MM-DD") ?? null,
      hebergementSelectionne: null,
      rejoindreEtape: null,
    };
  } else {
    if (props.currentIndex !== -1) {
      log.i("on prend l'index, point barre");
      return {
        dateDebut:
          dayjs(props.initData[props.currentIndex].dateDebut).format(
            "YYYY-MM-DD",
          ) ?? null,
        dateFin:
          dayjs(props.initData[props.currentIndex].dateFin).format(
            "YYYY-MM-DD",
          ) ?? null,
        hebergementSelectionne: props.initData[props.currentIndex].id ?? null,
        rejoindreEtape:
          props.initData[props.currentIndex].rejoindreEtape ?? null,
      };
    } else {
      const lastIndex = props.initData.length - 1;
      log.i("on ajoute");
      return {
        dateDebut:
          dayjs(props.initData[lastIndex].dateFin).format("YYYY-MM-DD") ?? null,
        dateFin:
          dayjs(props.initData[lastIndex].dateFin)
            .add(1, "day")
            .format("YYYY-MM-DD") ?? null,
        hebergementSelectionne: null,
        rejoindreEtape: null,
      };
    }
  }
});
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
  value: hebergementSelectionne,
  errorMessage: hebergementSelectionneErrorMessage,
  handleChange: onHebergementSelectionneChange,
  meta: hebergementSelectionneMeta,
} = useField("hebergementSelectionne");
const { value: rejoindreEtape, handleChange: onRejoindreEtapeChange } =
  useField("rejoindreEtape");

const labelNext = computed(() => {
  return dayjs(dateFin.value).format("YYYY-MM-DD") ===
    dayjs(props.initData?.dateFin).format("YYYY-MM-DD")
    ? "Terminer la saisie des étapes"
    : "Passer à l'hébergement suivant";
});

function addHebergementOnOpen() {
  log.d("addHebergementOnOpen - IN");
  addHebergementOpened.value = true;
}

function ajoutHebergement() {
  log.d("ajoutHebergement - IN");
  hebergementStore.fetchHebergements();
  addHebergementOpened.value = false;
}

function testDateDebut(d) {
  log.i(props.currentIndex);
  if (props.currentIndex > 0) {
    log.i("props.currentIndex > 0");
    const precedenteDateFin =
      props.initData && props.initData[props.currentIndex - 1]?.dateFin;
    return dayjs(d).diff(dayjs(precedenteDateFin), "day") === 0;
  }
  if (props.currentIndex === 0) {
    log.i("props.currentIndex === 0");
    return dayjs(d).diff(dayjs(props.dateDebutIni), "day") === 0;
  }
  if (props.currentIndex === -1) {
    log.i("props.currentIndex === -1");
    if (props.initData.length > 0) {
      log.i("j'ai quelque chose");
      log.i(props.initData);
      const precedenteDateFin =
        props.initData && props.initData[props.initData.length - 1]?.dateFin;
      return dayjs(d).diff(dayjs(precedenteDateFin), "day") === 0;
    } else {
      log.i("j'ai rien");
      return dayjs(d).diff(dayjs(props.dateDebutIni), "day") === 0;
    }
  }
}

function testDateFin(d) {
  return (
    dayjs(props.dateFinIni).diff(dayjs(d), "day") >= 0 &&
    dayjs(d).diff(dayjs(dateDebut.value)) > 0
  );
}

async function next() {
  emit(
    "valid",
    {
      dateDebut: dateDebut.value,
      dateFin: dateFin.value,
      id: hebergementSelectionne.value,
      rejoindreEtape: rejoindreEtape.value,
    },
    props.currentIndex,
  );
}

function addHebergementOnClose() {
  addHebergementOpened.value = false;
}
</script>

<style lang="scss" scoped></style>
