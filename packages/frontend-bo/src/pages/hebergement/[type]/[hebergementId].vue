<template>
  <div>
    <Hebergement
      :init-hebergement="hebergement"
      is-disabled
      :cdn-url="`${config.public.backendUrl}/documents/admin`"
      default-back-route="/hebergements"
    >
      <template #search="scope">
        <DsfrInputGroup
          name="coordonnees.adresse"
          :label="scope.label"
          :label-visible="true"
          placeholder=""
          hint="Exemple: Hôtel du Châtelet 127 rue de Grenelle 75007 Paris France"
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
import { Hebergement, useToaster } from "@vao/shared-ui";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const hebergementStore = useHebergementStore();

const config = useRuntimeConfig();

const zoom = 15;

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
    role: "alert",
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
      role: "alert",
    });
    navigateTo("/hebergements/tous");
  }
  throw error;
}
</script>
