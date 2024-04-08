<template>
  <div>
    <DsfrFieldset legend="Modalités d’ordre sanitaire ">
      <DsfrHighlight
        v-if="props.modifiable"
        text="L’acte d’administration proprement dit consiste à faire prendre le bon médicament au bon patient, à la bonne posologie, au bon moment, par la bonne voie. Cet acte inclut le contrôle de la prise effective du traitement. Il est recommandé que la distribution des médicaments préalablement préparés, leur administration et son enregistrement soient réalisés par la même personne."
        :small="false"
        :large="true"
      />
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="dispositionsSpecifiques"
          legend="Des dispositions d’ordre sanitaire spécifiques sont-elles prévues ?"
          :disabled="!props.modifiable"
          :model-value="dispositionsSpecifiques"
          :options="ouiNonOptions"
          :is-valid="dispositionsSpecifiquesMeta.valid"
          :inline="true"
          :error-message="dispositionsSpecifiquesErrorMessage"
          @update:model-value="onDispositionsSpecifiquesChange"
        />
      </div>
      <div v-if="dispositionsSpecifiques" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionDispositionsSpecifiques"
          :readonly="!props.modifiable"
          label="Précisez"
          hint="Redimensionnez le champ pour saisir plus de ligne"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionDispositionsSpecifiques"
          :error-message="precisionDispositionsSpecifiquesErrorMessage"
          :is-valid="precisionDispositionsSpecifiquesMeta.valid"
          @update:model-value="onPrecisionDispositionsSpecifiquesChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrCheckboxSet
          v-model="constitutionEquipe"
          name="constitutionEquipe"
          legend="L’équipe comprend-elle ?"
          :error-message="constitutionEquipeErrorMessage"
          :options="protocoleSanitaire.constitutionEquipeOptions"
          :small="true"
          :disabled="!props.modifiable"
        />
      </div>
      <div v-if="constitutionEquipe.length > 0" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionConstitutionEquipe"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionConstitutionEquipe"
          :error-message="precisionConstitutionEquipeErrorMessage"
          :is-valid="precisionConstitutionEquipeMeta.valid"
          @update:model-value="onPrecisionConstitutionEquipeChange"
        />
      </div>

      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="accordCabinetMedical"
          legend="Un accord est-il passé avec un cabinet médical ou paramédical à
          proximité des lieux de séjour ?"
          :disabled="!props.modifiable"
          :model-value="accordCabinetMedical"
          :options="ouiNonOptions"
          :is-valid="accordCabinetMedicalMeta.valid"
          :inline="true"
          :error-message="accordCabinetMedicalErrorMessage"
          @update:model-value="onAccordCabinetMedicalChange"
        />
      </div>
      <div v-if="accordCabinetMedical" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionAccordCabinetMedical"
          :readonly="!props.modifiable"
          label="Précisez avec quelle structure et quel type d'accord a été passé."
          hint="Redimensionnez le champ pour saisir plus de ligne"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionAccordCabinetMedical"
          :error-message="precisionAccordCabinetMedicalErrorMessage"
          :is-valid="precisionAccordCabinetMedicalMeta.valid"
          @update:model-value="onPrecisionAccordCabinetMedicalChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="troussePharmacie"
          legend="Présence d’une trousse à pharmacie de premier secours ?"
          :disabled="!props.modifiable"
          :model-value="troussePharmacie"
          :options="ouiNonOptions"
          :is-valid="troussePharmacieMeta.valid"
          :inline="true"
          :error-message="troussePharmacieErrorMessage"
          @update:model-value="onTroussePharmacieChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset
      legend="Organisation prévue en matière de distribution et de stockage des médicaments"
    >
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrHighlight
            v-if="props.modifiable"
            text="L’acte d’administration proprement dit consiste à faire prendre le bon médicament au bon patient, à la bonne posologie, au bon moment, par la bonne voie. Cet acte inclut le contrôle de la prise effective du traitement. Il est recommandé que la distribution des médicaments préalablement préparés, leur administration et son enregistrement soient réalisés par la même personne."
          />

          <DsfrCheckboxSet
            v-model="responsableAdministrationMedicament"
            legend="Personne désignée en charge de la distribution et de
            l’administration des médicaments et de l’enregistrement de
            l’administration"
            name="responsableAdministrationMedicament"
            :options="
              protocoleSanitaire.responsableAdministrationMedicamentOptions
            "
            :error-message="responsableAdministrationMedicamentErrorMessage"
            :small="true"
            :disabled="!props.modifiable"
          />
        </div>
      </div>
      <div
        v-if="responsableAdministrationMedicament?.length > 0"
        class="fr-fieldset__element"
      >
        <DsfrInputGroup
          name="precisionResponsableAdministrationMedicament"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionResponsableAdministrationMedicament"
          :error-message="
            precisionResponsableAdministrationMedicamentErrorMessage
          "
          :is-valid="precisionResponsableAdministrationMedicamentMeta.valid"
          @update:model-value="
            onPrecisionResponsableAdministrationMedicamentChange
          "
        />
      </div>
      <DsfrHighlight
        v-if="props.modifiable"
        text="Il est souhaitable que les modalités de détention, de mise à disposition et de transmission des clés, codes d’accès, etc. des différents dispositifs de rangement des médicaments fassent l’objet d’une procédure écrite"
        :small="false"
        :large="true"
      />
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="stockageMedicamentSecurise"
          legend="Stockage des médicaments dans un lieu sécurisé (dispositif de rangement fermé à clé ou disposant d’un mode de fermeture assurant la même sécurité, dont les modalités d’accès sont maîtrisées et contrôlées) et garantissant leur parfaite conservation"
          :disabled="!props.modifiable"
          :model-value="stockageMedicamentSecurise"
          :options="ouiNonOptions"
          :is-valid="stockageMedicamentSecuriseMeta.valid"
          :inline="true"
          :error-message="stockageMedicamentSecuriseErrorMessage"
          @update:model-value="onStockageMedicamentSecuriseChange"
        />
      </div>
      <div v-if="stockageMedicamentSecurise" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionStockageMedicamentSecurise"
          :readonly="!props.modifiable"
          label="Précisez"
          hint="Redimensionnez le champ pour saisir plus de ligne"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionStockageMedicamentSecurise"
          :error-message="precisionStockageMedicamentSecuriseErrorMessage"
          :is-valid="precisionStockageMedicamentSecuriseMeta.valid"
          @update:model-value="onPrecisionStockageMedicamentSecuriseChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="conservationMedicamentThermosensible"
          legend="Un dispositif est-il prévu pour la conservation des médicaments
          thermosensibles ?"
          :disabled="!props.modifiable"
          :model-value="conservationMedicamentThermosensible"
          :options="ouiNonOptions"
          :is-valid="conservationMedicamentThermosensibleMeta.valid"
          :inline="true"
          :error-message="conservationMedicamentThermosensibleErrorMessage"
          @update:model-value="onConservationMedicamentThermosensibleChange"
        />
      </div>
      <DsfrHighlight
        v-if="props.modifiable"
        text="Les traitements de chaque vacancier doivent être identifiés a minima par son nom et son prénom. Il est recommandé de compléter ces mentions de la date de naissance, de la photographie, voire du nom de jeune fille des résidentes en cas d’homonymie."
        :small="false"
        :large="true"
      />
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="individualisationMedicaments"
          legend="Un dispositif est-il prévu pour individualiser les traitements de
          chaque vacancier ?"
          :disabled="!props.modifiable"
          :model-value="individualisationMedicaments"
          :options="ouiNonOptions"
          :is-valid="individualisationMedicamentsMeta.valid"
          :inline="true"
          :error-message="individualisationMedicamentsErrorMessage"
          @update:model-value="onIndividualisationMedicamentsChange"
        />
      </div>
      <div v-if="individualisationMedicaments" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionIndividualisationMedicaments"
          :readonly="!props.modifiable"
          label="Précisez le protocole en vigueur concernant le stockage permettant l’individualisation des médicaments."
          hint="Redimensionnez le champ pour saisir plus de ligne"
          :label-visible="true"
          placeholder=""
          :is-textarea="true"
          :model-value="precisionIndividualisationMedicaments"
          :error-message="precisionIndividualisationMedicamentsErrorMessage"
          :is-valid="precisionIndividualisationMedicamentsMeta.valid"
          @update:model-value="onPrecisionIndividualisationMedicamentsChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="preparationPilluliers"
          legend="Méthode retenue pour la préparation des piluliers"
          :disabled="!props.modifiable"
          :model-value="preparationPilluliers"
          :options="protocoleSanitaire.preparationPilluliersOptions"
          :is-valid="preparationPilluliersMeta.valid"
          :inline="true"
          :error-message="preparationPilluliersErrorMessage"
          @update:model-value="onPreparationPilluliersChange"
        />
      </div>
      <div
        v-if="
          preparationPilluliers === 'prepares_prealablement' ||
          preparationPilluliers === 'au_fur_et_a_mesure'
        "
        class="fr-fieldset__element"
      >
        >
        <DsfrInputGroup
          name="precisionPreparationPilluliers"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          placeholder=""
          :is-textarea="true"
          :model-value="precisionPreparationPilluliers"
          :error-message="precisionPreparationPilluliersErrorMessage"
          :is-valid="precisionPreparationPilluliersMeta.valid"
          @update:model-value="onPrecisionPreparationPilluliersChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="prescriptionMedicaleJointe"
          legend="Une prescription médicale est-elle jointe à chaque pilulier ?"
          :disabled="!props.modifiable"
          :model-value="prescriptionMedicaleJointe"
          :options="ouiNonOptions"
          :is-valid="prescriptionMedicaleJointeMeta.valid"
          :inline="true"
          :error-message="prescriptionMedicaleJointeErrorMessage"
          @update:model-value="onPrescriptionMedicaleJointeChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="protocoleModificationTraitement"
          legend="Existe-t-il un protocole en cas de modification de traitement en cours
          de séjour ?"
          :disabled="!props.modifiable"
          :model-value="protocoleModificationTraitement"
          :options="ouiNonOptions"
          :is-valid="protocoleModificationTraitementMeta.valid"
          :inline="true"
          :error-message="protocoleModificationTraitementErrorMessage"
          @update:model-value="onProtocoleModificationTraitementChange"
        />
      </div>
      <div v-if="protocoleModificationTraitement" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionProtocoleModificationTraitement"
          :readonly="!props.modifiable"
          placeholder=""
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          :model-value="precisionProtocoleModificationTraitement"
          :error-message="precisionProtocoleModificationTraitementErrorMessage"
          :is-valid="precisionProtocoleModificationTraitementMeta.valid"
          @update:model-value="onPrecisionProtocoleModificationTraitementChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="ficheSuiviMedicaments"
          legend="Existe-t-il une fiche de suivi de la distribution, de l’administration
          et de l’enregistrement des médicaments ?"
          :disabled="!props.modifiable"
          :model-value="ficheSuiviMedicaments"
          :options="ouiNonOptions"
          :is-valid="ficheSuiviMedicamentsMeta.valid"
          :inline="true"
          :error-message="ficheSuiviMedicamentsErrorMessage"
          @update:model-value="onFicheSuiviMedicamentsChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset legend="Autres protocoles">
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="protocoleEvacuation"
          legend="Existe-t-il un protocole d’évacuation et de rapatriement des
          vacanciers si nécessaire au cours du séjour ?"
          :disabled="!props.modifiable"
          :model-value="protocoleEvacuation"
          :options="ouiNonOptions"
          :is-valid="protocoleEvacuationMeta.valid"
          :inline="true"
          :error-message="protocoleEvacuationErrorMessage"
          @update:model-value="onProtocoleEvacuationChange"
        />
      </div>
      <div v-if="protocoleEvacuation" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionProtocoleEvacuation"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionProtocoleEvacuation"
          :error-message="precisionProtocoleEvacuationErrorMessage"
          :is-valid="precisionProtocoleEvacuationMeta.valid"
          @update:model-value="onPrecisionProtocoleEvacuationChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="protocoleAccident"
          legend="Existe-t-il un protocole en cas de chute, d’intoxication (alimentaire,
          médicamenteuse, etc.) ou autre accident ?"
          :disabled="!props.modifiable"
          :model-value="protocoleAccident"
          :options="ouiNonOptions"
          :is-valid="protocoleAccidentMeta.valid"
          :inline="true"
          :error-message="protocoleAccidentErrorMessage"
          @update:model-value="onProtocoleAccidentChange"
        />
      </div>
      <div v-if="protocoleAccident" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionProtocoleAccident"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionProtocoleAccident"
          :error-message="precisionProtocoleAccidentErrorMessage"
          :is-valid="precisionProtocoleAccidentMeta.valid"
          @update:model-value="onPrecisionProtocoleAccidentChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="protocoleReorientation"
          legend="Existe-t-il un protocole en cas de réorientation (inadaptation des
          conditions générales du séjour à la situation de la personne
          handicapée) des vacanciers ?"
          :disabled="!props.modifiable"
          :model-value="protocoleReorientation"
          :options="ouiNonOptions"
          :is-valid="protocoleReorientationMeta.valid"
          :inline="true"
          :error-message="protocoleReorientationErrorMessage"
          @update:model-value="onProtocoleReorientationChange"
        />
      </div>
      <div v-if="protocoleReorientation" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionProtocoleReorientation"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionProtocoleReorientation"
          :error-message="precisionProtocoleReorientationErrorMessage"
          :is-valid="precisionProtocoleReorientationMeta.valid"
          @update:model-value="onPrecisionProtocoleReorientationChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="protocoleCanicule"
          legend="Existe-t-il un protocole en cas d’alerte canicule ?"
          :disabled="!props.modifiable"
          :model-value="protocoleCanicule"
          :options="ouiNonOptions"
          :is-valid="protocoleCaniculeMeta.valid"
          :inline="true"
          :error-message="protocoleCaniculeErrorMessage"
          @update:model-value="onProtocoleCaniculeChange"
        />
      </div>
      <div v-if="protocoleCanicule" class="fr-fieldset__element">
        <DsfrInputGroup
          name="precisionProtocoleCanicule"
          :readonly="!props.modifiable"
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="precisionProtocoleCanicule"
          :error-message="precisionProtocoleCaniculeErrorMessage"
          :is-valid="precisionProtocoleCaniculeMeta.valid"
          @update:model-value="onPrecisionProtocoleCaniculeChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="gestionBudgetPersonnel"
          :readonly="!props.modifiable"
          label="Précisez les conditions prévues pour la gestion sur place du budget personnel des vacanciers (si les vacanciers en font la demande)"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="gestionBudgetPersonnel"
          :error-message="gestionBudgetPersonnelErrorMessage"
          :is-valid="gestionBudgetPersonnelMeta.valid"
          @update:model-value="onGestionBudgetPersonnelChange"
        />
      </div>
    </DsfrFieldset>
    <DsfrFieldset
      legend="Téléversement des pièces justificatives concernant les protocoles de santé"
    >
      <UtilsMultiFilesUpload
        v-model="files"
        label="Merci de joindre les documents requis pour les informations sanitaires"
        hint="Taille maximale : 5 Mo."
        :modifiable="props.modifiable"
      />
    </DsfrFieldset>
    <fieldset v-if="props.showButtons" class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
        <DsfrButton
          id="previous-step"
          :secondary="true"
          @click.prevent="
            () => {
              emit('previous');
            }
          "
          >Précédent
        </DsfrButton>
        <DsfrButton id="next-step" @click.prevent="valid">Suivant</DsfrButton>
      </DsfrButtonGroup>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
});
const emit = defineEmits(["previous", "next", "update"]);

const log = logger("components/protocole-sanitaire");

const validationSchema = yup.object(protocoleSanitaire.schema);

const initialValues = {
  files: props.initData.files ?? [],
  dispositionsSpecifiques: props.initData.dispositionsSpecifiques,
  precisionDispositionsSpecifiques:
    props.initData.precisionDispositionsSpecifiques,
  constitutionEquipe: props.initData.constitutionEquipe ?? [],
  precisionConstitutionEquipe: props.initData.precisionConstitutionEquipe,
  troussePharmacie: props.initData.troussePharmacie,
  accordCabinetMedical: props.initData.accordCabinetMedical,
  precisionAccordCabinetMedical: props.initData.precisionAccordCabinetMedical,
  responsableAdministrationMedicament:
    props.initData.responsableAdministrationMedicament ?? [],
  precisionResponsableAdministrationMedicament:
    props.initData.precisionResponsableAdministrationMedicament,
  stockageMedicamentSecurise: props.initData.stockageMedicamentSecurise,
  precisionStockageMedicamentSecurise:
    props.initData.precisionStockageMedicamentSecurise,
  conservationMedicamentThermosensible:
    props.initData.conservationMedicamentThermosensible,
  individualisationMedicaments: props.initData.individualisationMedicaments,
  precisionIndividualisationMedicaments:
    props.initData.precisionIndividualisationMedicaments,
  preparationPilluliers: props.initData.preparationPilluliers,
  precisionPreparationPilluliers: props.initData.precisionPreparationPilluliers,
  prescriptionMedicaleJointe: props.initData.prescriptionMedicaleJointe,
  protocoleModificationTraitement:
    props.initData.protocoleModificationTraitement,
  precisionProtocoleModificationTraitement:
    props.initData.precisionProtocoleModificationTraitement,
  ficheSuiviMedicaments: props.initData.ficheSuiviMedicaments,
  protocoleEvacuation: props.initData.protocoleEvacuation,
  precisionProtocoleEvacuation: props.initData.precisionProtocoleEvacuation,
  protocoleAccident: props.initData.protocoleAccident,
  precisionProtocoleAccident: props.initData.precisionProtocoleAccident,
  protocoleReorientation: props.initData.protocoleReorientation,
  precisionProtocoleReorientation:
    props.initData.precisionProtocoleReorientation,
  protocoleCanicule: props.initData.protocoleCanicule,
  precisionProtocoleCanicule: props.initData.precisionProtocoleCanicule,
  gestionBudgetPersonnel: props.initData.gestionBudgetPersonnel,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
});

const { value: files } = useField("files");

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
const {
  value: constitutionEquipe,
  meta: constitutionEquipeMeta,
  errorMessage: constitutionEquipeErrorMessage,
} = useField("constitutionEquipe");
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
const {
  value: accordCabinetMedical,
  errorMessage: accordCabinetMedicalErrorMessage,
  handleChange: onAccordCabinetMedicalChange,
  meta: accordCabinetMedicalMeta,
} = useField("accordCabinetMedical");
const {
  value: precisionAccordCabinetMedical,
  errorMessage: precisionAccordCabinetMedicalErrorMessage,
  handleChange: onPrecisionAccordCabinetMedicalChange,
  meta: precisionAccordCabinetMedicalMeta,
} = useField("precisionAccordCabinetMedical");
const {
  value: responsableAdministrationMedicament,
  errorMessage: responsableAdministrationMedicamentErrorMessage,
} = useField("responsableAdministrationMedicament");
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
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit("update", { ...values }, "protocole_sanitaire");
}
</script>

<style lang="scss" scoped></style>
