<template>
  <div>
    <Hebergement
      :init-hebergement="hebergement"
      is-disabled
      :cdn-url="`${config.public.backendUrl}/documents/`"
      default-back-route="/hebergements"
    >
      <template #search="scope">
        <DsfrInputGroup
          name="coordonnees.adresse"
          :label="scope.label"
          :label-visible="true"
          placeholder=""
          :model-value="scope.adresse.label"
          disabled
        />
      </template>
      <!-- <template #map="scope">
        <div style="height: 50vh">
          <LMap
            ref="map"
            :zoom="zoom"
            :center="scope.markers"
            :use-global-leaflet="false"
            style="z-index: 0"
          >
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&amp;copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              layer-type="base"
              name="OpenStreetMap"
            />
            <LMarker :lat-lng="scope.markers"></LMarker>
          </LMap>
        </div>
      </template> -->
    </Hebergement>
  </div>
</template>

<script setup>
import { Hebergement } from "@vao/shared";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const hebergementStore = useHebergementStore();

const config = useRuntimeConfig();

// const zoom = 16;

if (route.params.type !== "tous") {
  navigateTo({
    replace: true,
    params: { ...route.params, type: "tous" },
  });
}

const hebergement = computed(() => hebergementStore.hebergement);

const toaster = useToaster();
const hebergementId = parseInt(route.params.hebergementId, 10);
if (isNaN(hebergementId)) {
  toaster.error({
    titleTag: "h2",
    description: "Cet hébergement n'existe pas",
  });
  navigateTo("/hebergements/tous");
}
try {
  await hebergementStore.getHebergement(route.params.hebergementId);
} catch (error) {
  if (error?.response?.status === 404) {
    toaster.error({
      titleTag: "h2",
      description: "Cet hébergement n'existe pas",
    });
    navigateTo("/hebergements/tous");
  }
  throw error;
}
</script>
