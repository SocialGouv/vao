<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Numéro d'agrément</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ props.initAgrement.numero }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Date d'obtention</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initAgrement.dateObtention
              ? dayjs(props.initAgrement.dateObtention).format("DD/MM/YYYY")
              : null
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Région d'obtention</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            regionStore.regions
              .filter((r) => r.value === props.initAgrement.regionObtention)
              .map((r) => r.text)
              .join()
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Agrément téléversé :</span>
        </div>
        <div class="fr-col-12">
          <a class="read-only-value" :href="agrementCourant?.lien">{{
            agrementCourant?.filename
          }}</a>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

const config = useRuntimeConfig();
const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const regionStore = useRegionStore();

const agrementCourant = computed(() => {
  if (props.initAgrement.file) {
    return {
      filename: props.initAgrement.file.name,
      lien: `${config.public.backendUrl}/document/${props.initAgrement.file.uuid}`,
    };
  }
});

if (!regionStore.regions || regionStore.regions.length === 0) {
  regionStore.fetch();
}
</script>

<style lang="scss" scoped></style>
