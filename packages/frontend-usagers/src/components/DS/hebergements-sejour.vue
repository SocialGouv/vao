<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <div v-if="!nuiteeOpened">
      <div class="fr-fieldset">
        <div class="fr-fieldset__element fr-col-12">
          <div>
            <DsfrTable
              title="Liste des hébergements sélectionnés"
              :headers="headers"
              :rows="syntheseRows"
            />
          </div>
          <DsfrButton
            v-if="props.modifiable"
            label="Ajouter une fiche hébergement"
            :disabled="isSejourComplet"
            @click.prevent="onOpenNuitee"
          />
        </div>
      </div>

      <div class="fr-fieldset">
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="sejourItinerant"
              legend="Séjour itinerant"
              disabled
              :model-value="hebergements.length > 1"
              :options="ouiNonOptions"
              :inline="true"
            />
          </div>
        </div>
        <div
          v-if="hebergements.length > 1"
          class="fr-fieldset__element fr-col-12"
        >
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="sejourEtranger"
              legend="Séjour à l'étranger"
              :readonly="!props.modifiable"
              :model-value="sejourEtranger"
              :options="ouiNonOptions"
              :is-valid="sejourEtrangerMeta"
              :inline="true"
              :error-message="sejourEtrangerErrorMessage"
              @update:model-value="onSejourEtrangerChange"
            />
          </div>
        </div>
      </div>

      <UtilsNavigationButtons
        :show-buttons="props.showButtons"
        :is-downloading="props.isDownloading"
        :message="props.message"
        @next="next"
        @previous="emit('previous')"
      />
    </div>
    <DSHebergementsSejourDetail
      v-else
      :hebergement="hebergementCourant"
      :date-debut-ini="nextMinDate"
      :date-fin-ini="
        dayjs(demandeSejourStore.demandeCourante.dateFin).format('YYYY-MM-DD')
      "
      :modifiable="props.modifiable"
      @update="addNuitee"
      @cancel="onCloseNuitee"
    />
  </div>
</template>

<script setup>
import { DsfrButtonGroup } from "@gouvminint/vue-dsfr";
import { useField, useForm } from "vee-validate";
import dayjs from "dayjs";

const toaster = useToaster();

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const log = logger("components/DS/hebergement-sejour");

const headers = [
  "Numéro",
  "Nombre de nuits",
  "Du",
  "Au",
  "Nom",
  "Adresse",
  "Actions",
];
const hebergementStore = useHebergementStore();
const demandeSejourStore = useDemandeSejourStore();
const nuiteeOpened = ref(false);
const currentIndex = ref(-1);

const validationSchema = computed(() => {
  return DeclarationSejour.hebergementSchema(
    demandeSejourStore.demandeCourante.dateDebut,
    demandeSejourStore.demandeCourante.dateFin,
  );
});

const initialValues = {
  sejourEtranger:
    demandeSejourStore.demandeCourante.hebergement?.sejourEtranger ?? false,
  hebergements:
    demandeSejourStore.demandeCourante.hebergement?.hebergements ?? [],
};

const { meta, values } = useForm({
  initialValues,
  validationSchema,
});

const {
  value: sejourEtranger,
  errorMessage: sejourEtrangerErrorMessage,
  handleChange: onSejourEtrangerChange,
  meta: sejourEtrangerMeta,
} = useField("sejourEtranger");
const { value: hebergements, handleChange: onHebergementsChange } =
  useField("hebergements");

hebergementStore.fetch({
  organismeId: demandeSejourStore.demandeCourante.organismeId,
});

const syntheseRows = computed(() => {
  if (hebergementStore.hebergements.length > 0) {
    return hebergements.value.map((hebergement, index) => {
      const buttons = [
        {
          icon: "ri:delete-bin-2-line",
          iconOnly: true,
          tertiary: true,
          noOutline: true,
          disabled: !props.modifiable,
          onClick: (event) => {
            event.stopPropagation();
            removeHebergement(index);
          },
        },
      ];

      const rows = [
        `${index + 1}`,
        hebergement.dateFin && hebergement.dateDebut
          ? dayjs(hebergement.dateFin)
              .diff(dayjs(hebergement.dateDebut), "day")
              .toString()
          : "",
        hebergement.dateDebut
          ? dayjs(hebergement.dateDebut).format("DD/MM/YYYY")
          : "",
        hebergement.dateFin
          ? dayjs(hebergement.dateFin).format("DD/MM/YYYY")
          : "",
        hebergement.nom ?? "",
        hebergement.coordonnees?.adresse?.label ?? "",
        {
          component: DsfrButtonGroup,
          buttons: buttons,
        },
      ];
      return {
        rowData: rows,
        rowAttrs: {
          class: "pointer",
          onClick: () => editNuitee(index),
        },
      };
    });
  } else return [];
});

const hebergementCourant = ref();

const nextMinDate = computed(() => {
  if (currentIndex.value !== -1) {
    return dayjs(demandeSejourStore.demandeCourante.dateDebut).format(
      "YYYY-MM-DD",
    );
  }

  if (hebergements.value.length === 0) {
    return dayjs(demandeSejourStore.demandeCourante.dateDebut).format(
      "YYYY-MM-DD",
    );
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

function editNuitee(index) {
  currentIndex.value = index;
  nuiteeOpened.value = true;
  hebergementCourant.value = hebergements.value[index];
}

function onCloseNuitee() {
  nuiteeOpened.value = false;
  currentIndex.value = -1;
  hebergementCourant.value = null;
}

function sortByDate(hebergements) {
  return hebergements.sort(({ dateDebut: a }, { dateDebut: b }) => {
    return dayjs(a).diff(dayjs(b));
  });
}

function removeHebergement(index) {
  log.i("removeHebergement", { index });
  hebergements.value.splice(index);
  onHebergementsChange(hebergements.value);
}

async function addNuitee(hebergement) {
  log.d("addNuitee - In", { hebergement });
  let newHebergements;

  try {
    await hebergementStore.updaloadFiles(hebergement);
  } catch (e) {
    toaster.error({
      titleTag: "h2",
      description: e.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    });
    return;
  }

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
  log.d("addNuitee - Done");
}

const isSejourComplet = computed(() =>
  DeclarationSejour.isSejourComplet(
    hebergements.value,
    demandeSejourStore.demandeCourante.dateDebut,
    demandeSejourStore.demandeCourante.dateFin,
  ),
);

async function next() {
  if (!meta.value.dirty || !props.modifiable) {
    return emit("next");
  }
  const data = {
    ...toRaw(values),
    sejourItinerant: hebergements.value.length > 1,
    nombreHebergements: hebergements.value.length,
  };
  emit("update", data, "hebergements");
}
</script>

<style lang="scss" scoped></style>
