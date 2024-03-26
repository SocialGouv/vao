<template>
  <div>
    <DsfrFieldset>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          v-model="destination"
          name="destination"
          legend="Destination"
          :disabled="!props.modifiable"
          :inline="true"
          :options="projetSejour.destinationOptions"
          :small="true"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Activités spécifiques proposées">
      <div class="fr-fieldset__element fr-col-12">
        <UtilsMultiSelect
          :options="projetSejour.sportOptions"
          :values="activitesSportives"
          :modifiable="props.modifiable"
          label="Sports et loisirs"
          @update="addActiviteSport"
        ></UtilsMultiSelect>
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <UtilsMultiSelect
          :options="projetSejour.cultureOptions"
          :values="activitesCulturelles"
          :modifiable="props.modifiable"
          label="Culture et découverte"
          @update="addActiviteCulture"
        ></UtilsMultiSelect>
      </div>
    </DsfrFieldset>
    <DsfrFieldset>
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
});

function addActiviteSport(liste) {
  log.d("addActiviteSport", liste);
  activitesSportives.value = liste;
}

function addActiviteCulture(liste) {
  activitesCulturelles.value = liste;
}

const { value: destination } = useField("destination");
const { value: activitesSportives } = useField("activitesSportives");
const { value: activitesCulturelles } = useField("activitesCulturelles");

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
