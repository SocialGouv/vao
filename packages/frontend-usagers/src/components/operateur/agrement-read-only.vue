<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Numéro d'agrément</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{ props.initData?.numero }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Date de délivrance</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            props.initData?.dateObtention
              ? dayjs(props.initData?.dateObtention).format("DD/MM/YYYY")
              : null
          }}</span>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-col-12">
          <span class="read-only-label">Région de délivrance</span>
        </div>
        <div class="fr-col-12">
          <span class="read-only-value">{{
            regionStore.regions
              .filter((r) => r.value === props.initData?.regionDelivrance)
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
import { useRegionStore } from "@/stores/referentiels";

const config = useRuntimeConfig();
const log = logger("components/operateur/agrement-read-only");
const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const regionStore = useRegionStore();

const agrementCourant = computed(() => {
  if (props.initData) {
    return {
      filename: props.initData?.filename,
      lien: `${config.public.backendUrl}/document/${props.initData?.uuid}`,
    };
  }
});

if (!regionStore.regions || regionStore.regions.length === 0) {
  regionStore.fetch();
}
</script>

<style lang="scss" scoped></style>
