<template>
  <Hebergement
    :init-hebergement="props.initHebergement"
    :is-disabled="props.isDisabled"
    :label-next="props.labelNext"
    :is-downloading="props.isDownloading"
    :message="props.message"
    :is-save-visible="props.isSaveVisible"
    :default-back-route="props.defaultBackRoute"
    :mode-brouillon-activated="props.modeBrouillonActivated"
    :cdn-url="props.cdnUrl"
    @submit="submit"
    @submit-brouillon="submitBrouillon"
    @activate="activate"
    @cancel="cancel"
  >
    <template #search="scope">
      <AddressSearchAddress
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
  isDownloading: { type: Boolean, default: false },
  message: { type: String, required: false, default: null },
  isSaveVisible: { type: Boolean, default: false },
  defaultBackRoute: { type: String, required: true },
  cdnUrl: { type: String, required: true },
  modeBrouillonActivated: { type: Boolean, default: false },
});

const emit = defineEmits(["cancel", "submit", "submit-brouillon", "activate"]);

const submit = (hebergement) => {
  emit("submit", hebergement);
};

const submitBrouillon = (hebergement) => {
  emit("submit-brouillon", hebergement);
};

const activate = (hebergement) => {
  emit("activate", hebergement);
};

const cancel = () => {
  emit("cancel");
};
</script>
