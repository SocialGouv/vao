<template>
  <div>
    <fieldset class="fr-fieldset">
      <DsfrHighlight
        text="L’acte d’administration proprement dit consiste à faire prendre le bon médicament au bon patient, à la bonne posologie, au bon moment, par la bonne voie. Cet acte inclut le contrôle de la prise effective du traitement. Il est recommandé que la distribution des médicaments préalablement préparés, leur administration et son enregistrement soient réalisés par la même personne."
        :small="false"
        :large="true"
      />
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="dispositionsSpecifiques"
            legend="Des dispositions d’ordre sanitaire spécifiques sont-elles prévues ?"
            :required="true"
            :model-value="dispositionsSpecifiques"
            :options="ouiNonOptions"
            :is-valid="dispositionsSpecifiquesMeta"
            :inline="true"
            :error-message="dispositionsSpecifiquesErrorMessage"
            @update:model-value="onDispositionsSpecifiquesChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="dispositionsSpecifiques" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionDispositionsSpecifiques"
            :required="false"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionDispositionsSpecifiques"
            :error-message="precisionDispositionsSpecifiquesErrorMessage"
            :is-valid="precisionDispositionsSpecifiquesMeta"
            @update:model-value="onPrecisionDispositionsSpecifiquesChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrCheckboxSet
            v-model="constitutionEquipe"
            name="constitutionEquipe"
            legend="L’équipe comprend-elle ?"
            :options="constitutionEquipeOptions"
            :small="true"
            :required="true"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="constitutionEquipe.length > 0" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionConstitutionEquipe"
            :required="false"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionConstitutionEquipe"
            :error-message="precisionConstitutionEquipeErrorMessage"
            :is-valid="precisionConstitutionEquipeMeta"
            @update:model-value="onPrecisionConstitutionEquipeChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="troussePharmacie"
            legend="Présence d’une trousse à pharmacie de premier secours ?"
            :required="true"
            :model-value="troussePharmacie"
            :options="ouiNonOptions"
            :is-valid="troussePharmacieMeta"
            :inline="true"
            :error-message="troussePharmacieErrorMessage"
            @update:model-value="onTroussePharmacieChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrCheckboxSet
            v-model="responsableAdministrationMedicament"
            name="responsableAdministrationMedicament"
            legend="Personne désignée en charge de la distribution et de l’administration des médicaments et de l’enregistrement de l’administration"
            :options="responsableAdministrationMedicamentOptions"
            :small="true"
            :required="true"
          />
        </div>
      </div>
    </fieldset>
    <fieldset
      v-if="responsableAdministrationMedicament.length > 0"
      class="fr-fieldset"
    >
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionResponsableAdministrationMedicament"
            :required="false"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionResponsableAdministrationMedicament"
            :error-message="
              precisionResponsableAdministrationMedicamentErrorMessage
            "
            :is-valid="precisionResponsableAdministrationMedicamentMeta"
            @update:model-value="
              onPrecisionResponsableAdministrationMedicamentChange
            "
          />
        </div>
      </div>
    </fieldset>
    <DsfrHighlight
      text="Quelle est l’organisation prévue en matière de distribution et de stockage des médicaments ?"
      :small="false"
      :large="true"
    />
    <DsfrHighlight
      text="Il est souhaitable que les modalités de détention, de mise à disposition et de transmission des clés, codes d’accès, etc. des différents dispositifs de rangement des médicaments fassent l’objet d’une procédure écrite."
      :small="false"
      :large="true"
    />
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="stockageMedicamentSecurise"
            legend="Stockage des médicaments dans un lieu sécurisé ?"
            :required="true"
            :model-value="stockageMedicamentSecurise"
            :options="ouiNonOptions"
            :is-valid="stockageMedicamentSecuriseMeta"
            :inline="true"
            :error-message="stockageMedicamentSecuriseErrorMessage"
            @update:model-value="onStockageMedicamentSecuriseChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="stockageMedicamentSecurise" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionStockageMedicamentSecurise"
            :required="true"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionStockageMedicamentSecurise"
            :error-message="precisionStockageMedicamentSecuriseErrorMessage"
            :is-valid="precisionStockageMedicamentSecuriseMeta"
            @update:model-value="onPrecisionStockageMedicamentSecuriseChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="conservationMedicamentThermosensible"
            legend="Un dispositif est-il prévu pour la conservation des médicaments thermosensibles ?"
            :required="true"
            :model-value="conservationMedicamentThermosensible"
            :options="ouiNonOptions"
            :is-valid="conservationMedicamentThermosensibleMeta"
            :inline="true"
            :error-message="conservationMedicamentThermosensibleErrorMessage"
            @update:model-value="onConservationMedicamentThermosensibleChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="conservationMedicamentThermosensible" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionConservationMedicament"
            :required="true"
            label="Stockage des médicaments dans un lieu garantissant leur parfaite conservation. Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionConservationMedicament"
            :error-message="precisionConservationMedicamentErrorMessage"
            :is-valid="precisionConservationMedicamentMeta"
            @update:model-value="onPrecisionConservationMedicamentChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="individualisationMedicaments"
            legend="Individualisation des médicaments ?"
            :required="true"
            :model-value="individualisationMedicaments"
            :options="ouiNonOptions"
            :is-valid="individualisationMedicamentsMeta"
            :inline="true"
            :error-message="individualisationMedicamentsErrorMessage"
            @update:model-value="onIndividualisationMedicamentsChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="individualisationMedicaments" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionIndividualisationMedicaments"
            :required="false"
            label="Précisez"
            :label-visible="true"
            placeholder=""
            :is-textarea="true"
            :model-value="precisionIndividualisationMedicaments"
            :error-message="precisionIndividualisationMedicamentsErrorMessage"
            :is-valid="precisionIndividualisationMedicamentsMeta"
            @update:model-value="onPrecisionIndividualisationMedicamentsChange"
          />
        </div>
      </div>
    </fieldset>

    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="preparationPilluliers"
            legend="Méthode retenue pour la préparation des piluliers"
            :required="true"
            :model-value="preparationPilluliers"
            :options="preparationPilluliersOptions"
            :is-valid="preparationPilluliersMeta"
            :inline="true"
            :error-message="preparationPilluliersErrorMessage"
            @update:model-value="onPreparationPilluliersChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset
      v-if="
        preparationPilluliers === 'prepares_prealablement' ||
        preparationPilluliers === 'au_fur_et_a_mesure'
      "
      class="fr-fieldset"
    >
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionPreparationPilluliers"
            :required="false"
            label="Précisez"
            :label-visible="true"
            placeholder=""
            :is-textarea="true"
            :model-value="precisionPreparationPilluliers"
            :error-message="precisionPreparationPilluliersErrorMessage"
            :is-valid="precisionPreparationPilluliersMeta"
            @update:model-value="onPrecisionPreparationPilluliersChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="prescriptionMedicaleJointe"
            legend="une prescription médicale est-elle jointe à chaque pilulier ?"
            :required="true"
            :model-value="prescriptionMedicaleJointe"
            :options="ouiNonOptions"
            :is-valid="prescriptionMedicaleJointeMeta"
            :inline="true"
            :error-message="prescriptionMedicaleJointeErrorMessage"
            @update:model-value="onPrescriptionMedicaleJointeChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="protocoleModificationTraitement"
            legend="Existe-t-il un protocole en cas de modification de traitement en cours de séjour ?"
            :required="true"
            :model-value="protocoleModificationTraitement"
            :options="ouiNonOptions"
            :is-valid="protocoleModificationTraitementMeta"
            :inline="true"
            :error-message="protocoleModificationTraitementErrorMessage"
            @update:model-value="onProtocoleModificationTraitementChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="protocoleModificationTraitement" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionProtocoleModificationTraitement"
            :required="true"
            placeholder=""
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            :model-value="precisionProtocoleModificationTraitement"
            :error-message="
              precisionProtocoleModificationTraitementErrorMessage
            "
            :is-valid="precisionProtocoleModificationTraitementMeta"
            @update:model-value="
              onPrecisionProtocoleModificationTraitementChange
            "
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="ficheSuiviMedicaments"
            legend="Existe-t-il une fiche de suivi de la distribution, de l’administration et de l’enregistrement des médicaments ?"
            :required="true"
            :model-value="ficheSuiviMedicaments"
            :options="ouiNonOptions"
            :is-valid="ficheSuiviMedicamentsMeta"
            :inline="true"
            :error-message="ficheSuiviMedicamentsErrorMessage"
            @update:model-value="onFicheSuiviMedicamentsChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="protocoleEvacuation"
            legend="Existe-t-il un protocole d’évacuation et de rapatriement des vacanciers si nécessaire au cours du séjour ?"
            :required="true"
            :model-value="protocoleEvacuation"
            :options="ouiNonOptions"
            :is-valid="protocoleEvacuationMeta"
            :inline="true"
            :error-message="protocoleEvacuationErrorMessage"
            @update:model-value="onProtocoleEvacuationChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="protocoleEvacuation" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionProtocoleEvacuation"
            :required="true"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionProtocoleEvacuation"
            :error-message="precisionProtocoleEvacuationErrorMessage"
            :is-valid="precisionProtocoleEvacuationMeta"
            @update:model-value="onPrecisionProtocoleEvacuationChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="protocoleAccident"
            legend="Existe-t-il un protocole en cas de chute, d’intoxication (alimentaire, médicamenteuse, etc.) ou autre accident ?"
            :required="true"
            :model-value="protocoleAccident"
            :options="ouiNonOptions"
            :is-valid="protocoleAccidentMeta"
            :inline="true"
            :error-message="protocoleAccidentErrorMessage"
            @update:model-value="onProtocoleAccidentChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="protocoleAccident" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionProtocoleAccident"
            :required="true"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionProtocoleAccident"
            :error-message="precisionProtocoleAccidentErrorMessage"
            :is-valid="precisionProtocoleAccidentMeta"
            @update:model-value="onPrecisionProtocoleAccidentChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="protocoleReorientation"
            legend="Existe-t-il un protocole en cas de réorientation (inadaptation des conditions générales du séjour à la situation de la personne handicapée) des vacanciers ?"
            :required="true"
            :model-value="protocoleReorientation"
            :options="ouiNonOptions"
            :is-valid="protocoleReorientationMeta"
            :inline="true"
            :error-message="protocoleReorientationErrorMessage"
            @update:model-value="onProtocoleReorientationChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="protocoleReorientation" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionProtocoleReorientation"
            :required="true"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionProtocoleReorientation"
            :error-message="precisionProtocoleReorientationErrorMessage"
            :is-valid="precisionProtocoleReorientationMeta"
            @update:model-value="onPrecisionProtocoleReorientationChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="protocoleCanicule"
            legend="Existe-t-il un protocole en cas d’alerte canicule (locaux, transports…) ?"
            :required="true"
            :model-value="protocoleCanicule"
            :options="ouiNonOptions"
            :is-valid="protocoleCaniculeMeta"
            :inline="true"
            :error-message="protocoleCaniculeErrorMessage"
            @update:model-value="onProtocoleCaniculeChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="protocoleCanicule" class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="precisionProtocoleCanicule"
            :required="true"
            label="Précisez"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="precisionProtocoleCanicule"
            :error-message="precisionProtocoleCaniculeErrorMessage"
            :is-valid="precisionProtocoleCaniculeMeta"
            @update:model-value="onPrecisionProtocoleCaniculeChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="gestionBudgetPersonnel"
            :required="true"
            label="Précisez les conditions prévues pour la gestion sur place du budget personnel des vacanciers (si les vacanciers en font la demande)"
            :label-visible="true"
            :is-textarea="true"
            placeholder=""
            :model-value="gestionBudgetPersonnel"
            :error-message="gestionBudgetPersonnelErrorMessage"
            :is-valid="gestionBudgetPersonnelMeta"
            @update:model-value="onGestionBudgetPersonnelChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-4">
          <DsfrButton id="Suivant" @click="valid">Suivant</DsfrButton>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});
const emit = defineEmits(["valid"]);

const log = logger("components/protocole-sanitaire");

const constitutionEquipeOptions = [
  {
    label:
      "Une personne formée aux gestes et soins d’urgence (PSC 1, SST, AFGSU 1, AFGSU 2, AFSGSU)",
    id: "personne_formee",
    name: "personne_formee",
  },
  {
    label: "Un(e) infirmier(e)",
    id: "infirmier",
    name: "infirmier",
  },
  {
    label: "Un(e) aide soignant(e)",
    id: "aide_soignant",
    name: "aide_soignant",
  },
];

const responsableAdministrationMedicamentOptions = [
  {
    label: "Responsable du séjour",
    id: "responsable_sejour",
    name: "responsable_sejour",
  },
  {
    label: "Accompagnant(s)",
    id: "accompagnant",
    name: "accompagnant",
  },
  {
    label: "Professionnel de santé",
    id: "professionnel_sante",
    name: "professionnel_sante",
  },
];

const preparationPilluliersOptions = [
  { label: "Aucune méthode", id: "aucune", value: "aucune" },
  {
    label:
      "Piluliers préparés préalablement au séjour par le vacancier, sa famille, le représentant légal, l’établissement de résidence habituelle, le médecin",
    id: "prepares_prealablement",
    value: "prepares_prealablement",
  },
  {
    label: "Piluliers préparés durant le séjour",
    id: "au_fur_et_a_mesure",
    value: "au_fur_et_a_mesure",
  },
];

const schemaInfosSanitaires = {
  dispositionsSpecifiques: yup.boolean().required(),
  precisionDispositionsSpecifiques: yup
    .string()
    .when("dispositionsSpecifiques", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  constitutionEquipe: yup.array().required(),
  precisionConstitutionEquipe: yup.string().when("constitutionEquipe", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  troussePharmacie: yup.boolean().required(),
  responsableAdministrationMedicament: yup.array().required(),
  stockageMedicamentSecurise: yup.boolean().required(),
  precisionStockageMedicamentSecurise: yup
    .string()
    .when("stockageMedicamentSecurise", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  conservationMedicamentThermosensible: yup.boolean().required(),
  precisionConservationMedicament: yup.string().when("conservationMedicament", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  individualisationMedicaments: yup.boolean().required(),
  precisionIndividualisationMedicaments: yup
    .string()
    .when("individualisationMedicaments", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  preparationPilluliers: yup.string().required(),
  precisionPreparationPilluliers: yup.string().when("preparationPilluliers", {
    is: (preparationPilluliers) =>
      preparationPilluliers === "prepares_prealablement" ||
      preparationPilluliers === "au_fur_et_a_mesure",

    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  prescriptionMedicaleJointe: yup.boolean().required(),
  protocoleModificationTraitement: yup.boolean().required(),
  precisionProtocoleModificationTraitement: yup
    .string()
    .when("protocoleModificationTraitement", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  ficheSuiviMedicaments: yup.string().required(),
  protocoleEvacuation: yup.boolean().required(),
  precisionProtocoleEvacuation: yup.string().when("protocoleEvacuation", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  protocoleAccident: yup.boolean().required(),
  precisionProtocoleAccident: yup.string().when("protocoleAccident", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  protocoleReorientation: yup.boolean().required(),
  precisionProtocoleReorientation: yup.string().when("protocoleReorientation", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  //
  protocoleCanicule: yup.boolean().required(),
  precisionProtocoleCanicule: yup.string().when("protocoleCanicule", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  gestionBudgetPersonnel: yup.string().required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosSanitaires,
  }),
);

const initialValues = computed(() => ({
  dispositionsSpecifiques: props.initData?.dispositionsSpecifiques,
  precisionDispositionsSpecifiques:
    props.initData?.precisionDispositionsSpecifiques,
  constitutionEquipe: props.initData?.constitutionEquipe ?? [],
  precisionConstitutionEquipe: props.initData?.precisionConstitutionEquipe,
  troussePharmacie: props.initData?.troussePharmacie,
  responsableAdministrationMedicament:
    props.initData?.responsableAdministrationMedicament ?? [],
  precisionResponsableAdministrationMedicament:
    props.initData?.precisionResponsableAdministrationMedicament,
  stockageMedicamentSecurise: props.initData?.stockageMedicamentSecurise,
  precisionStockageMedicamentSecurise:
    props.initData?.precisionStockageMedicamentSecurise,
  conservationMedicamentThermosensible:
    props.initData?.conservationMedicamentThermosensible,
  precisionConservationMedicament:
    props.initData?.precisionConservationMedicament,
  individualisationMedicaments: props.initData?.individualisationMedicaments,
  precisionIndividualisationMedicaments:
    props.initData?.precisionIndividualisationMedicaments,
  preparationPilluliers: props.initData?.preparationPilluliers,
  precisionPreparationPilluliers:
    props.initData?.precisionPreparationPilluliers,
  prescriptionMedicaleJointe: props.initData?.prescriptionMedicaleJointe,
  protocoleModificationTraitement:
    props.initData?.protocoleModificationTraitement,
  precisionProtocoleModificationTraitement:
    props.initData?.precisionProtocoleModificationTraitement,
  ficheSuiviMedicaments: props.initData?.ficheSuiviMedicaments,
  protocoleEvacuation: props.initData?.protocoleEvacuation,
  precisionProtocoleEvacuation: props.initData?.precisionProtocoleEvacuation,
  protocoleAccident: props.initData?.protocoleAccident,
  precisionProtocoleAccident: props.initData?.precisionProtocoleAccident,
  protocoleReorientation: props.initData?.protocoleReorientation,
  precisionProtocoleReorientation:
    props.initData?.precisionProtocoleReorientation,
  protocoleCanicule: props.initData?.protocoleCanicule,
  precisionProtocoleCanicule: props.initData?.precisionProtocoleCanicule,
  gestionBudgetPersonnel: props.initData?.gestionBudgetPersonnel,
}));
const { meta, values, resetForm } = useForm({
  validationSchema,
  initialValues,
});

const {
  value: dispositionsSpecifiques,
  errorMessage: dispositionsSpecifiquesErrorMessage,
  handleChange: onDispositionsSpecifiquesChange,
  meta: dispositionsSpecifiquesMeta,
} = useField("dispositionsSpecifiques");
const {
  value: precisionDispositionsSpecifiques,
  errorMessage: precisionDispositionsSpecifiquesErrorMessage,
  handleChange: onPrecisionDispositionsSpecifiquesChange,
  meta: precisionDispositionsSpecifiquesMeta,
} = useField("precisionDispositionsSpecifiques");
const { value: constitutionEquipe } = useField("constitutionEquipe");
const {
  value: precisionConstitutionEquipe,
  errorMessage: precisionConstitutionEquipeErrorMessage,
  handleChange: onPrecisionConstitutionEquipeChange,
  meta: precisionConstitutionEquipeMeta,
} = useField("precisionConstitutionEquipe");
const {
  value: troussePharmacie,
  errorMessage: troussePharmacieErrorMessage,
  handleChange: onTroussePharmacieChange,
  meta: troussePharmacieMeta,
} = useField("troussePharmacie");
const { value: responsableAdministrationMedicament } = useField(
  "responsableAdministrationMedicament",
);
const {
  value: precisionResponsableAdministrationMedicament,
  errorMessage: precisionResponsableAdministrationMedicamentErrorMessage,
  handleChange: onPrecisionResponsableAdministrationMedicamentChange,
  meta: precisionResponsableAdministrationMedicamentMeta,
} = useField("precisionResponsableAdministrationMedicament");
const {
  value: stockageMedicamentSecurise,
  errorMessage: stockageMedicamentSecuriseErrorMessage,
  handleChange: onStockageMedicamentSecuriseChange,
  meta: stockageMedicamentSecuriseMeta,
} = useField("stockageMedicamentSecurise");
const {
  value: precisionStockageMedicamentSecurise,
  errorMessage: precisionStockageMedicamentSecuriseErrorMessage,
  handleChange: onPrecisionStockageMedicamentSecuriseChange,
  meta: precisionStockageMedicamentSecuriseMeta,
} = useField("precisionStockageMedicamentSecurise");
const {
  value: conservationMedicamentThermosensible,
  errorMessage: conservationMedicamentThermosensibleErrorMessage,
  handleChange: onConservationMedicamentThermosensibleChange,
  meta: conservationMedicamentThermosensibleMeta,
} = useField("conservationMedicamentThermosensible");
const {
  value: precisionConservationMedicament,
  errorMessage: precisionConservationMedicamentErrorMessage,
  handleChange: onPrecisionConservationMedicamentChange,
  meta: precisionConservationMedicamentMeta,
} = useField("precisionConservationMedicament");
const {
  value: individualisationMedicaments,
  errorMessage: individualisationMedicamentsErrorMessage,
  handleChange: onIndividualisationMedicamentsChange,
  meta: individualisationMedicamentsMeta,
} = useField("individualisationMedicaments");
const {
  value: precisionIndividualisationMedicaments,
  errorMessage: precisionIndividualisationMedicamentsErrorMessage,
  handleChange: onPrecisionIndividualisationMedicamentsChange,
  meta: precisionIndividualisationMedicamentsMeta,
} = useField("precisionIndividualisationMedicaments");
const {
  value: preparationPilluliers,
  errorMessage: preparationPilluliersErrorMessage,
  handleChange: onPreparationPilluliersChange,
  meta: preparationPilluliersMeta,
} = useField("preparationPilluliers");
const {
  value: precisionPreparationPilluliers,
  errorMessage: precisionPreparationPilluliersErrorMessage,
  handleChange: onPrecisionPreparationPilluliersChange,
  meta: precisionPreparationPilluliersMeta,
} = useField("precisionPreparationPilluliers");
const {
  value: prescriptionMedicaleJointe,
  errorMessage: prescriptionMedicaleJointeErrorMessage,
  handleChange: onPrescriptionMedicaleJointeChange,
  meta: prescriptionMedicaleJointeMeta,
} = useField("prescriptionMedicaleJointe");
const {
  value: protocoleModificationTraitement,
  errorMessage: protocoleModificationTraitementErrorMessage,
  handleChange: onProtocoleModificationTraitementChange,
  meta: protocoleModificationTraitementMeta,
} = useField("protocoleModificationTraitement");
const {
  value: precisionProtocoleModificationTraitement,
  errorMessage: precisionProtocoleModificationTraitementErrorMessage,
  handleChange: onPrecisionProtocoleModificationTraitementChange,
  meta: precisionProtocoleModificationTraitementMeta,
} = useField("precisionProtocoleModificationTraitement");
const {
  value: ficheSuiviMedicaments,
  errorMessage: ficheSuiviMedicamentsErrorMessage,
  handleChange: onFicheSuiviMedicamentsChange,
  meta: ficheSuiviMedicamentsMeta,
} = useField("ficheSuiviMedicaments");
const {
  value: protocoleEvacuation,
  errorMessage: protocoleEvacuationErrorMessage,
  handleChange: onProtocoleEvacuationChange,
  meta: protocoleEvacuationMeta,
} = useField("protocoleEvacuation");
const {
  value: precisionProtocoleEvacuation,
  errorMessage: precisionProtocoleEvacuationErrorMessage,
  handleChange: onPrecisionProtocoleEvacuationChange,
  meta: precisionProtocoleEvacuationMeta,
} = useField("precisionProtocoleEvacuation");
const {
  value: protocoleAccident,
  errorMessage: protocoleAccidentErrorMessage,
  handleChange: onProtocoleAccidentChange,
  meta: protocoleAccidentMeta,
} = useField("protocoleAccident");
const {
  value: precisionProtocoleAccident,
  errorMessage: precisionProtocoleAccidentErrorMessage,
  handleChange: onPrecisionProtocoleAccidentChange,
  meta: precisionProtocoleAccidentMeta,
} = useField("precisionProtocoleAccident");
const {
  value: protocoleReorientation,
  errorMessage: protocoleReorientationErrorMessage,
  handleChange: onProtocoleReorientationChange,
  meta: protocoleReorientationMeta,
} = useField("protocoleReorientation");
const {
  value: precisionProtocoleReorientation,
  errorMessage: precisionProtocoleReorientationErrorMessage,
  handleChange: onPrecisionProtocoleReorientationChange,
  meta: precisionProtocoleReorientationMeta,
} = useField("precisionProtocoleReorientation");
const {
  value: protocoleCanicule,
  errorMessage: protocoleCaniculeErrorMessage,
  handleChange: onProtocoleCaniculeChange,
  meta: protocoleCaniculeMeta,
} = useField("protocoleCanicule");
const {
  value: precisionProtocoleCanicule,
  errorMessage: precisionProtocoleCaniculeErrorMessage,
  handleChange: onPrecisionProtocoleCaniculeChange,
  meta: precisionProtocoleCaniculeMeta,
} = useField("precisionProtocoleCanicule");
const {
  value: gestionBudgetPersonnel,
  errorMessage: gestionBudgetPersonnelErrorMessage,
  handleChange: onGestionBudgetPersonnelChange,
  meta: gestionBudgetPersonnelMeta,
} = useField("gestionBudgetPersonnel");

function valid() {
  log.d("valid - IN");
  emit("valid", { ...values, meta: meta.value.valid }, "protocole_sanitaire");
}

onMounted(() => {
  resetForm({ values: initialValues.value });
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
