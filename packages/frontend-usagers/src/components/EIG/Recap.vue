<template>
  <h5>Informations de séjour</h5>
  <EIGError
    :is-error="
      Object.keys(errors ?? {}).some(
        (err) => err.match('precision') || err.match('type'),
      )
    "
    message="Erreur dans la selection des types"
  ></EIGError>
  <EIGSummary />
  <h5>Personnel présent lors des événement</h5>
  <EIGError
    :is-error="!!errors.personnel"
    :message="` Erreur dans la selection des personnels : ${errors.personnel}`"
  ></EIGError>
  <Personnes
    :personnes="eigStore.currentEig.personnel ?? []"
    :show-adresse="false"
    show-attestation
    show-competence
    show-date-naissance
    :show-email="false"
    :show-fonction="false"
    show-liste-fonction
    show-telephone
    show-button
    validate-on-mount
    :headers="headers"
    :modifiable="false"
    label-bouton-ajouter="Ajouter un personnel"
  />
  <h5>Les faits</h5>
  <h6>Déroulement des faits (date, heure, circonstance, etc…)</h6>
  <EIGError
    :is-error="!!errors.deroulement"
    :message="` Erreur dans la description du déroulement des faits: ${errors.deroulement}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.deroulement }}</article>
  <h6>
    Dispositions pour remédier aux carences, abus, ou faire cesser le danger
  </h6>
  <EIGError
    :is-error="!!errors.dispositionRemediation"
    :message="` Erreur dans la description des dispositions pour remédier aux carences, abus, ou faire cesser le danger : ${errors.dispositionRemediation}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.dispositionRemediation }}</article>
  <h6>
    Dispositions prises à l'égard de la victime, et le cas échéant, de l’auteur
    présumé
  </h6>
  <EIGError
    :is-error="!!errors.dispositionVictimes"
    :message="` Erreur dans la description des dispositions prises à l'égard de la victime : ${errors.dispositionVictimes}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.dispositionVictimes }}</article>
  <h6>
    Dispositions prises pour l’information des familles, proches ou tuteurs
    légaux
  </h6>
  <EIGError
    :is-error="!!errors.dispositionInformations"
    :message="` Erreur dans la description des dispositions prises pour l’information : ${errors.dispositionInformations}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.dispositionInformations }}</article>
</template>

<script setup>
import * as yup from "yup";
import { useForm } from "vee-validate";
import { eigSchema } from "@vao/shared";

const eigStore = useEigStore();

const validationSchema = yup.object(eigSchema.syntheseSchema);
const initialValues = {
  ...eigStore.currentEig,
};

const { errors } = useForm({
  initialValues,
  validationSchema: validationSchema,
  validateOnMount: true,
});

const headers = [
  {
    label: "Nom",
    value: "nom",
  },
  { label: "Prénom", value: "prenom" },
];
</script>

<style scoped lang="scss">
h5 {
  margin-top: 1.5rem;
}
</style>
