<template>
  <div>
    <AgrementBilanChangements
      ref="changementsRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
      :modifiable="props.modifiable"
    />
    <AgrementBilanSejours
      ref="sejoursRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
      :modifiable="props.modifiable"
    />
    <AgrementBilanQualitatif
      ref="qualitatifRef"
      :init-agrement="props.initAgrement ?? {}"
      :cdn-url="props.cdnUrl"
      :modifiable="props.modifiable"
    />
    <hr class="fr-mt-4w" />
    <AgrementBilanFinancier
      ref="financierRef"
      :init-agrement="props.initAgrement ?? {}"
      :modifiable="props.modifiable"
    />
    <div v-if="props.showButtons && props.modifiable">
      <div class="fr-fieldset__element">
        <UtilsNavigationButtons
          :show-buttons="props.showButtons"
          :is-downloading="props.isDownloading"
          :message="props.message"
          :modifiable="props.modifiable"
          @next="handleSuivant"
          @previous="emit('previous')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import { useToaster } from "@vao/shared-ui";

interface FormulaireItem {
  ref: Ref<any>;
  nom: string;
  cle: string;
}

const props = defineProps({
  valid: { type: Boolean, default: true },
  initAgrement: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
  message: { type: String, default: null },
  isDownloading: { type: Boolean, default: false },
  modifiable: { type: Boolean, default: true },
});

const toaster = useToaster();

const emit = defineEmits(["update:valid", "update", "previous", "next"]);

const changementsRef = ref(null);
const financierRef = ref(null);
const sejoursRef = ref(null);
const qualitatifRef = ref(null);
const validationErrors = ref<string[]>([]);

const validateAllForms = async (formulaires: FormulaireItem[]) => {
  const formsErrors: string[] = [];
  const formsData: Record<string, any> = {};

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

onMounted(async () => {
  if (!props.modifiable) {
    validationForm();
  }
});

const validationForm = async () => {
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
  if (!props.modifiable) {
    emit("update:valid", allFormsAreValid);
  }
  if (allFormsAreValid || props.initAgrement.statut === "BROUILLON") {
    const transformedData = {
      ...formsData.changements,
      ...formsData.financier,
      agrementBilanAnnuel: formsData.sejours,
      ...formsData.qualitatif,
    };

    delete transformedData.statut;
  } else {
    toaster.error({
      titleTag: "h2",
      description: "Tous les formulaires doivent être renseignés et valides.",
    });
    console.warn("Erreurs de validation :", validationErrors.value);
  }
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

  if (allFormsAreValid || props.initAgrement.statut === "BROUILLON") {
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
