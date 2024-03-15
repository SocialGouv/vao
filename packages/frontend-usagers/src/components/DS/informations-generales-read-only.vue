<template>
  <div>
    <DsfrFieldset>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Libellé</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.declarationCourante.libelle
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Date de début du séjour</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.declarationCourante.dateDebut
              ? dayjs(props.declarationCourante.dateDebut).format("DD/MM/YYYY")
              : null
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Date de fin du séjour</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.declarationCourante.dateFin
              ? dayjs(props.declarationCourante.dateFin).format("DD/MM/YYYY")
              : null
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Durée du séjour (en jours)</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.declarationCourante.duree
          }}</span>
        </div>
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Organisme">
      <OrganismePersonneMoraleReadOnly
        :init-data="props.declarationCourante.organisme.personneMorale"
        :show-responsable-sejour="false"
      ></OrganismePersonneMoraleReadOnly>
    </DsfrFieldset>
    <DsfrFieldset legend="Responsable de l'organisation du séjour">
      <PersonneReadOnly
        :personne="
          props.declarationCourante.organisme.personneMorale
            .responsableSejour ?? {}
        "
      ></PersonneReadOnly>
    </DsfrFieldset>
  </div>
</template>

<script setup>
import { DsfrFieldset } from "@gouvminint/vue-dsfr";
import dayjs from "dayjs";
const props = defineProps({
  declarationCourante: { type: Object, required: true },
});
</script>

<style lang="scss" scoped></style>
