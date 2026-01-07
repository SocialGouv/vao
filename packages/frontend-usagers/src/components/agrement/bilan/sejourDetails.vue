<template>
  <div class="fr-container">
    <p class="fr-text fr-text--lg">
      <b>Informations sur les vacanciers</b>
    </p>
    <div class="flex-inputs">
      <div class="fr-col-4">
        <DsfrInput
          name="nbGlobalVacanciers"
          label="Nombre global de vacanciers"
          type="number"
          :model-value="nbGlobalVacanciers"
          :label-visible="true"
          :is-valid="nbGlobalVacanciersMeta.valid"
          :error-message="nbGlobalVacanciersErrorMessage"
          @update:model-value="onNbGlobalVacanciersChange"
        />
      </div>
      <div class="fr-col-4">
        <DsfrInput
          name="nbHommes"
          label="Nombre d'hommes"
          type="number"
          :model-value="nbHommes"
          :label-visible="true"
          :is-valid="nbHommesMeta.valid"
          :error-message="nbHommesErrorMessage"
          @update:model-value="onNbHommesChange"
        />
      </div>
      <div class="fr-col-4">
        <DsfrInput
          name="nbFemmes"
          label="Nombre de femmes"
          type="number"
          :model-value="nbFemmes"
          :label-visible="true"
          :is-valid="nbFemmesMeta.valid"
          :error-message="nbFemmesErrorMessage"
          @update:model-value="onNbFemmesChange"
        />
      </div>
    </div>
    <AgrementBilanTranchesAge
      ref="tranchesAgeRef"
      :tranche-age="props.bilanAnnuel?.trancheAge"
      :statut="props.agrementStatus"
      class="fr-mt-8v"
    />
    <AgrementTypeDeficiences
      ref="typeDeficiencesRef"
      :statut="props.agrementStatus"
      :type-deficiences="props.bilanAnnuel?.typeHandicap"
    />
    <hr class="fr-mt-8v fr-mb-0v" />
    <AgrementBilanHebergements
      ref="hebergementsRef"
      :agrement-bilan-annuel="props.agrementBilanAnnuel"
      :bilan-hebergement="props.bilanAnnuel?.bilanHebergement || []"
      :statut="props.agrementStatus"
    />
    <div class="fr-col-6">
      <DsfrInput
        name="nbTotalJoursVacances"
        label="Nombre total de jours de vacances"
        type="number"
        :model-value="nbTotalJoursVacances"
        :label-visible="true"
        :is-valid="nbTotalJoursVacancesMeta.valid"
        :error-message="nbTotalJoursVacancesErrorMessage"
        @update:model-value="onNbTotalJoursVacancesChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import * as yup from "yup";

const toaster = useToaster();

const props = defineProps({
  year: { type: Number, required: true },
  sejours: { type: Array, default: () => [] },
  bilanAnnuel: { type: Object, default: () => ({}) },
  agrementStatus: { type: String, required: true },
});

const tranchesAgeRef = ref(null);
const typeDeficiencesRef = ref(null);
const hebergementsRef = ref(null);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  nbGlobalVacanciers: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre de vacanciers ne peut pas être négatif.")
      .required("Ce champ est obligatoire."),
  ),
  nbHommes: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre d'hommes ne peut pas être négatif.")
      .required("Ce champ est obligatoire."),
  ),
  nbFemmes: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre de femmes ne peut pas être négatif.")
      .required("Ce champ est obligatoire."),
  ),
});

const initialValues = {
  statut: props.agrementStatus || AGREMENT_STATUT.BROUILLON,
  nbGlobalVacanciers: props.bilanAnnuel?.nbGlobalVacanciers || 0,
  nbHommes: props.bilanAnnuel?.nbHommes || 0,
  nbFemmes: props.bilanAnnuel?.nbFemmes || 0,
  nbTotalJoursVacances: props.bilanAnnuel?.nbTotalJoursVacances || 0,
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: nbGlobalVacanciers,
  errorMessage: nbGlobalVacanciersErrorMessage,
  handleChange: onNbGlobalVacanciersChange,
  meta: nbGlobalVacanciersMeta,
} = useField("nbGlobalVacanciers");

const {
  value: nbHommes,
  errorMessage: nbHommesErrorMessage,
  handleChange: onNbHommesChange,
  meta: nbHommesMeta,
} = useField("nbHommes");

const {
  value: nbFemmes,
  errorMessage: nbFemmesErrorMessage,
  handleChange: onNbFemmesChange,
  meta: nbFemmesMeta,
} = useField("nbFemmes");

const {
  value: nbTotalJoursVacances,
  errorMessage: nbTotalJoursVacancesErrorMessage,
  handleChange: onNbTotalJoursVacancesChange,
  meta: nbTotalJoursVacancesMeta,
} = useField("nbTotalJoursVacances");

const validateForm = async () => {
  let formValid = true;
  const result = await handleSubmit((values) => values)();

  const hebergements = hebergementsRef.value?.getHebergements() || [];
  const hasSejoursPourAnnee = hebergements.length > 0;

  // Validation conditionnelle des tranches d'âge
  let trancheAgeValue = [];
  if (hasSejoursPourAnnee) {
    const tranchesAgeValidation =
      await tranchesAgeRef.value?.validateTranchesAge();

    if (!tranchesAgeValidation?.valid) {
      console.error("Les tranches d'âge ne sont pas valides.");
      formValid = false;
    } else {
      trancheAgeValue = tranchesAgeValidation.value;
    }
  } else {
    // Si pas de séjours, on récupère la valeur sans valider
    trancheAgeValue = tranchesAgeRef.value?.getCurrentValue() || [];
  }

  // Validation conditionnelle du type de déficiences
  let typeDeficiencesValue = [];
  if (hasSejoursPourAnnee) {
    const typeDeficiencesValidation =
      await typeDeficiencesRef.value?.validateTypeDeficiences();

    if (!typeDeficiencesValidation?.valid) {
      console.error("Le type de déficiences n'est pas valide.");
      formValid = false;
    } else {
      typeDeficiencesValue = typeDeficiencesValidation.value;
    }
  } else {
    // Si pas de séjours, on récupère la valeur sans valider
    typeDeficiencesValue = typeDeficiencesRef.value?.getCurrentValue() || [];
  }

  // Validation des hébergements
  if (hasSejoursPourAnnee) {
    const hebergementsValid = hebergementsRef.value?.validateHebergements();
    if (!hebergementsValid) {
      console.error("Les hébergements ne sont pas valides.");
      formValid = false;
    }
  }

  if (!formValid) {
    return toaster.error({
      titleTag: "h2",
      description: `La partie séjour ${props.year} contient des erreurs. Veuillez les corriger avant de continuer.`,
    });
  }

  if (result) {
    const data = { ...result };
    delete data.statut;
    return {
      ...data,
      annee: props.year,
      trancheAge: trancheAgeValue,
      typeDeficiences: typeDeficiencesValue,
      bilanHebergement: hebergements,
    };
  }

  return result;
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
.flex-inputs {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  align-items: flex-end;
}
</style>
