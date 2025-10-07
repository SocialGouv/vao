<template>
  <h5>Renseignements généraux</h5>
  <dsfr-alert class="fr-mb-6v">
    <Summary :eig="eigStore.currentEig" env="USAGER" />
  </dsfr-alert>
  <div class="fr-fieldset">
    <h6>Personnel présent lors de l'événement</h6>
    <div class="fr-fieldset__element">
      <div class="wrapper">
        <div class="parent">
          <!-- le select a une liste de choix qui est réactive.
          L'astuce du :key="count" permet de rest le composant a chaque selection par le user            -->
          <dsfr-select
            :key="countSelect"
            :disabled="(notSelectdPersonnes ?? []).length === 0"
            default-unselected-text="Ajouter un personnel existant"
            :options="notSelectdPersonnes"
            name="personnelExistant"
            @update:model-value="onAddExistant(JSON.parse($event))"
          />
          <div v-if="personnes && personnes.length" class="fr-my-n3v" />
          <Error
            :message="personnesErrorMessage"
            :is-error="personnesMeta.validated && !personnesMeta.valid"
          ></Error>
          <Personnes
            :key="countTable"
            :personnes="personnes ?? []"
            :show-adresse="false"
            :show-attestation="true"
            :show-competence="true"
            :show-date-naissance="true"
            :show-email="false"
            :show-fonction="false"
            :show-liste-fonction="true"
            :show-telephone="true"
            :show-button="true"
            :validate-on-mount="true"
            :headers="headers"
            :modifiable="eigStore.canModify"
            label-bouton-ajouter="Ajouter un personnel nouveau"
            @valid="personnesChange"
          />
        </div>
      </div>
    </div>
  </div>
  <h6>Les faits</h6>
  <dsfr-alert type="warning" class="fr-mb-4w"
    >Merci de ne pas mettre d'éléments nominatifs
  </dsfr-alert>
  <div class="fr-container fr-my-2v">
    <dsfr-fieldset>
      <DsfrInputGroup
        name="deroulement"
        :required="true"
        :readonly="!eigStore.canModify"
        label="Déroulement des faits (date, heure, circonstance, etc…)"
        :label-visible="true"
        :is-textarea="true"
        :model-value="deroulement"
        :error-message="deroulementMessage"
        :is-valid="deroulementMeta"
        @update:model-value="deroulementChange"
      />
    </dsfr-fieldset>
    <dsfr-fieldset>
      <DsfrInputGroup
        name="dispositionRemediation"
        :required="true"
        :readonly="!eigStore.canModify"
        label="Dispositions pour remédier aux carences, abus, ou faire cesser le danger"
        :label-visible="true"
        :is-textarea="true"
        :model-value="dispositionRemediation"
        :error-message="dispositionRemediationErrorMessage"
        :is-valid="dispositionRemediationMeta"
        @update:model-value="dispositionRemediationChange"
      />
    </dsfr-fieldset>
    <dsfr-fieldset>
      <DsfrInputGroup
        name="dispositionVictimes"
        :required="true"
        :readonly="!eigStore.canModify"
        label="Dispositions prises à l'égard de la victime, et le cas échéant, de l’auteur présumé"
        :label-visible="true"
        :is-textarea="true"
        :model-value="dispositionVictimes"
        :error-message="dispositionVictimesErrorMessage"
        :is-valid="dispositionVictimesMeta"
        @update:model-value="dispositionVictimesChange"
      />
    </dsfr-fieldset>
    <dsfr-fieldset>
      <DsfrInputGroup
        name="dispositionInformations"
        :required="true"
        :readonly="!eigStore.canModify"
        label="Dispositions prises pour l’information des familles, proches ou tuteurs légaux"
        :label-visible="true"
        :is-textarea="true"
        :model-value="dispositionInformations"
        :error-message="dispositionInformationsErrorMessage"
        :is-valid="dispositionInformationsMeta"
        @update:model-value="dispositionInformationsChange"
      />
    </dsfr-fieldset>
  </div>
  <UtilsNavigationButtons
    :show-buttons="props.showButtons"
    :is-downloading="props.isDownloading"
    :message="props.message"
    :disabled="!meta.valid"
    @next="next"
    @previous="emit('previous')"
  />
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { DsfrAlert, DsfrSelect } from "@gouvminint/vue-dsfr";
import Error from "~/components/EIG/Error.vue";
import { eigModel, eigSchema, Summary } from "@vao/shared-ui";

const emit = defineEmits(["next", "update", "previous"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  showButtons: { type: Boolean, required: false, default: true },
});

const eigStore = useEigStore();

const dsPersonnel = computed(() => [
  ...(eigStore.currentEig.accompagnants ?? []),
  ...(eigStore.currentEig.encadrants ?? []),
]);

const initialValues = {
  personnel: eigStore.currentEig.personnel ?? [],
  deroulement: eigStore.currentEig.deroulement,
  dispositionInformations: eigStore.currentEig.dispositionInformations,
  dispositionRemediation: eigStore.currentEig.dispositionRemediation,
  dispositionVictimes: eigStore.currentEig.dispositionVictimes,
};

const validationSchema = yup.object(eigSchema.informationsGeneralesSchema);

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: personnes,
  errorMessage: personnesErrorMessage,
  handleChange: personnesChange,
  meta: personnesMeta,
} = useField("personnel");
const {
  value: deroulement,
  errorMessage: deroulementMessage,
  handleChange: deroulementChange,
  meta: deroulementMeta,
} = useField("deroulement");
const {
  value: dispositionRemediation,
  errorMessage: dispositionRemediationErrorMessage,
  handleChange: dispositionRemediationChange,
  meta: dispositionRemediationMeta,
} = useField("dispositionRemediation");
const {
  value: dispositionVictimes,
  errorMessage: dispositionVictimesErrorMessage,
  handleChange: dispositionVictimesChange,
  meta: dispositionVictimesMeta,
} = useField("dispositionVictimes");
const {
  value: dispositionInformations,
  errorMessage: dispositionInformationsErrorMessage,
  handleChange: dispositionInformationsChange,
  meta: dispositionInformationsMeta,
} = useField("dispositionInformations");
const headers = [
  {
    label: "Nom",
    value: "nom",
  },
  { label: "Prénom", value: "prenom" },
];

const countSelect = ref(1);
const countTable = ref(1);

const notSelectdPersonnes = computed(() => {
  return dsPersonnel.value
    .filter((dsp) => {
      return !personnes.value
        .map((p) => p.nom + p.prenom + p.telephone)
        .includes(dsp.nom + dsp.prenom + dsp.telephone);
    })
    .map((p) => ({
      value: JSON.stringify(p),
      text: p.nom + " " + p.prenom,
    }));
});

const onAddExistant = (personne) => {
  countSelect.value += 1;
  countTable.value += 1;
  personnes.value = [...personnes.value, personne];
};

const next = () => {
  if (!eigStore.canModify) {
    return emit("next");
  }

  if (eigStore.currentEig.personnel && !meta.value.dirty) {
    return emit("next");
  }

  emit(
    "update",
    {
      ...values,
    },
    eigModel.UpdateTypes.RENSEIGNEMENT_GENERAUX,
  );
};
</script>

<style scoped>
.wrapper {
  display: inline-block;
}

.parent {
  display: flex;
  flex-direction: column;
}
</style>
