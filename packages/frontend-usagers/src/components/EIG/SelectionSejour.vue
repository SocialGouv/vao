<template>
  <div>
    <h5>Sélectionner un séjour</h5>
    <dsfr-alert v-if="eigStore.currentEig" class="fr-mb-6v">
      <Summary :eig="eigStore.currentEig" env="USAGER" />
    </dsfr-alert>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <DsfrTag
          v-if="selectedDemandeLabel"
          tag-name="button"
          icon="fr-icon-delete-line"
          class="fr-mb-4v"
          :label="selectedDemandeLabel"
          :disabled="!eigStore.canModify"
          @click="() => onChooseDeclaration(null)"
        />
        <DsfrSearchBar
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
                eigStore.setSelectedDemande(demande.id);
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
          :options="departementsOptions"
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
          :min="selectedDemandeDateRange?.[0]"
          :max="selectedDemandeDateRange?.[1]"
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
    <pre>{{ departementsOptions }}</pre>
    <pre>{{ selectedDemandeDateRange }}</pre>

  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { eigModel, eigSchema, Summary } from "@vao/shared";
import { getTagSejourLibelle } from "@vao/shared/src/utils/eigUtils";
import dayjs from "dayjs";
import { DsfrAlert } from "@gouvminint/vue-dsfr";

const toaster = useToaster();

const emit = defineEmits(["next", "update"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  showButtons: { type: Boolean, required: false, default: true },
});

const eigStore = useEigStore();
const route = useRoute();

let timeout;
const fetchAvailableDsDebounce = (search) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(async () => {
    try {
      await eigStore.getAvailableDs(search);
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

const selectedDemandeLabel = computed(() => {
  if (!eigStore.selectedDemande) {
    return null;
  }
  return getTagSejourLibelle(eigStore.selectedDemande);
});

const selectedDemandeDateRange = computed(() => {
  if (!eigStore.selectedDemande) {
    return null;
  }
  return [eigStore.selectedDemande.dateDebut, eigStore.selectedDemande.dateFin];
});

const departementsOptions = computed(
  () =>
    eigStore.selectedDemande?.hebergement?.hebergements
      ?.map((h) => h?.coordonnees?.adresse?.departement)
      .filter((d) => !!d) ?? [],
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

onMounted(() => {
  if (initialValues.declarationId) {
    eigStore.setSelectedDemande(initialValues.declarationId);
  }

  if (!departement.value) {
    setDepartement();
  }
});

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

const setDepartement = () => {
  if (departementsOptions.value.length === 1) {
    onDepartementChange(departementsOptions.value[0]);
  } else {
    onDepartementChange(null, false);
  }
};

const {
  value: date,
  handleChange: onDateChange,
  errorMessage: dateErrorMessage,
  meta: dateMeta,
} = useField("date");

const onChooseDeclaration = (id) => {
  onDeclarationIdChange(id);
  eigStore.setSelectedDemande(null);
  setDepartement();
  if (id == null) {
    onDateChange(null, false);
  }
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

<style scoped lang="scss"></style>
