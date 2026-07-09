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
            <DsfrDataTableV2Wrapper
              v-model:limit="limit"
              v-model:offset="offset"
              :columns="columns"
              :data="paginatedTableData"
              :total="tableData.length"
              :table-title="`Liste des hébergements sélectionnés (${tableData.length})`"
              row-id="id"
              @update-data="updateData"
            >
              <template #cell-custom:actions="{ row }">
                <div class="buttons-group">
                  <DsfrButton
                    class="fr-icon-arrow-right-s-line"
                    primary
                    no-outline
                    type="button"
                    :title="`Voir l’hébergement ${row.nom}`"
                    :disabled="!props.modifiable"
                    :aria-label="`Voir l’hébergement ${row.nom}`"
                    @click="editNuitee(row.index)"
                  >
                    <span class="fr-sr-only">
                      Voir l’hébergement {{ row.nom }}
                    </span></DsfrButton
                  >
                  <DsfrButton
                    icon="ri:delete-bin-2-line"
                    icon-only
                    tertiary
                    no-outline
                    type="button"
                    :title="`Supprimer l’hébergement ${row.nom}`"
                    :disabled="!props.modifiable"
                    @click="removeHebergement(row.index)"
                  >
                    <span class="fr-sr-only">
                      Supprimer l’hébergement {{ row.nom }}
                    </span></DsfrButton
                  >
                </div>
              </template>
            </DsfrDataTableV2Wrapper>
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
      v-if="nuiteeOpened"
      :hebergement="hebergementCourant"
      :date-debut-ini="nextMinDate"
      :date-fin-ini="
        formatISOShort(demandeSejourStore.demandeCourante.dateFin)!
      "
      :modifiable="props.modifiable"
      @update="addNuitee"
      @cancel="onCloseNuitee"
    />
  </div>
</template>

<script setup lang="ts">
import {
  DsfrDataTableV2Wrapper,
  columnsTable,
  hebergement as hebergementUtils,
  fileUtils,
  useToaster,
} from "@vao/shared-ui";
import type { Columns } from "@vao/shared-ui";
import { useField, useForm } from "vee-validate";
import dayjs from "dayjs";
import {
  formatISOShort,
  type DemandeSejourHebergementItemDto,
} from "@vao/shared-bridge";
const getFileUploadErrorMessage = fileUtils.getFileUploadErrorMessage;

type HebergementFormValues = {
  sejourEtranger: boolean;
  hebergements: DemandeSejourHebergementItemDto[];
};

const toaster = useToaster();

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const log = logger("components/DS/hebergement-sejour");

const optionType = columnsTable.optionType;

const limit = ref(10);
const offset = ref(0);

const paginatedTableData = ref<HebergementTableRow[]>([]);

type HebergementTableRow = {
  id: number;
  index: number;
  numero: number;
  nombreNuits: string | number;
  dateDebut: string;
  dateFin: string;
  nom: string;
  adresse: string;
};

const defs: Array<
  [
    keyof HebergementTableRow | "custom:actions",
    string,
    (typeof optionType)[keyof typeof optionType],
  ]
> = [
  ["numero", "Numéro", optionType.NONE],
  ["nombreNuits", "Nombre de nuits", optionType.NONE],
  ["dateDebut", "Du", optionType.NONE],
  ["dateFin", "Au", optionType.NONE],
  ["nom", "Nom", optionType.NONE],
  ["adresse", "Adresse", optionType.NONE],
  ["custom:actions", "Actions", optionType.FIXED_RIGHT],
];

const columns = columnsTable.buildColumns(defs) as Columns<HebergementTableRow>;
const hebergementStore = useHebergementStore();
const demandeSejourStore = useDemandeSejourStore();
const nuiteeOpened = ref(false);
const currentIndex = ref(-1);

const validationSchema = computed(() => {
  return DeclarationSejour.hebergementSchema(
    demandeSejourStore.demandeCourante.dateDebut!,
    demandeSejourStore.demandeCourante.dateFin!,
  );
});

const hebergementDemande = demandeSejourStore.demandeCourante.hebergement;

const initialValues: HebergementFormValues = {
  sejourEtranger: hebergementDemande?.sejourEtranger ?? false,
  hebergements: hebergementDemande?.hebergements ?? [],
};

const { meta, values } = useForm<HebergementFormValues>({
  initialValues,
  validationSchema,
});

const {
  value: sejourEtranger,
  errorMessage: sejourEtrangerErrorMessage,
  handleChange: onSejourEtrangerChange,
  meta: sejourEtrangerMeta,
} = useField<boolean>("sejourEtranger");
const { value: hebergements, handleChange: onHebergementsChange } =
  useField<DemandeSejourHebergementItemDto[]>("hebergements");

hebergementStore.fetch({
  organismeId: demandeSejourStore.demandeCourante.organismeId,
  statut: hebergementUtils.statut.ACTIF,
});

const tableData = computed(() => {
  return hebergements.value.map((hebergement, index) => ({
    id: index,
    index,
    numero: index + 1,
    nombreNuits:
      hebergement.dateFin && hebergement.dateDebut
        ? dayjs(hebergement.dateFin).diff(dayjs(hebergement.dateDebut), "day")
        : "",
    dateDebut: hebergement.dateDebut
      ? dayjs(hebergement.dateDebut).format("DD/MM/YYYY")
      : "",
    dateFin: hebergement.dateFin
      ? dayjs(hebergement.dateFin).format("DD/MM/YYYY")
      : "",
    nom: hebergement.nom ?? "",
    adresse: hebergement.coordonnees?.adresse?.label ?? "",
  }));
});

const hebergementCourant = ref<Partial<DemandeSejourHebergementItemDto>>({});

const nextMinDate = computed(() => {
  const dateDebut = demandeSejourStore.demandeCourante.dateDebut!;

  if (currentIndex.value !== -1) {
    return dayjs(dateDebut).format("YYYY-MM-DD");
  }

  if (hebergements.value.length === 0) {
    return dayjs(dateDebut).format("YYYY-MM-DD");
  }
  return dayjs(
    Math.max(
      ...hebergements.value.map((hebergement) =>
        dayjs(hebergement.dateFin).valueOf(),
      ),
    ),
  ).format("YYYY-MM-DD");
});

function onOpenNuitee() {
  currentIndex.value = -1;
  nuiteeOpened.value = true;
  hebergementCourant.value = {};
}

function editNuitee(index: number) {
  currentIndex.value = index;
  nuiteeOpened.value = true;
  hebergementCourant.value = { ...hebergements.value[index] };
}

function onCloseNuitee() {
  nuiteeOpened.value = false;
  currentIndex.value = -1;
  hebergementCourant.value = {};
  // hebergementStore.hebergementCourant = null;
}

function sortByDate(items: DemandeSejourHebergementItemDto[]) {
  return [...items].sort(({ dateDebut: a }, { dateDebut: b }) => {
    return dayjs(a).diff(dayjs(b));
  });
}

function removeHebergement(index: number) {
  log.i("removeHebergement", { index });
  const newHebergements = hebergements.value.filter((_, i) => i !== index);
  onHebergementsChange(newHebergements);
  updateData();
}
async function addNuitee(hebergement: DemandeSejourHebergementItemDto) {
  log.d("addNuitee - In", { hebergement });
  const index = currentIndex.value;

  try {
    await hebergementStore.uploadAllFiles(
      hebergement as unknown as Record<string, unknown>,
    );
  } catch (error: unknown) {
    const uploadError = error as {
      fileName?: string;
      data?: { name?: string };
    };
    const description = getFileUploadErrorMessage(
      uploadError.fileName ?? "",
      uploadError.data?.name,
    );
    toaster.error({
      titleTag: "h2",
      description,
      role: "alert",
    });
    return;
  }

  let newHebergements;
  if (index === -1) {
    newHebergements = [...hebergements.value, hebergement];
  } else {
    newHebergements = [
      ...hebergements.value.slice(0, index),
      hebergement,
      ...hebergements.value.slice(index + 1),
    ];
  }
  onHebergementsChange(sortByDate(newHebergements));
  updateData();
  onCloseNuitee();
  log.d("addNuitee - Done");
}

const isSejourComplet = computed(() =>
  DeclarationSejour.isSejourComplet(
    hebergements.value,
    demandeSejourStore.demandeCourante.dateDebut!,
    demandeSejourStore.demandeCourante.dateFin!,
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
watch([tableData, limit, offset], () => updateData(), {
  immediate: true,
});
function updateData() {
  const rows = [...tableData.value];

  paginatedTableData.value = rows.slice(
    offset.value,
    offset.value + limit.value,
  );
}
</script>

<style lang="scss" scoped>
.buttons-group {
  display: flex;
  gap: 0.3rem;
}
</style>
