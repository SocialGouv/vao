<template>
  <div>
    <h5 class="stepper-title">
      <div>Sélectionner un séjour</div>
      <UtilsDownloadFile
        label="Télécharger Formulaire EIG"
        :url="`${config.public.backendUrl}/documents/public/modele_EIG.pdf`"
        filename="eig.pdf"
      />
    </h5>
    <dsfr-alert v-if="eigStore.currentEig" class="fr-mb-6v">
      <Summary :eig="eigStore.currentEig" env="USAGER" />
    </dsfr-alert>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <DsfrTag
          v-if="eigStore.selectedDemandeLabel"
          tag-name="button"
          icon="fr-icon-delete-line"
          class="fr-mb-4v"
          :label="eigStore.selectedDemandeLabel"
          :disabled="!eigStore.canModify"
          @click="() => onRemoveDeclaration()"
        />
        <DsfrSearchBar
          v-model="search"
          label="Selectionner le séjour"
          class="fr-mb-2v"
          placeholder="Rechercher par code ou libellé"
          :disabled="!eigStore.canModify"
          @update:model-value="fetchAvailableDsDebounce($event)"
        />
        <div v-for="demande in filteredDemandes" :key="demande.id">
          <DsfrTag
            tag-name="button"
            class="fr-my-2v"
            @click="
              () => {
                onChooseDeclaration(demande.id);
              }
            "
          >
            {{ getTagSejourLibelle(demande) }}
          </DsfrTag>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <DsfrSelect
          v-if="!!eigStore.selectedDemande"
          label="Sélection du département où a eu lieu l'incident"
          name="departements"
          :close-on-select="true"
          :options="eigStore.departementsOptions"
          :is-valid="departementMeta.valid"
          :disabled="!eigStore.canModify"
          :error-message="departementErrorMessage"
          :model-value="departement"
          @update:model-value="onDepartementChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          v-if="!!eigStore.selectedDemande"
          name="date"
          type="date"
          label="Date de l'incident"
          :label-visible="true"
          :min="eigStore.selectedDemandeDateRange?.[0]"
          :max="eigStore.selectedDemandeDateRange?.[1]"
          :model-value="date"
          :readonly="!eigStore.canModify"
          :is-valid="dateMeta.valid"
          :error-message="dateErrorMessage"
          placeholder="Date de l'incident"
          @update:model-value="onDateChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="props.showButtons" class="fr-fieldset">
      <DsfrButton
        v-if="!props.isDownloading"
        id="next-step"
        label="Etape suivante"
        :disabled="!meta.valid && eigStore.canModify"
        @click.prevent="next"
      />
      <UtilsIsDownloading
        :message="props.message"
        :is-downloading="props.isDownloading"
      />
    </fieldset>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { eigModel, eigUtils, eigSchema, Summary } from "@vao/shared-ui";
import dayjs from "dayjs";
import { DsfrAlert } from "@gouvminint/vue-dsfr";
const getTagSejourLibelle = eigUtils.getTagSejourLibelle;

const config = useRuntimeConfig();

const toaster = useToaster();

const emit = defineEmits(["next", "update"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  showButtons: { type: Boolean, required: false, default: true },
});

const eigStore = useEigStore();
const route = useRoute();

const search = ref(null);

let timeout;
const fetchAvailableDsDebounce = (search) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(async () => {
    try {
      await eigStore.setAvailableDs(search);
    } catch (error) {
      toaster.error(
        "Une erreur est survenue lors de la récupération de la demande",
      );
      throw error;
    }
  }, 300);
};

const filteredDemandes = computed(() =>
  eigStore.availableDs.filter((d) => d.id !== declarationId.value),
);

const validationSchema = yup.object(eigSchema.selectionSejourSchema);
const initialValues = {
  declarationId:
    eigStore.currentEig?.declarationId ??
    (!isNaN(route.query.dsId) ? parseInt(route.query.dsId) : null),
  departement: eigStore.currentEig?.departement ?? null,
  date: eigStore.currentEig?.date
    ? dayjs(eigStore.currentEig?.date).format("YYYY-MM-DD")
    : null,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const { value: declarationId, handleChange: onDeclarationIdChange } =
  useField("declarationId");

const {
  value: departement,
  handleChange: onDepartementChange,
  errorMessage: departementErrorMessage,
  meta: departementMeta,
} = useField("departement");

const {
  value: date,
  handleChange: onDateChange,
  errorMessage: dateErrorMessage,
  meta: dateMeta,
} = useField("date");

onMounted(async () => {
  if (initialValues.declarationId) {
    await eigStore.setSelectedDemande(initialValues.declarationId);
  }
  if (!departement.value) {
    setDepartement();
  }
});

const setDepartement = () => {
  if (eigStore.departementsOptions.length === 1) {
    onDepartementChange(eigStore.departementsOptions[0]);
  } else {
    onDepartementChange(null, false);
  }
};

const onChooseDeclaration = async (id) => {
  onDeclarationIdChange(id);
  await eigStore.setSelectedDemande(id);
  search.value = null;
  await eigStore.setAvailableDs(null);
  setDepartement();
};

const onRemoveDeclaration = async () => {
  onDeclarationIdChange(null);
  await eigStore.setSelectedDemande(null);
  onDepartementChange(null, false);
  onDateChange(null, false);
};

const next = () => {
  if (!eigStore.canModify) {
    return emit("next");
  }

  if (!route.query.dsId && !meta.value.dirty) {
    return emit("next");
  }

  emit(
    "update",
    {
      ...values,
    },
    eigModel.UpdateTypes.DECLARATION_SEJOUR,
  );
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>

<style scoped lang="scss">
.stepper-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
