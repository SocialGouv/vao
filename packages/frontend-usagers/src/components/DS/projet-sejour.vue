<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <DsfrFieldset>
      <DsfrCheckboxSet
        v-model="destination"
        name="destination"
        legend="Destination"
        :disabled="!props.modifiable"
        :inline="true"
        :options="projetSejour.destinationOptions"
        :error-message="destinationErrorMessage"
        :small="true"
      />
    </DsfrFieldset>
    <DsfrFieldset legend="Activités spécifiques proposées">
      <UtilsMultiSelect
        label="Sports et loisirs (optionnel)"
        :options="projetSejour.sportOptions"
        :values="activitesSportives"
        :modifiable="props.modifiable"
        :is-valid="activitesSportivesMeta.valid"
        :error-message="activitesSportivesErrorMessage"
        @update="addActiviteSport"
      ></UtilsMultiSelect>
      <UtilsMultiSelect
        label="Culture et découverte (optionnel)"
        :options="projetSejour.cultureOptions"
        :values="activitesCulturelles"
        :modifiable="props.modifiable"
        :is-valid="activitesCulturellesMeta.valid"
        :error-message="activitesCulturellesErrorMessage"
        @update="addActiviteCulture"
      ></UtilsMultiSelect>
      <UtilsMultiSelect
        label="Bien être (optionnel)"
        :options="projetSejour.bienEtreOption"
        :values="activitesBienEtre"
        :modifiable="props.modifiable"
        :is-valid="activitesBienEtreMeta.valid"
        :error-message="activitesBienEtreErrorMessage"
        @update="addActivitesBienEtre"
      ></UtilsMultiSelect>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="activitesPersonnelPrevu"
          :readonly="!props.modifiable"
          label="Personnel ou organisme prévu le cas échéant pour encadrer les activités spécifiques (optionnel)"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="activitesPersonnelPrevu"
          :error-message="activitesPersonnelPrevuErrorMessage"
          :is-valid="activitesPersonnelPrevuMeta.valid"
          @update:model-value="onactivitesPersonnelPrevuChange"
        />
      </div>
    </DsfrFieldset>
    <UtilsNavigationButtons
      :show-buttons="props.showButtons"
      :is-downloading="props.isDownloading"
      :message="props.message"
      @next="next"
      @previous="emit('previous')"
    />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const log = logger("components/DS/projet-sejour");

const validationSchema = yup.object(projetSejour.schema);

const initialValues = {
  destination: [],
  activitesCulturelles: [],
  activitesSportives: [],
  activitesBienEtre: [],
  ...props.initData,
};
const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
});

function addActiviteSport(liste) {
  log.d("addActiviteSport", liste);
  activitesSportives.value = liste;
}

function addActiviteCulture(liste) {
  activitesCulturelles.value = liste;
}

function addActivitesBienEtre(liste) {
  activitesBienEtre.value = liste;
}

const { value: destination, errorMessage: destinationErrorMessage } =
  useField("destination");
const {
  value: activitesSportives,
  meta: activitesSportivesMeta,
  errorMessage: activitesSportivesErrorMessage,
} = useField("activitesSportives");
const {
  value: activitesCulturelles,
  meta: activitesCulturellesMeta,
  errorMessage: activitesCulturellesErrorMessage,
} = useField("activitesCulturelles");
const {
  value: activitesBienEtre,
  meta: activitesBienEtreMeta,
  errorMessage: activitesBienEtreErrorMessage,
} = useField("activitesBienEtre");
const {
  value: activitesPersonnelPrevu,
  meta: activitesPersonnelPrevuMeta,
  errorMessage: activitesPersonnelPrevuErrorMessage,
  handleChange: onactivitesPersonnelPrevuChange,
} = useField("activitesPersonnelPrevu");

function next() {
  if (
    (!meta.value.dirty && Object.keys(props.initData).length !== 0) ||
    !props.modifiable
  ) {
    return emit("next");
  }
  emit("update", { ...values }, "projetSejour");
}
</script>

<style lang="scss" scoped></style>
