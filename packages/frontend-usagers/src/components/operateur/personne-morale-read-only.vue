<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Numéro SIRET</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ siretDisplayed }}</span>
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Raison sociale</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ initData.raisonSociale }}</span>
        </div>
      </div>
    </fieldset>
    <div v-if="initData.siegeSocial">
      <div class="fr-col-12">
        <span class="read-only-label">Représentants légaux</span>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <PersonnesReadOnly :personnes="props.initData.representantsLegaux">
          </PersonnesReadOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const siretDisplayed = computed(() => {
  if (!props.initData.siret) {
    return "";
  }
  const siretSaisi = props.initData.siret;
  let formatedSiret;
  for (let i = 0; i < siretSaisi.length; i++) {
    i === 0
      ? (formatedSiret = siretSaisi[i])
      : (formatedSiret = formatedSiret + siretSaisi[i]);
    switch (i) {
      case 2:
        formatedSiret = formatedSiret + " ";
        break;
      case 5:
        formatedSiret = formatedSiret + " ";
        break;
      case 8:
        formatedSiret = formatedSiret + " ";
        break;
    }
  }
  return formatedSiret;
});
</script>

<style lang="scss" scoped></style>
