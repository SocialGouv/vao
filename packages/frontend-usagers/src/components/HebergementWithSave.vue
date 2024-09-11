<template>
  <Hebergement
    :init-hebergement="props.initHebergement"
    :is-disabled="props.isDisabled"
    :label-next="props.labelNext"
    :is-downloading="props.isDownloading"
    :message="props.message"
    :is-save-visible="props.isSaveVisible"
    :default-back-route="props.defaultBackRoute"
    :cdn-url="props.cdnUrl"
    @submit="submit"
    @cancel="cancel"
  >
    <template #search="scope">
      <SearchAddress
        name="coordonnees.adresse"
        :value="scope.adresse"
        :label="scope.label"
        :initial-adress="scope.initialAdress"
        :error-message="scope.errorMessage"
        @select="(value) => scope.onAddresseChange(value)"
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
</template>

<script setup>
import { Hebergement } from "@vao/shared";

const config = useRuntimeConfig();

const zoom = 15;

const props = defineProps({
  initHebergement: {
    type: Object,
    default: () => ({}),
  },
  isDisabled: { type: Boolean, default: false },
  labelNext: { type: String, default: "Ajouter hébergement" },
  isDownloading: { type: Boolean, default: false },
  message: { type: String, required: false, default: null },
  isSaveVisible: { type: Boolean, default: false },
  defaultBackRoute: { type: String, required: true },
  cdnUrl: { type: String, required: true },
});

const emit = defineEmits(["cancel", "submit"]);

const submit = (hebergement) => {
  emit("submit", hebergement);
};

const cancel = () => {
  emit("cancel");
};
</script>
