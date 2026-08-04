<template>
  <fieldset class="no-border fr-py-0v">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-map-pin-2-fill" aria-hidden="true"></span>
      Animation et activités prévues
    </legend>

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
          :input="displayInput.AgrementProjetsInput.activitesSelectionnees"
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
          :input="displayInput.AgrementProjetsInput['animationAutre']"
          :is-valid="animationAutreMeta.valid"
          :error-message="animationAutreErrorMessage"
        />
      </div>
    </div>
  </fieldset>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import type { ActiviteDto, AgrementAnimationDto } from "@vao/shared-bridge";
import * as yup from "yup";

const agrementStore = useAgrementStore();
const log = logger("components/agrement/projets/animationsActivites");

const loadError = ref<boolean>(false);

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

onMounted(async () => {
  try {
    await agrementStore.getAllActivites();
  } catch (error) {
    log.w("Erreur lors de la récupération des activités:", error);
    loadError.value = true;
  }
});

const activitesMap = computed<Record<string, ActiviteDto>>(() => {
  const map: Record<string, ActiviteDto> = {};
  const activites = agrementStore.activites || [];

  if (activites.length === 0) {
    log.w("Aucune activité disponible dans le store");
    return map;
  }

  activites.forEach((activite) => {
    if (activite.libelle) {
      map[activite.libelle] = activite;
    }
  });

  return map;
});

// options, buttonLabel, animationAutreErrorMessage, onAnimationAutreChange,
// animationAutreMeta, activitesSelectionneesErrorMessage :
// utilisés dans le <template> — les avertissements TS sont des faux positifs

const options = computed<string[]>(() => {
  const activites = agrementStore.activites || [];

  if (activites.length === 0) {
    return [];
  }

  return activites.map((a) =>
    a.code?.includes("AUTRES")
      ? `${a.libelle} (${a.activiteType})`
      : (a.libelle ?? ""),
  );
});

const initActivitesFromStore = (): string[] => {
  if (!props.initAgrement.agrementAnimation?.length) {
    return [];
  }

  return props.initAgrement.agrementAnimation
    .map((animation: AgrementAnimationDto) =>
      animation.activite?.code?.includes("AUTRES")
        ? `${animation.activite.libelle} (${animation.activite.activiteType})`
        : (animation.activite?.libelle ?? ""),
    )
    .filter(Boolean) as string[];
};

const validationSchema = yup.object({
  activitesSelectionnees: requiredUnlessBrouillon(
    yup.array().min(1, "Veuillez sélectionner au moins une activité"),
  ),
  animationAutre: yup
    .string()
    .max(1000, "Veuillez saisir un texte. Maximum 1000 caractères.")
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
} = useField<string>("animationAutre");

const buttonLabel = computed<string>(() => {
  return activitesSelectionnees.value.length === 0
    ? "Sélectionner une ou plusieurs options."
    : `${activitesSelectionnees.value.length} option(s) sélectionnée(s)`;
});

const {
  value: activitesSelectionnees,
  errorMessage: activitesSelectionneesErrorMessage,
} = useField<string[]>("activitesSelectionnees");

const convertToAgrementAnimation = (
  activitesLibelles: string[],
  agrementId: number | null = null,
): AgrementAnimationDto[] => {
  const agrementAnimations: AgrementAnimationDto[] = [];

  activitesLibelles.forEach((libelle: string) => {
    const cleanedLibelle = libelle.replace(/ \(.*\)$/, "");
    const activiteInfo = activitesMap.value[cleanedLibelle];

    if (activiteInfo) {
      agrementAnimations.push({
        activiteId: activiteInfo.id || null,
        agrementId,
        activite: {
          id: activiteInfo.id,
          code: activiteInfo.code,
          libelle: cleanedLibelle,
          activiteType: activiteInfo.activiteType,
        },
      });
    } else {
      log.w(`Activité non trouvée dans le mapping: "${libelle}"`);
    }
  });

  return agrementAnimations;
};

const validateForm = async () => {
  const finalData = {
    valid: false,
    agrementAnimation: convertToAgrementAnimation(
      activitesSelectionnees.value,
      props.initAgrement.id || null,
    ),
    animationAutre: animationAutre.value || null,
  };

  try {
    const result = await handleSubmit((values) => values)();
    if (result) {
      finalData.agrementAnimation = convertToAgrementAnimation(
        activitesSelectionnees.value,
        props.initAgrement.id ?? null,
      );
      finalData.animationAutre = result.animationAutre || null;
      finalData.valid = true;
    }
  } catch (error) {
    log.w("Erreur lors de la validation du formulaire :", error);
  }

  return finalData;
};

defineExpose({
  validateForm,
});
</script>

<style scoped>
fieldset.no-border {
  border: none;
  padding: 0;
}
legend {
  padding-left: 0;
}
</style>
