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
import { ref } from "vue";
import { TitleWithIcon } from "@vao/shared-ui";
import { DsfrMultiselect } from "@gouvminint/vue-dsfr";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";

const validationSchema = yup.object({
  animationAutre: yup
    .string()
    .max(1000, "Le texte ne doit pas dépasser 1000 caractères.")
    .nullable(),
});

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    animationAutre: "",
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

// Le multiselect n'est pas géré par vee-validate, on utilise un ref classique
const activitesSelectionnees = ref([]);

const validateForm = async () => {
  try {
    // Valider le champ vee-validate
    const result = await handleSubmit((values) => {
      console.log("=== VALIDATION DU FORMULAIRE ===");
      console.log("Champ 'Autres':", values.animationAutre || "(vide)");
      console.log("Activités sélectionnées:", activitesSelectionnees.value);

      return values;
    })();

    // Si la validation a réussi
    if (result) {
      const finalData = {
        activites: activitesSelectionnees.value,
        animationAutre: result.animationAutre,
      };

      console.log("Données finales:", finalData);
      return finalData;
    }
  } catch (error) {
    console.error("=== ERREUR DE VALIDATION ===");
    console.error("Message d'erreur:", error.message);
    console.error("Détails:", error);

    // Log des valeurs actuelles même en cas d'erreur
    console.log("Valeurs actuelles:");
    console.log("- Champ 'Autres':", animationAutre.value || "(vide)");
    console.log("- Activités sélectionnées:", activitesSelectionnees.value);
  }
};

defineExpose({
  validateForm,
});
</script>
