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
      <DsfrMultiselect
        v-model="activitesSelectionnees"
        :options="options"
        search
        select-all
        :button-label="buttonLabel"
        label="Vous pouvez sélectionner une ou plusieurs options."
      />
      <p
        v-if="activitesSelectionneesErrorMessage"
        class="fr-error-text fr-mt-1v"
      >
        {{ activitesSelectionneesErrorMessage }}
      </p>
    </div>
    <div class="fr-mt-4v">
      <DsfrInputGroup
        name="animationAutre"
        label="Autres (optionnel)"
        :model-value="animationAutre"
        :label-visible="true"
        :is-valid="animationAutreMeta.valid"
        :error-message="animationAutreErrorMessage"
        @update:model-value="onAnimationAutreChange"
      />
    </div>
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import { DsfrMultiselect } from "@gouvminint/vue-dsfr";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import * as yup from "yup";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

// Mapping des activités avec leurs codes et types
const ACTIVITES_DB = {
  Baignade: { id: 1, code: "BAIGNADE", type: "SPORT" },
  Randonnée: { id: 2, code: "RANDONNEE", type: "SPORT" },
  "Voile, char à voile, rafting": {
    id: 3,
    code: "VOILE_CHAR_RAFTING",
    type: "SPORT",
  },
  "Tir à l'arc": { id: 4, code: "TIR_A_L_ARC", type: "SPORT" },
  ULM: { id: 5, code: "ULM", type: "SPORT" },
  Équitation: { id: 6, code: "EQUITATION", type: "SPORT" },
  Ski: { id: 7, code: "SKI", type: "SPORT" },
  "Sports nautiques": { id: 8, code: "SPORTS_NAUTIQUES", type: "SPORT" },
  Pêche: { id: 9, code: "PECHE", type: "SPORT" },
  Thalassothérapie: { id: 11, code: "THALASSO", type: "SPORT" },
  Balnéothérapie: { id: 12, code: "BALNEO", type: "SPORT" },
  "Visites touristiques": { id: 13, code: "VISITES", type: "CULTURE" },
  "Spectacles, animations, musées": {
    id: 14,
    code: "SPECTACLES_ANIMATIONS_MUSEES",
    type: "CULTURE",
  },
  Musique: { id: 15, code: "MUSIQUE", type: "CULTURE" },
  "Expression théatrale": {
    id: 16,
    code: "EXPRESSION_THEATRALE",
    type: "CULTURE",
  },
  "Arts plastiques": { id: 17, code: "ARTS_PLASTIQUES", type: "CULTURE" },
  Danse: { id: 18, code: "DANSE", type: "CULTURE" },
  Chant: { id: 19, code: "CHANT", type: "CULTURE" },
  "Soirées dansantes": { id: 20, code: "SOIREES_DANSANTES", type: "CULTURE" },
  "Ferme pédagogique": { id: 21, code: "FERME_PEDAGOGIQUE", type: "CULTURE" },
};

// Fonction pour initialiser les activités sélectionnées depuis les données du store
const initActivitesFromStore = () => {
  if (!props.initAgrement.agrementAnimation?.length) {
    return [];
  }

  return props.initAgrement.agrementAnimation
    .map((animation) => animation.activite?.libelle)
    .filter(Boolean); // Filtre les valeurs null/undefined
};

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  activitesSelectionnees: requiredUnlessBrouillon(
    yup.array().min(1, "Veuillez sélectionner au moins une activité"),
  ),
  animationAutre: yup
    .string()
    .max(1000, "Le texte ne doit pas dépasser 1000 caractères.")
    .nullable(),
});

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
    animationAutre: props.initAgrement.animationAutre || "",
    activitesSelectionnees: initActivitesFromStore() || [],
  },
  validateOnMount: false,
});

const {
  value: animationAutre,
  errorMessage: animationAutreErrorMessage,
  handleChange: onAnimationAutreChange,
  meta: animationAutreMeta,
} = useField("animationAutre");

const options = [
  "Arts plastiques",
  "Baignade",
  "Balnéothérapie",
  "Chant",
  "Danse",
  "Équitation",
  "Expression théatrale",
  "Ferme pédagogique",
  "Musique",
  "Pêche",
  "Randonnée",
  "Ski",
  "Soirées dansantes",
  "Spectacles, animations, musées",
  "Sports nautiques",
  "Thalassothérapie",
  "Tir à l'arc",
  "ULM",
  "Visites touristiques",
  "Voile, char à voile, rafting",
];

const buttonLabel = computed(() => {
  return activitesSelectionnees.value.length === 0
    ? "Sélectionner une ou plusieurs options."
    : `${activitesSelectionnees.value.length} option(s) sélectionnée(s)`;
});

const {
  value: activitesSelectionnees,
  errorMessage: activitesSelectionneesErrorMessage,
} = useField("activitesSelectionnees");

// Fonction pour convertir les activités sélectionnées au format AgrementAnimationDto
const convertToAgrementAnimation = (activitesLibelles, agrementId = null) => {
  const agrementAnimations = [];

  // Convertir les activités sélectionnées
  activitesLibelles.forEach((libelle) => {
    const activiteInfo = ACTIVITES_DB[libelle];
    if (activiteInfo) {
      agrementAnimations.push({
        activiteId: activiteInfo.id,
        agrementId: agrementId,
        activite: {
          code: activiteInfo.code,
          libelle: libelle,
          activiteType: activiteInfo.type,
        },
      });
    }
  });

  return agrementAnimations;
};

const validateForm = async () => {
  try {
    const result = await handleSubmit((values) => {
      console.log("=== VALIDATION DU FORMULAIRE ===");
      console.log("Champ 'Autres':", values.animationAutre || "(vide)");
      console.log("Activités sélectionnées:", activitesSelectionnees.value);

      return values;
    })();

    if (result) {
      // Convertir au format attendu par le parent
      const agrementAnimation = convertToAgrementAnimation(
        activitesSelectionnees.value,
        props.initAgrement.id || null,
      );

      const finalData = {
        agrementAnimation: agrementAnimation,
        animationAutre: result.animationAutre || null,
      };

      console.log("Données finales (format AgrementDto):", finalData);
      return finalData;
    }
  } catch (error) {
    console.error("=== ERREUR DE VALIDATION ===");
    console.error("Message d'erreur:", error.message);
    console.error("Détails:", error);

    console.log("Valeurs actuelles:");
    console.log("- Champ 'Autres':", animationAutre.value || "(vide)");
    console.log("- Activités sélectionnées:", activitesSelectionnees.value);
  }
};

defineExpose({
  validateForm,
});
</script>
