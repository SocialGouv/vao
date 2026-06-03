<template>
  <AgrementProjetsSejoursPrevus
    ref="sejoursPrevusRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsAnimationsActivites
    ref="animationsActivitesRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsAccompagnantsResponsables
    ref="accompagnantsResponsablesRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsCasierJudiciaire
    ref="casierJudiciaireRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsOrganisationTransports
    ref="organisationTransportsRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsSuiviMedical
    ref="suiviMedicalRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsProtocole
    ref="protocoleRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div class="fr-my-4w separator"></div>
  <AgrementProjetsBudget
    ref="financierRef"
    :cdn-url="props.cdnUrl"
    :init-agrement="props.initAgrement"
    :modifiable="props.modifiable"
  />
  <div v-if="props.showButtons && props.modifiable">
    <div class="fr-fieldset__element">
      <UtilsNavigationButtons
        class="fr-mt-8v"
        :show-buttons="props.showButtons"
        :is-downloading="props.isDownloading"
        :message="props.message"
        @next="handleSuivant"
        @previous="emit('previous')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToaster } from "@vao/shared-ui";

const props = defineProps({
  valid: { type: Boolean, default: true },
  initAgrement: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
  message: { type: String, default: null },
  isDownloading: { type: Boolean, default: false },
  modifiable: { type: Boolean, default: true },
  onUpdate: { type: Function, required: false, default: null },
});

interface FormulaireItem {
  ref: Ref<any>;
  nom: string;
  cle: string;
}

const toaster = useToaster();

const emit = defineEmits(["update:valid", "update", "previous"]);

const sejoursPrevusRef = ref(null);
const animationsActivitesRef = ref(null);
const accompagnantsResponsablesRef = ref(null);
const casierJudiciaireRef = ref(null);
const organisationTransportsRef = ref(null);
const suiviMedicalRef = ref(null);
const protocoleRef = ref(null);
const financierRef = ref(null);

const validationErrors = ref<string[]>([]);

onMounted(async () => {
  if (!props.modifiable) {
    handleSuivant();
  }
});

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
    const nomFormulaire = formulaires[index].nom;

    if (result.status !== "fulfilled" || !result.value?.data) {
      formsErrors.push(`Le formulaire "${nomFormulaire}" contient des erreurs`);
      if (result.status === "rejected") {
        console.error(`Erreur dans ${nomFormulaire}:`, result.reason);
      }
      return;
    }

    const { cle, nom, data: rawData } = result.value;
    console.log(`Validation result for ${nom}:`, rawData);

    let dataToStore: any;
    let isValid = true;

    if (rawData && typeof rawData === "object" && "valid" in rawData) {
      isValid = Boolean(rawData.valid);

      if (rawData.values !== undefined) {
        dataToStore = { ...rawData.values };
        Object.entries(rawData).forEach(([key, value]) => {
          if (key !== "values" && key !== "valid") {
            dataToStore[key] = value;
          }
        });
      } else {
        dataToStore = { ...rawData };
        delete dataToStore.valid;
      }
    } else {
      dataToStore = rawData;
    }

    if (isValid === false) {
      formsErrors.push(`Le formulaire "${nom}" contient des erreurs`);
    }

    if (
      typeof dataToStore.filesValid === "boolean" &&
      !dataToStore.filesValid
    ) {
      console.error(
        `Le formulaire projets "${nom}" contient des erreurs de fichiers.`,
      );
      formsErrors.push(
        `Le formulaire "${nom}" contient des erreurs de fichiers`,
      );
    }

    formsData[cle] = dataToStore;

    if (formsData[cle] && formsData[cle].filesValid !== undefined) {
      delete formsData[cle].filesValid;
    }
  });

  console.log("Forms data collected:", formsData);
  console.log("Forms errors collected:", formsErrors);

  return {
    formsData,
    formsErrors,
    allFormsAreValid: formsErrors.length === 0,
  };
};

// const validateAllForms = async (formulaires: FormulaireItem[]) => {
//   const formsErrors: string[] = [];
//   const formsData: Record<string, any> = {};

//   const resultats = await Promise.allSettled(
//     formulaires.map(async (form) => {
//       const data = await form.ref.value.validateForm();
//       return { cle: form.cle, nom: form.nom, data };
//     }),
//   );

//   resultats.forEach((result, index) => {
//     if (result.status === "fulfilled" && result.value.data) {
//       formsData[result.value.cle] = result.value.data;

//       if (
//         typeof result.value.data.filesValid === "boolean" &&
//         !result.value.data.filesValid
//       ) {
//         console.error(
//           `Le formulaire projets "${result.value.nom}" contient des erreurs de fichiers.`,
//         );
//         formsErrors.push(
//           `Le formulaire "${result.value.nom}" contient des erreurs de fichiers`,
//         );
//       }
//       delete formsData[result.value.cle].filesValid;
//     } else {
//       const nomFormulaire = formulaires[index].nom;
//       formsErrors.push(`Le formulaire "${nomFormulaire}" contient des erreurs`);

//       if (result.status === "rejected") {
//         console.error(`Erreur dans ${nomFormulaire}:`, result.reason);
//       }
//     }
//   });

//   return {
//     formsData,
//     formsErrors,
//     allFormsAreValid: formsErrors.length === 0,
//   };
// };

const handleSuivant = async () => {
  validationErrors.value = [];

  const forms = [
    // {
    //   ref: sejoursPrevusRef,
    //   nom: "Séjours prévus",
    //   cle: "sejoursPrevus",
    // },
    // {
    //   ref: animationsActivitesRef,
    //   nom: "Animations et activités",
    //   cle: "animationsActivites",
    // },
    // {
    //   ref: accompagnantsResponsablesRef,
    //   nom: "Accompagnants et responsables",
    //   cle: "accompagnantsResponsables",
    // },
    // {
    //   ref: casierJudiciaireRef,
    //   nom: "Casier judiciaire",
    //   cle: "casierJudiciaire",
    // },
    // {
    //   ref: organisationTransportsRef,
    //   nom: "Organisation des transports",
    //   cle: "organisationTransports",
    // },
    // {
    //   ref: suiviMedicalRef,
    //   nom: "Suivi médical",
    //   cle: "suiviMedical",
    // },
    // {
    //   ref: protocoleRef,
    //   nom: "Protocole",
    //   cle: "protocole",
    // },
    {
      ref: financierRef,
      nom: "Budget",
      cle: "budget",
    },
  ];

  const { formsData, formsErrors, allFormsAreValid } =
    await validateAllForms(forms);

  validationErrors.value = formsErrors;
  if (!props.modifiable) {
    emit("update:valid", allFormsAreValid);
  } else {
    if (allFormsAreValid || props.initAgrement.statut === "BROUILLON") {
      const transformedData = {
        ...formsData.sejoursPrevus,
        ...formsData.animationsActivites,
        ...formsData.accompagnantsResponsables,
        ...formsData.casierJudiciaire,
        ...formsData.organisationTransports,
        ...formsData.suiviMedical,
        ...formsData.protocole,
        ...formsData.budget,
      };

      delete transformedData.statut;

      if (props.onUpdate) {
        await props.onUpdate(transformedData);
      } else {
        emit("update", transformedData);
      }
    } else {
      toaster.error({
        titleTag: "h2",
        description: "Tous les formulaires doivent être renseignés et valides.",
      });
    }
  }
};
</script>
