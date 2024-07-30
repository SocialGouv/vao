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
      <template #map="scope">
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
      </template>
    </Hebergement>
  </div>
</template>

<script setup>
import { Hebergement } from "@vao/shared";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const router = useRouter();
const demandeSejourStore = useDemandeSejourStore();

const config = useRuntimeConfig();

const zoom = 16;

const hebergement = computed(() => demandeSejourStore.hebergement);

const toaster = useToaster();
const demandeSejourId = parseInt(route.params.demandeSejourId, 10);
const hebergementId = parseInt(route.params.hebergementId, 10);
if (isNaN(demandeSejourId) || isNaN(hebergementId)) {
  toaster.error("Cet hébergement n'existe pas");
  router.push("/hebergements");
}
try {
  await demandeSejourStore.getHebergement(
    route.params.demandeSejourId,
    route.params.hebergementId,
  );
} catch (error) {
  if (error?.response?.status === 404) {
    toaster.error("Cet hébergement n'existe pas");
    router.push("/hebergements");
  }
  throw error;
}
</script>
