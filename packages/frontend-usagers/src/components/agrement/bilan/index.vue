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

const toaster = useToaster();

const emit = defineEmits(["previous", "next", "update"]);

const changementsRef = ref(null);
const financierRef = ref(null);
const sejoursRef = ref(null);
const qualitatifRef = ref(null);
const validationErrors = ref([]);

const validateAllForms = async (formulaires) => {
  const formsErrors = [];
  const formsData = {};

  const resultats = await Promise.allSettled(
    formulaires.map(async (form) => {
      const data = await form.ref.value.validateForm();
      return { cle: form.cle, nom: form.nom, data };
    }),
  );

  resultats.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.data) {
      formsData[result.value.cle] = result.value.data;
    } else {
      const nomFormulaire = formulaires[index].nom;
      formsErrors.push(`Le formulaire "${nomFormulaire}" contient des erreurs`);

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
  validationErrors.value = [];

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

  // Valide tous les forms
  const { formsData, formsErrors, allFormsAreValid } =
    await validateAllForms(forms);

  validationErrors.value = formsErrors;

  if (allFormsAreValid) {
    const transformedData = {
      ...formsData.changements,
      ...formsData.financier,
      agrementBilanAnnuel: formsData.sejours,
      ...formsData.qualitatif,
    };

    delete transformedData.statut;

    emit("update", transformedData);
    emit("next");
  } else {
    toaster.error({
      titleTag: "h2",
      description: "Tous les formulaires doivent être renseignés et valides.",
    });
    console.warn("Erreurs de validation :", validationErrors.value);
  }
};
</script>
