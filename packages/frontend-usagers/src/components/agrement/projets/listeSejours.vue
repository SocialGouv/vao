<template>
  <div>
    <div v-if="sejours.length > 0" class="headings">
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
          :value="adresse as AdresseDto"
          :error-message="adresseErrorMessage"
          @select="onAdresseSelect"
        />
      </div>
      <div class="fr-mt-6v">
        <p class="fr-mb-0">Période</p>
        <AgrementBilanSelectMonths
          :modifiable="props.modifiable"
          @update:selected="handleMonths"
        />
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

<script setup lang="ts">
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import { normalizeAdresse } from "@vao/shared-bridge";
import type { AdresseDto, AgrementSejoursDto } from "@vao/shared-bridge";
import * as yup from "yup";
import { useToaster } from "@vao/shared-ui";
import SearchAddress from "@/components/address/search-address.vue";
import HebergementDetail from "@/components/agrement/bilan/hebergementDetail.vue";

interface SejourFormValues {
  nomSejour: string;
  adresse: AdresseDto;
  nbVacanciers: number;
  mois: number[];
}

const log = logger("components/AgrementProjetsListeSejours");

const props = defineProps({
  agrementId: { type: Number, required: true },
  initialSejours: { type: Array, required: false, default: () => [] },
  statut: { type: String, required: false, default: "BROUILLON" },
  modifiable: { type: Boolean, default: false },
});

const toaster = useToaster();

const sejours = ref<AgrementSejoursDto[]>([
  ...(props.initialSejours as AgrementSejoursDto[]),
]);
const showForm = ref<boolean>(false);

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

const { handleSubmit, resetForm } = useForm<SejourFormValues>({
  validationSchema,
  validateOnMount: false,
});

const {
  value: nomSejour,
  errorMessage: nomSejourErrorMessage,
  handleChange: onNomSejourChange,
  meta: nomSejourMeta,
} = useField<string>("nomSejour");

const {
  value: nbVacanciers,
  errorMessage: nbVacanciersErrorMessage,
  handleChange: onNbVacanciersChange,
  meta: nbVacanciersMeta,
} = useField<number>("nbVacanciers");
const { value: adresse, errorMessage: adresseErrorMessage } =
  useField<AdresseDto>("adresse");

const {
  value: mois,
  errorMessage: moisErrorMessage,
  meta: moisMeta,
} = useField<number[]>("mois");

function handleMonths(monthsArray: number[]) {
  mois.value = monthsArray;
}

function onAdresseSelect(selectedAddress: AdresseDto) {
  adresse.value = selectedAddress;
}

const onSubmitAddSejour = handleSubmit(
  (values) => {
    try {
      const adresseNorm: AdresseDto = normalizeAdresse(values.adresse);

      sejours.value.push({
        nomHebergement: values.nomSejour,
        adresse: adresseNorm,
        mois: values.mois,
        nbVacanciers: values.nbVacanciers,
        agrementId: props.agrementId,
      });

      resetForm();
      showForm.value = false;
    } catch (error) {
      toaster.error({
        description: "L'adresse saisie est incomplète ou invalide.",
      });
      console.error("Erreur lors de l'ajout du séjour :", error);
    }
  },
  (errors) => {
    console.error("Erreurs de validation :", errors);
  },
);

function updateSejour(index: number, updatedSejour: AgrementSejoursDto) {
  sejours.value[index] = updatedSejour;
}

function deleteSejour(index: number) {
  sejours.value.splice(index, 1);
}

const validateForm = async () => {
  try {
    return {
      sejours: sejours.value,
    };
  } catch (error) {
    log.w("Erreur lors de la validation des séjours :", error);
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
