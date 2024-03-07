<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nom de naissance</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ initData.nomNaissance }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Nom d'usage</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ initData.nomUsage }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Prénom</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ initData.prenom }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Profession</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ initData.profession }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Téléphone</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ initData.telephone }}</span>
        </div>
      </div>
    </fieldset>

    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Adresse du domicile</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            initData.adresseDomicile?.label
          }}</span>
        </div>
      </div>
      <div v-if="initData.adresseIdentique" class="fr-col-12">
        <span class="read-only-label"
          >L'adresse du siège des activités de VAO est aussi celle du
          domicile.</span
        >
      </div>
      <template v-else>
        <div class="fr-fieldset__element">
          <div class="fr-col-12">
            <span class="read-only-label">Adresse du siège</span>
          </div>
          <div class="fr-col-12">
            <span class="read-only-value">{{
              initData?.adresseSiege.label
            }}</span>
          </div>
        </div>
      </template>
    </fieldset>
  </div>
</template>

<script setup>
defineProps({
  initData: { type: Object, default: null, required: true },
});
</script>

<style lang="scss" scoped></style>
