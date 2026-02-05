<template>
  <div>
    <div class="headings">
      <p class="fr-mb-0">Nom de l'hébergement</p>
      <p class="fr-mb-0">Adresse de l'hébergement</p>
      <p class="fr-mb-0">Période</p>
      <p class="fr-mb-0">Nombre de vacanciers</p>
      <p></p>
    </div>
    <div v-for="(sejour, index) in sejours" :key="index">
      <HebergementDetail
        :hebergement="sejour"
        :statut="statut"
        :modifiable="props.modifiable"
        @update="updateSejour(index, $event)"
        @delete="deleteSejour(index)"
      />
    </div>
    <DsfrButton
      v-if="props.modifiable"
      class="fr-mt-2v fr-col-12 add-btn"
      type="button"
      label="Ajouter un séjour"
      secondary
      icon="fr-icon-add-line"
      @click="toggleForm"
    />
    <div v-if="showForm" class="fr-mt-2v">
      <div class="fr-mt-6v">
        <DsfrInput
          v-if="props.modifiable"
          name="nomSejour"
          type="text"
          label="Nom de l'hébergement"
          :model-value="nomSejour"
          :label-visible="true"
          :is-valid="nomSejourMeta.valid"
          :error-message="nomSejourErrorMessage"
          @update:model-value="onNomSejourChange"
        />
      </div>
      <div class="fr-mt-6v">
        <SearchAddress
          label="Adresse de l'hébergement"
          :value="adresse"
          :error-message="adresseErrorMessage"
          @select="onAdresseSelect"
        />
      </div>
      <div class="fr-mt-6v">
        <p class="fr-mb-0">Période</p>
        <AgrementBilanSelectMonths @update:selected="handleMonths" />
        <p v-if="moisMeta.touched && moisErrorMessage" class="fr-error-text">
          {{ moisErrorMessage }}
        </p>
      </div>
      <div class="fr-mt-6v">
        <DsfrInput
          name="nbVacanciers"
          type="number"
          label="Nombre de vacanciers"
          :model-value="nbVacanciers"
          :label-visible="true"
          :is-valid="nbVacanciersMeta.valid"
          :error-message="nbVacanciersErrorMessage"
          @update:model-value="onNbVacanciersChange"
        />
      </div>
      <DsfrButton
        class="fr-mt-4v fr-col-12 add-btn"
        type="button"
        label="Ajouter ce séjour"
        @click="onSubmitAddSejour"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import SearchAddress from "@/components/address/search-address.vue";
import HebergementDetail from "@/components/agrement/bilan/hebergementDetail.vue";

const props = defineProps({
  agrementId: { type: String, required: true },
  initialSejours: { type: Array, required: false, default: () => [] },
  statut: { type: String, required: false,default: "BROUILLON" },
  modifiable: { type: Boolean, default: false },
});

const sejours = ref([...props.initialSejours]);
const showForm = ref(false);

function toggleForm() {
  showForm.value = !showForm.value;
}

const validationSchema = yup.object({
  nomSejour: yup.string().required("Champ obligatoire"),
  adresse: yup
    .object({
      label: yup.string().required("L'adresse est obligatoire"),
    })
    .required("L'adresse est obligatoire"),
  nbVacanciers: yup
    .number()
    .typeError("Merci de saisir un nombre valide.")
    .required("Champ obligatoire"),
  mois: yup
    .array()
    .of(yup.string())
    .min(1, "Vous devez sélectionner au moins un mois.")
    .required("Veuillez sélectionner une période."),
});

const { handleSubmit, resetForm } = useForm({
  validationSchema,
  validateOnMount: false,
});

const {
  value: nomSejour,
  errorMessage: nomSejourErrorMessage,
  handleChange: onNomSejourChange,
  meta: nomSejourMeta,
} = useField("nomSejour");

const {
  value: nbVacanciers,
  errorMessage: nbVacanciersErrorMessage,
  handleChange: onNbVacanciersChange,
  meta: nbVacanciersMeta,
} = useField("nbVacanciers");
const { value: adresse, errorMessage: adresseErrorMessage } =
  useField("adresse");

const {
  value: mois,
  errorMessage: moisErrorMessage,
  meta: moisMeta,
} = useField("mois");

function handleMonths(monthsArray) {
  mois.value = monthsArray;
}

function onAdresseSelect(selectedAddress) {
  adresse.value = selectedAddress;
}

const onSubmitAddSejour = handleSubmit(
  (values) => {
    sejours.value.push({
      nomHebergement: values.nomSejour,
      adresse: adresse.value,
      mois: values.mois,
      nbVacanciers: values.nbVacanciers,
      agrementId: props.agrementId,
    });

    resetForm();
    showForm.value = false;
  },
  (errors) => {
    console.error("Erreurs de validation :", errors);
  },
);

function updateSejour(index, updatedSejour) {
  sejours.value[index] = updatedSejour;
}

function deleteSejour(index) {
  sejours.value.splice(index, 1);
}

const validateForm = async () => {
  try {
    return {
      sejours: sejours.value,
    };
  } catch (error) {
    console.error("Erreur lors de la validation des séjours :", error);
    throw error;
  }
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  gap: 0 0.5rem;
  margin-bottom: 1rem;
}
.add-btn {
  width: 100%;
  justify-content: center;
}
.bg-light-blue {
  background: rgba(227, 227, 253, 0.4);
}
</style>
