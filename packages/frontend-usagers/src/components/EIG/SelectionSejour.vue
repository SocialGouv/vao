<template>
  <div>
    <h6>Sélectionner un séjour</h6>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <DsfrTag
          v-if="selectedDemande"
          tag-name="button"
          icon="fr-icon-delete-line"
          class="fr-mb-4v"
          :label="selectedDemande"
          :disabled="!eigStore.canModify"
          @click="() => onDemandeSejourIdChange(null)"
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
          :key="demande.demandeSejourId"
        >
          <DsfrTag
            tag-name="button"
            class="fr-my-2v"
            @click="
              () => {
                onDemandeSejourIdChange(demande.demandeSejourId);
              }
            "
          >
            {{ eig.getTagSejourLibelle(demande) }}
          </DsfrTag>
        </div>
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
import { eigModel, eigSchema } from "@vao/shared";

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
        d.demandeSejourId !== demandeSejourId.value,
    )
    .slice(0, 10),
);
const selectedDemande = computed(() => {
  const demande = demandeSejourStore.demandes?.find(
    (d) => d.demandeSejourId === demandeSejourId.value,
  );
  if (!demande) {
    return null;
  }
  return eig.getTagSejourLibelle(demande);
});

const validationSchema = yup.object(eigSchema.selectionSejourSchema);
const initialValues = {
  demandeSejourId:
    eigStore.currentEig?.demandeSejourId ??
    (!isNaN(route.query.dsId) ? parseInt(route.query.dsId) : null),
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const { value: demandeSejourId, handleChange: onDemandeSejourIdChange } =
  useField("demandeSejourId");

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
