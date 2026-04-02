<template>
  <TitleWithIcon
    icon="fr-icon-map-pin-2-fill"
    :level="2"
    title-class="fr-text--lead fr-mb-0"
  >
    Animation et activités prévues
  </TitleWithIcon>
  <div class="flex flex-col">
    <div>
      <DisplayInputCommon
        :input="AgrementDisplayInput.IAgrementProjets.activitesSelectionnees"
        :value="props.initAgrement?.activitesSelectionnees"
      />
    </div>
    <div class="fr-mt-4v">
      <DisplayInputCommon
        :value="props.initAgrement?.animationAutre"
        :input="AgrementDisplayInput.IAgrementProjets['animationAutre']"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import {
  TitleWithIcon,
  DisplayInputCommon,
  AgrementDisplayInput,
} from "@vao/shared-ui";

const agrementStore = useAgrementStore();

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const loadError = ref(false);

onMounted(async () => {
  try {
    await agrementStore.getAllActivites();
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error);
    loadError.value = true;
  }
});
</script>
