<template>
  <TitleWithIcon
    icon="fr-icon-map-pin-2-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Séjours prévus
  </TitleWithIcon>
  <p class="light-decisions-text-text-default-info fr-text--xs">
    <span class="fr-icon-info-fill" aria-hidden="true"></span>
    Ces informations sont recueillies à titre indicatif et n’ont pas de valeur
    contractuelles. <br />
    <span class="fr-ml-6v"
      >Seuls les séjours accueillant plus de 3 vacanciers et ayant une durée
      supérieure à 5 jours doivent être déclarés dans ce formulaire.</span
    >
  </p>
  <p>sejours ici</p>
  <hr />
  <p><b>Informations sur les vacanciers</b></p>
  <AgrementTypeDeficiences ref="typeDeficiencesRef" />
  <hr />
  <p class="fr-mb-1v"><b>Informations complémentaires</b></p>
  <p class="fr-hint-text fr-mb-0">
    Nombre de séjours envisagés l’année suivante (optionnel)
  </p>
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
</template>
<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { useForm, useField } from "vee-validate";

const typeDeficiencesRef = ref(null);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  nbTotalJoursVacances: requiredUnlessBrouillon(
    yup
      .number()
      .typeError("Merci de saisir un nombre valide.")
      .min(0, "Le nombre de jours de vacances ne peut pas être négatif.")
      .required("Ce champ est obligatoire."),
  ),
});

const {
  value: nbTotalJoursVacances,
  errorMessage: nbTotalJoursVacancesErrorMessage,
  handleChange: onNbTotalJoursVacancesChange,
  meta: nbTotalJoursVacancesMeta,
} = useField("nbTotalJoursVacances");

const initialValues = {
  statut: AGREMENT_STATUT.BROUILLON,
  nbTotalJoursVacances: 0,
};

const validateForm = async () => {
  let formValid = true;
  const result = await handleSubmit((values) => values)();

  // Validation du type de déficiences
  const typeDeficiencesValidation =
    await typeDeficiencesRef.value?.validateTypeDeficiences();

  if (!typeDeficiencesValidation?.valid) {
    console.error("Le type de déficiences n'est pas valide.");
    formValid = false;
  }

  if (!formValid) {
    return toaster.error({
      titleTag: "h2",
      description: `La partie séjour contient des erreurs. Veuillez les corriger avant de continuer.`,
    });
  }

  if (result) {
    const data = { ...result };
    delete data.statut;
    return {
      ...data,
      typeDeficiences: typeDeficiencesValidation.value,
    };
  }
  console.log("Validation result:", result);
  return result;
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

defineExpose({
  validateForm,
  // isValid: () => meta.value.valid, // Optionnel : pour vérifier la validité
});
</script>
