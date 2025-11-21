<template>
  <div>
    <AgrementBilanChangement
      ref="changementRef"
      :init-agrement="props.initAgrement ?? {}"
    />
    <!-- <AgrementBilanSejours @update-bilan="saveBilans" />
    <AgrementBilanQualitatif @update-bilan="saveBilans" />
    <AgrementBilanFinancier @update-bilan="saveBilans" /> -->
    <div v-if="props.showButtons">
      <div class="fr-fieldset__element">
        <UtilsNavigationButtons
          :show-buttons="props.showButtons"
          :is-downloading="props.isDownloading"
          :message="props.message"
          @next="handleSuivant"
          @previous="emit('previous')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const changementRef = ref(null);

const props = defineProps({
  initAgrement: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  message: { type: String, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const handleSuivant = async () => {
  // Validation finale avant de passer à l'étape suivante
  const validatedData = await changementRef.value.validateForm();
  console.log("Données validées du bilan des changements :", validatedData);

  if (validatedData) {
    // ou emit("update", validatedData);
    // emit("next");
  } else {
    //traitement en cas d'erreur de validation
    console.log(
      "Le formulaire n'est pas valide. Veuillez corriger les erreurs.",
    );
  }
};
</script>
