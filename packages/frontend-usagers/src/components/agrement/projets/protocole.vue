<template>
  <TitleWithIcon
    icon="fr-icon-alarm-warning-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Protocole de réorientation, évacuation, rapatriement prévu
  </TitleWithIcon>

  <p><b>Réorientation, évacuation</b></p>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="protocoleEvacUrg"
        label="Mesures d’anticipation prévues par l’organisateur de séjour"
        hint="Identification des risques potentiels, actions prévues par le responsable du séjour, information sur la sécurité du site et modes d’évacuation prévus, information du lieu d’hébergement sur la nature du public et possibles besoins d’aides en cas d’alerte."
        :model-value="protocoleEvacUrg"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="protocoleEvacUrgMeta.valid"
        :error-message="protocoleEvacUrgErrorMessage"
        @update:model-value="onProtocoleEvacUrgChange"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="protocoleRapatUrg"
        label="Modalités d’information, de transports et de réorientation, évacuation"
        hint="Expliquer les mesures organisationnelles prévues (transports, modalités d’information de l’entourage du vacancier, conditions de retour vers l’ESSMS, le domicile ou autre lieu de séjour, liens avec les services médicaux et de secours)."
        :model-value="protocoleRapatUrg"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="protocoleRapatUrgMeta.valid"
        :error-message="protocoleRapatUrgErrorMessage"
        @update:model-value="onProtocoleRapatUrgChange"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursProtocoleReorientation"
      label="Ajouter des fichiers (optionnel)"
    />
  </div>
  <hr class="fr-mt-8v" />
  <p><b>Rapatriement</b></p>
  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="protocoleRapatEtranger"
        label="Mesures d’anticipation prévues par l’organisateur de séjour"
        hint="Identification des risques potentiels, actions prévues par le responsable du séjour, information sur la sécurité du site et modes d’évacuation prévus, information du lieu d’hébergement sur la nature du public et possibles besoins d’aides en cas d’alerte"
        :model-value="protocoleRapatEtranger"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="protocoleRapatEtrangerMeta.valid"
        :error-message="protocoleRapatEtrangerErrorMessage"
        @update:model-value="onProtocoleRapatEtrangerChange"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-8v">
    <div class="fr-col-12">
      <DsfrInputGroup
        name="protocoleInfoFamille"
        label="Modalités d’information, de transports et de rapatriement"
        hint="Expliciter les mesures organisationnelles prévues (transports, lien avec ambassade, modalités d’information de l’entourage du vacancier, conditions de retour vers l’ESSMS, le domicile ou autre lieu de séjour, liens avec les services médicaux et de secours) "
        :model-value="protocoleInfoFamille"
        :label-visible="true"
        :is-textarea="true"
        :is-valid="protocoleInfoFamilleMeta.valid"
        :error-message="protocoleInfoFamilleErrorMessage"
        @update:model-value="onprotocoleInfoFamilleChange"
      />
    </div>
  </div>
  <div class="fr-fieldset__element fr-mt-8v">
    <UtilsMultiFilesUpload
      v-model="filesProjetsSejoursProtocoleRapatriement"
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

const filesProjetsSejoursProtocoleReorientation = ref(
  props.initAgrement?.agrementFiles.filter(
    (file) => file.category === FILE_CATEGORY.PROJSEJPROTCOREORIENT,
  ) || [],
);
const filesProjetsSejoursProtocoleRapatriement = ref(
  props.initAgrement?.agrementFiles.filter(
    (file) => file.category === FILE_CATEGORY.PROJSSEJOURSPROTCOLERAPATR,
  ) || [],
);

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable(),
  });

const validationSchema = yup.object({
  statut: yup.mixed().oneOf(Object.values(AGREMENT_STATUT)).required(),
  protocoleEvacUrg: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  protocoleRapatUrg: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  protocoleRapatEtranger: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
  protocoleInfoFamille: requiredUnlessBrouillon(
    yup.string().min(20, "Merci de décrire au moins 20 caractères.").nullable(),
  ),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  protocoleEvacUrg: props.initAgrement.protocoleEvacUrg || "",
  protocoleRapatUrg: props.initAgrement.protocoleRapatUrg || "",
  protocoleRapatEtranger: props.initAgrement.protocoleRapatEtranger || "",
  protocoleInfoFamille: props.initAgrement.protocoleInfoFamille || "",
};

const { handleSubmit } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: protocoleEvacUrg,
  errorMessage: protocoleEvacUrgErrorMessage,
  meta: protocoleEvacUrgMeta,
  handleChange: onProtocoleEvacUrgChange,
} = useField("protocoleEvacUrg");

const {
  value: protocoleRapatUrg,
  errorMessage: protocoleRapatUrgErrorMessage,
  meta: protocoleRapatUrgMeta,
  handleChange: onProtocoleRapatUrgChange,
} = useField("protocoleRapatUrg");

const {
  value: protocoleRapatEtranger,
  errorMessage: protocoleRapatEtrangerErrorMessage,
  meta: protocoleRapatEtrangerMeta,
  handleChange: onProtocoleRapatEtrangerChange,
} = useField("protocoleRapatEtranger");

const {
  value: protocoleInfoFamille,
  errorMessage: protocoleInfoFamilleErrorMessage,
  meta: protocoleInfoFamilleMeta,
  handleChange: onprotocoleInfoFamilleChange,
} = useField("protocoleInfoFamille");

const validateForm = async () => {
  const formValid = true;

  try {
    const result = await handleSubmit((values) => {
      return values;
    })();

    if (!formValid) {
      console.error("Le formulaire n'est pas valide.");
    }

    if (result) {
      const data = { ...result };
      delete data.statut;
      const finalData = {
        ...data,
        ...(filesProjetsSejoursProtocoleReorientation.value.length > 0 && {
          filesProjetsSejoursProtocoleReorientation:
            filesProjetsSejoursProtocoleReorientation.value,
        }),
        ...(filesProjetsSejoursProtocoleRapatriement.value.length > 0 && {
          filesProjetsSejoursProtocoleRapatriement:
            filesProjetsSejoursProtocoleRapatriement.value,
        }),
      };
      return finalData;
    }
  } catch (error) {
    console.error("Erreur lors de la validation du formulaire :", error);
  }
};

defineExpose({
  validateForm,
});
</script>
