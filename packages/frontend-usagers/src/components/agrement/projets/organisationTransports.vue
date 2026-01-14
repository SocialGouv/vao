<template>
  <TitleWithIcon
    icon="fr-icon-bus-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Organisation des transports prévus
  </TitleWithIcon>

  <div class="fr-col-12">
    <DsfrInputGroup
      name="transportAllerRetour"
      label="Du lieu habituel de résidence au lieu de vacances de même que lors du retour "
      hint="Exemple : Car"
      :model-value="transportAllerRetour"
      :label-visible="true"
      :is-valid="transportAllerRetourMeta.valid"
      :error-message="transportAllerRetourErrorMessage"
      @update:model-value="onTransportAllerRetourChange"
    />
  </div>
  <div class="fr-col-12 fr-mt-6v">
    <DsfrInputGroup
      name="transportSejour"
      label="Durant le séjour du lieu d’hébergement au lieu des activités"
      hint="Exemple : Mini-bus"
      :model-value="transportSejour"
      :label-visible="true"
      :is-valid="transportSejourMeta.valid"
      :error-message="transportSejourErrorMessage"
      @update:model-value="onTransportSejourChange"
    />
  </div>

  <div class="fr-fieldset__element fr-mt-6v">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursOrgaTransports"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";
import * as yup from "yup";
import { useForm, useField } from "vee-validate";
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const filesProjetsSejoursOrgaTransports = ref(
  props.initAgrement?.agrementFiles.filter(
    (file) => file.category === FILE_CATEGORY.PROJETSSEJOURSORGATRANSPORT,
  ) || [],
);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  transportAllerRetour: requiredUnlessBrouillon(
    yup.string().min(1, "Merci de décrire au moins 1 caractères.").nullable(),
  ),
  transportSejour: requiredUnlessBrouillon(
    yup.string().min(1, "Merci de décrire au moins 1 caractères.").nullable(),
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
} = useField("transportAllerRetour");

const {
  value: transportSejour,
  errorMessage: transportSejourErrorMessage,
  meta: transportSejourMeta,
  handleChange: onTransportSejourChange,
} = useField("transportSejour");

const validateForm = async () => {
  const formValid = true;

  try {
    console.log(
      "Début de la validation du formulaire Organisation des transports",
    );

    // CORRECTION : handleSubmit retourne maintenant les valeurs actuelles
    const result = await handleSubmit((values) => {
      // Log des valeurs ACTUELLES du formulaire
      console.log("Valeurs du formulaire transports:", values);
      return values;
    })();

    // Validation du type de déficiences

    if (!formValid) {
      console.error("Le formulaire n'est pas valide.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(filesProjetsSejoursOrgaTransports.value && {
          filesProjetsSejoursOrgaTransports:
            filesProjetsSejoursOrgaTransports.value,
        }),
      };
      console.log("Données finales transports:", finalData);
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire :", error);
  }
  console.error("Erreur lors de la validation du formulaire transports");
};

defineExpose({
  validateForm,
});
</script>
