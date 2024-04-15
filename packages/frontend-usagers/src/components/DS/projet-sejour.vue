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
    </DsfrFieldset>
    <DsfrFieldset v-if="props.showButtons">
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
    </DsfrFieldset>
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
});

const emit = defineEmits(["previous", "next", "update"]);

const log = logger("components/DS/projet-sejour");

const validationSchema = yup.object(projetSejour.schema);

const initialValues = {
  destination: [],
  activitesCulturelles: [],
  activitesSportives: [],
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

function next() {
  if (!meta.value.dirty && Object.keys(props.initData).length !== 0) {
    return emit("next");
  }
  emit(
    "update",
    { ...values, meta: meta.value.valid },
    "informationsProjetSejour",
  );
}
</script>

<style lang="scss" scoped></style>
