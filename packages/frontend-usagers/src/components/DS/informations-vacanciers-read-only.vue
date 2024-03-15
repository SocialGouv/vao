<template>
  <div>
    <DsfrFieldset>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label"
            >Effectif prévisionnel des vacanciers
          </span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.infoVacanciers?.effectifPrevisionnel
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Femmes</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.infoVacanciers?.effectifPrevisionnelFemme
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Hommes</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.infoVacanciers?.effectifPrevisionnelHomme
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Tranches d'âge</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            informationsVacanciers.trancheAgeOptions
              .filter((trancheAge) => {
                return props.infoVacanciers?.trancheAge?.includes(
                  trancheAge.name,
                );
              })
              .map((trancheAge) => trancheAge.label)
              .join(", ")
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Types de déficiences</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            informationsVacanciers.typeDeficiencesOptions
              .filter((type) => {
                return props.infoVacanciers?.typeDeficiences?.includes(
                  type.name,
                );
              })
              .map((type) => type.label)
              .join(", ")
          }}</span>
        </div>
      </div>
    </DsfrFieldset>
  </div>
</template>

<script setup>
const props = defineProps({
  infoVacanciers: { type: Object, required: true },
});
</script>

<style lang="scss" scoped></style>
