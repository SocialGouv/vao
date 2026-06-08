<template>
  <fieldset class="no-border">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-bus-fill" aria-hidden="true"></span>
      Organisation des transports prévus
    </legend>
    <div class="fr-col-12">
      <DsfrInputGroup
        v-if="props.modifiable"
        name="transportAllerRetour"
        :label="displayInput.AgrementProjetsInput['transportAllerRetour'].label"
        hint="Exemple : Car"
        :model-value="transportAllerRetour"
        :label-visible="true"
        :is-valid="transportAllerRetourMeta.valid"
        :error-message="transportAllerRetourErrorMessage"
        @update:model-value="onTransportAllerRetourChange"
      />
      <UtilsDisplayInput
        v-else
        :value="transportAllerRetour"
        :input="displayInput.AgrementProjetsInput['transportAllerRetour']"
        :is-valid="transportAllerRetourMeta.valid"
        :error-message="transportAllerRetourErrorMessage"
      />
    </div>
    <div class="fr-col-12 fr-mt-6v">
      <DsfrInputGroup
        v-if="props.modifiable"
        name="transportSejour"
        :label="displayInput.AgrementProjetsInput['transportSejour'].label"
        hint="Exemple : Mini-bus"
        :model-value="transportSejour"
        :label-visible="true"
        :is-valid="transportSejourMeta.valid"
        :error-message="transportSejourErrorMessage"
        @update:model-value="onTransportSejourChange"
      />
      <UtilsDisplayInput
        v-else
        :value="transportSejour"
        :input="displayInput.AgrementProjetsInput['transportSejour']"
        :is-valid="transportSejourMeta.valid"
        :error-message="transportSejourErrorMessage"
      />
    </div>

    <div class="fr-fieldset__element fr-mt-6v">
      <UtilsMultiFilesUpload
        v-model="filesProjetsSejoursOrgaTransports"
        hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
        :modifiable="props.modifiable"
        label="Ajouter des fichiers (optionnel)"
      />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import type { AgrementFilesDto } from "@vao/shared-bridge";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";
import displayInput from "../../../utils/display-input";
const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: false },
});

const log = logger("components/agrement/projets/organisationTransports");

const filesProjetsSejoursOrgaTransports = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: AgrementFilesDto) =>
      file.category === FILE_CATEGORY.PROJETSSEJOURSORGATRANSPORT,
  ) || [],
);

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  transportAllerRetour:
    props.initAgrement.statut === AGREMENT_STATUT.BROUILLON
      ? yup.string().nullable()
      : requiredUnlessBrouillon(
          yup
            .string()
            .min(
              1,
              "Veuillez indiquer le moyen de transport aller-retour prévu. Minimum 1 caractère.",
            )
            .nullable(),
        ),
  transportSejour:
    props.initAgrement.statut === AGREMENT_STATUT.BROUILLON
      ? yup.string().nullable()
      : requiredUnlessBrouillon(
          yup
            .string()
            .min(
              1,
              "Veuillez indiquer le moyen de transport prévu pour le séjour. Minimum 1 caractère.",
            )
            .nullable(),
        ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  transportAllerRetour: props.initAgrement.transportAllerRetour || "",
  transportSejour: props.initAgrement.transportSejour || "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: transportAllerRetour,
  errorMessage: transportAllerRetourErrorMessage,
  meta: transportAllerRetourMeta,
  handleChange: onTransportAllerRetourChange,
} = useField<string>("transportAllerRetour");

const {
  value: transportSejour,
  errorMessage: transportSejourErrorMessage,
  meta: transportSejourMeta,
  handleChange: onTransportSejourChange,
} = useField<string>("transportSejour");

const validateForm = async () => {
  const finalData = {
    valid: false,
    transportAllerRetour: transportAllerRetour.value || null,
    transportSejour: transportSejour.value || null,
    filesProjetsSejoursOrgaTransports: filesProjetsSejoursOrgaTransports.value,
  };

  try {
    const result = await handleSubmit((values) => values)();

    if (result) {
      finalData.transportAllerRetour = result.transportAllerRetour || null;
      finalData.transportSejour = result.transportSejour || null;
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
