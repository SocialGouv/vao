<template>
  <div>
    <AgrementBilanChangements
      ref="changementsRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
    />
    <AgrementBilanSejours
      ref="sejoursRef"
      :init-agrement="props.initAgrement ?? {}"
    />
    <AgrementBilanQualitatif
      ref="qualitatifRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
    />
    <hr class="fr-mt-4w" />
    <AgrementBilanFinancier
      ref="financierRef"
      :init-agrement="props.initAgrement ?? {}"
    />
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
const props = defineProps({
  initAgrement: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
  message: { type: String, default: null },
});

const emit = defineEmits(["previous", "next", "update"]);

const changementsRef = ref(null);
const financierRef = ref(null);
const sejoursRef = ref(null);
const qualitatifRef = ref(null);
const validationErrors = ref([]);

/**
 * Valide et agrège les données de tous les formulaires enfants
 * @param {Array} formulaires - Liste des formulaires à valider
 * @returns {Object} { donnees, erreurs, allFormsAreValid }
 */
const validateAllForms = async (formulaires) => {
  const formsErrors = [];
  const formsData = {};

  const resultats = await Promise.allSettled(
    formulaires.map(async (form) => {
      const data = await form.ref.value.validateForm();
      console.log(`Données validées pour ${form.nom}:`, data);
      return { cle: form.cle, nom: form.nom, data };
    }),
  );

  console.log("Résultats de la validation :", resultats);

  resultats.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.data) {
      // Validation réussie, on agrège les données
      formsData[result.value.cle] = result.value.data;
    } else {
      // Validation échouée ou rejetée
      const nomFormulaire = formulaires[index].nom;
      formsErrors.push(`Le formulaire "${nomFormulaire}" contient des erreurs`);
      console.log("formsErrors:", formsErrors);

      // Log pour debug
      if (result.status === "rejected") {
        console.error(`Erreur dans ${nomFormulaire}:`, result.reason);
      }
    }
  });

  return {
    formsData,
    formsErrors,
    allFormsAreValid: formsErrors.length === 0,
  };
};

const handleSuivant = async () => {
  // Réinitialiser les erreurs
  validationErrors.value = [];

  // Configuration des formulaires à valider
  const forms = [
    {
      ref: changementsRef,
      nom: "Changements et évolutions",
      cle: "changements",
    },
    {
      ref: financierRef,
      nom: "Bilan financier",
      cle: "financier",
    },
    {
      ref: sejoursRef,
      nom: "Bilan des séjours",
      cle: "sejours",
    },
    {
      ref: qualitatifRef,
      nom: "Bilan qualitatif",
      cle: "qualitatif",
    },
  ];

  // Valider et agréger tous les formulaires
  const { formsData, formsErrors, allFormsAreValid } =
    await validateAllForms(forms);

  validationErrors.value = formsErrors;

  if (allFormsAreValid) {
    console.log("Toutes les données validées :", formsData);

    const transformedData = {
      ...formsData.changements, // Décomposer les propriétés de "changements"
      ...formsData.financier, // Décomposer les propriétés de "financier"
      agrementBilanAnnuel: formsData.sejours, // Inclure directement le tableau "sejours"
      ...formsData.qualitatif, // Décomposer les propriétés de "qualitatif"
    };

    delete transformedData.statut;

    console.log("Données transformées à émettre :", transformedData);

    emit("update", transformedData);
    // emit("next");
  } else {
    console.warn("Erreurs de validation :", validationErrors.value);
    // gestion erreurs
  }
};
</script>
