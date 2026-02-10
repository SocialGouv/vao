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
        v-if="props.modifiable"
        v-model="activitesSelectionnees"
        :options="options"
        search
        select-all
        :button-label="buttonLabel"
        label="Vous pouvez sélectionner une ou plusieurs options."
      />
      <UtilsDisplayInput
        v-else
        :input="displayInput.IAgrementProjets.activitesSelectionnees"
        :value="activitesSelectionnees"
        :error-message="activitesSelectionneesErrorMessage"
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
        v-if="props.modifiable"
        name="animationAutre"
        label="Autres (optionnel)"
        :model-value="animationAutre"
        :label-visible="true"
        :is-valid="animationAutreMeta.valid"
        :error-message="animationAutreErrorMessage"
        @update:model-value="onAnimationAutreChange"
      />
      <UtilsDisplayInput
        v-else
        :value="animationAutre"
        :input="displayInput.IAgrementProjets['animationAutre']"
        :is-valid="animationAutreMeta.valid"
        :error-message="animationAutreErrorMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { TitleWithIcon } from "@vao/shared-ui";
import { DsfrMultiselect } from "@gouvminint/vue-dsfr";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import * as yup from "yup";
import displayInput from "../../../utils/display-input";

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

const activitesMap = computed(() => {
  const map = {};

  const activites = agrementStore.activites || [];

  if (activites.length === 0) {
    console.warn("Aucune activité disponible dans le store");
    return map;
  }

  activites.forEach((activite) => {
    if (activite.libelle) {
      map[activite.libelle] = {
        id: activite.id,
        code: activite.code,
        type: activite.activiteType,
      };
    }
  });

  return map;
});

const options = computed(() => {
  const activites = agrementStore.activites || [];

  if (activites.length === 0) {
    return [];
  }

  return activites.map((a) =>
    a.code.includes("AUTRES") ? `${a.libelle} (${a.activiteType})` : a.libelle,
  );
});

const initActivitesFromStore = () => {
  if (!props.initAgrement.agrementAnimation?.length) {
    return [];
  }

  return props.initAgrement.agrementAnimation
    .map((animation) =>
      animation.activite?.code.includes("AUTRES")
        ? `${animation.activite.libelle} (${animation.activite.activiteType})`
        : animation.activite?.libelle,
    )
    .filter(Boolean);
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

const buttonLabel = computed(() => {
  return activitesSelectionnees.value.length === 0
    ? "Sélectionner une ou plusieurs options."
    : `${activitesSelectionnees.value.length} option(s) sélectionnée(s)`;
});

const {
  value: activitesSelectionnees,
  errorMessage: activitesSelectionneesErrorMessage,
} = useField("activitesSelectionnees");

const convertToAgrementAnimation = (activitesLibelles, agrementId = null) => {
  const agrementAnimations = [];
  activitesLibelles.forEach((libelle) => {
    const cleanedLibelle = libelle.replace(/ \(.*\)$/, "");
    const activiteInfo = activitesMap.value[cleanedLibelle];

    if (activiteInfo) {
      agrementAnimations.push({
        activiteId: activiteInfo.id,
        agrementId: agrementId,
        activite: {
          code: activiteInfo.code,
          libelle: cleanedLibelle,
          activiteType: activiteInfo.type,
        },
      });
    } else {
      console.warn(`Activité non trouvée dans le mapping: "${libelle}"`);
    }
  });

  return agrementAnimations;
};

const validateForm = async () => {
  try {
    const result = await handleSubmit((values) => {
      return values;
    })();

    if (result) {
      const agrementAnimation = convertToAgrementAnimation(
        activitesSelectionnees.value,
        props.initAgrement.id || null,
      );

      const finalData = {
        agrementAnimation: agrementAnimation,
        animationAutre: result.animationAutre || null,
      };

      return finalData;
    }
  } catch (error) {
    console.error("Détails:", error);
  }
};

defineExpose({
  validateForm,
});
</script>
