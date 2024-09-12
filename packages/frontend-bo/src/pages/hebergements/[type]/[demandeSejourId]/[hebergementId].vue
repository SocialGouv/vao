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
        <div style="height: 50vh">
          <MglMap
            :map-style="`https://api.maptiler.com/maps/streets/style.json?key=${config.public.apiMapTiler}`"
            :zoom="zoom"
            :center="scope.markers"
          >
            <MglNavigationControl />
            <MglMarker :coordinates="scope.markers" />
          </MglMap>
        </div>
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
const demandeSejourStore = useDemandeSejourStore();

const config = useRuntimeConfig();

const zoom = 15;

if (route.params.type !== "lies-a-des-sejours") {
  navigateTo({
    replace: true,
    params: { ...route.params, type: "lies-a-des-sejours" },
  });
}

const hebergement = computed(() => demandeSejourStore.hebergement);

const toaster = useToaster();
const demandeSejourId = parseInt(route.params.demandeSejourId, 10);
const hebergementId = parseInt(route.params.hebergementId, 10);
if (isNaN(demandeSejourId) || isNaN(hebergementId)) {
  toaster.error({
    titleTag: "h2",
    description: "Cet hébergement n'existe pas",
  });
  navigateTo("/hebergements/lies-a-des-sejours");
}
try {
  await demandeSejourStore.getHebergement(
    route.params.demandeSejourId,
    route.params.hebergementId,
  );
} catch (error) {
  if (error?.response?.status === 404) {
    toaster.error({
      titleTag: "h2",
      description: "Cet hébergement n'existe pas",
    });
    navigateTo("/hebergements/lies-a-des-sejours");
  }
  throw error;
}
</script>
