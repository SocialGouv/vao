<template>
  <div>
    <h6>Sélectionner un séjour</h6>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element">
        <DsfrTag
          v-if="selectedDemandeLabel"
          tag-name="button"
          icon="fr-icon-delete-line"
          class="fr-mb-4v"
          :label="selectedDemandeLabel"
          :disabled="!eigStore.canModify"
          @click="() => onDeclarationIdChange(null)"
        />
        <DsfrSearchBar
          label="Selectionner le séjour"
          class="fr-mb-2v"
          :model-value="search"
          placeholder="Rechercher par code ou libellé"
          :disabled="!eigStore.canModify"
          @update:model-value="search = $event"
        />
        <div
          v-for="demande in search.length > 0 ? filteredDemandes : []"
          :key="demande.declarationId"
        >
          <DsfrTag
            tag-name="button"
            class="fr-my-2v"
            @click="
              () => {
                onDeclarationIdChange(demande.declarationId);
                search = '';
              }
            "
          >
            {{ getTagSejourLibelle(demande) }}
          </DsfrTag>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <DsfrSelect
          v-if="!!selectedDemande"
          label="Selection du département ou a eu lieu l'EIG"
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
    </div>
    <div v-if="props.showButtons" class="fr-fieldset">
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
    </div>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { eigModel, eigSchema } from "@vao/shared";
import { getTagSejourLibelle } from "@vao/shared/src/utils/eigUtils";

const emit = defineEmits(["next", "update"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  showButtons: { type: Boolean, required: false, default: true },
});

const eigStore = useEigStore();
const demandeSejourStore = useDemandeSejourStore();
demandeSejourStore.fetchDemandes();

const search = ref("");

const route = useRoute();

const filteredDemandes = computed(() =>
  demandeSejourStore.demandes
    .filter(
      (d) =>
        eig.isDeclarationligibleToEig(d) &&
        (new RegExp(search.value, "i").test(d.idFonctionnelle) ||
          new RegExp(search.value, "i").test(d.libelle)) &&
        d.declarationId !== declarationId.value,
    )
    .slice(0, 10),
);
const selectedDemande = computed(() => {
  return (
    demandeSejourStore.demandes?.find(
      (d) => d.declarationId === declarationId.value,
    ) ?? null
  );
});

const selectedDemandeLabel = computed(() => {
  if (!selectedDemande.value) {
    return null;
  }
  return getTagSejourLibelle(selectedDemande.value);
});

const departementsOptions = computed(
  () =>
    selectedDemande.value?.hebergements?.hebergements
      ?.map((h) => h?.coordonnees?.adresse?.departement)
      .filter((d) => !!d) ?? [],
);

const validationSchema = yup.object(eigSchema.selectionSejourSchema);
const initialValues = {
  declarationId:
    eigStore.currentEig?.declarationId ??
    (!isNaN(route.query.dsId) ? parseInt(route.query.dsId) : null),
  departement: eigStore.currentEig?.departement ?? null,
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
</script>

<style scoped lang="scss"></style>
