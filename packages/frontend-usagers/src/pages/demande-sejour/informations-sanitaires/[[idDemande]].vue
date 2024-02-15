<template>
  <div>
    <fieldset class="fr-fieldset">
      <DsfrHighlight
        text="L’acte d’administration proprement dit consiste à faire prendre le bon médicament au bon patient, à la bonne posologie, au bon moment, par la bonne voie. Cet acte inclut le contrôle de la prise effective du traitement. Il est recommandé que la distribution des médicaments préalablement préparés, leur administration et son enregistrement soient réalisés par la même personne."
        :small="false"
        :large="true"
      />
      <div class="fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="dispositionsSpecifiques"
            legend="Des dispositions d’ordre sanitaire spécifiques sont-elles prévues ?"
            :required="true"
            :model-value="dispositionsSpecifiques"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="dispositionsSpecifiquesMeta"
            :inline="true"
            :error-message="dispositionsSpecifiquesErrorMessage"
            @update:model-value="onDispositionsSpecifiquesChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="dispositionsSpecifiques" class="fr-fieldset">
      <div class="fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          v-model="constitutionEquipe"
          name="constitutionEquipe"
          legend="L’équipe comprend-elle ?"
          :options="[
            {
              label:
                'Une personne formée aux gestes et soins d’urgence (PSC 1, SST, AFGSU 1, AFGSU 2, AFSGSU)',
              id: 'personne_formee',
              name: 'personne_formee',
            },
            {
              label: 'Un(e) infirmier(e)',
              id: 'infirmier',
              name: 'infirmier',
            },
            {
              label: 'Un(e) aide soignant(e)',
              id: 'aide_soignant',
              name: 'aide_soignant',
            },
          ]"
          :small="true"
          :required="true"
        />
      </div>
    </fieldset>
    <fieldset v-if="constitutionEquipe.length > 0" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="precisionDispositionsSpecifiques"
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="troussePharmacie"
            legend="Présence d’une trousse à pharmacie de premier secours ?"
            :required="true"
            :model-value="troussePharmacie"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="troussePharmacieMeta"
            :inline="true"
            :error-message="troussePharmacieErrorMessage"
            @update:model-value="onTroussePharmacieChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          v-model="responsableAdministrationMedicament"
          name="responsableAdministrationMedicament"
          legend="Personne désignée en charge de la distribution et de l’administration des médicaments et de l’enregistrement de l’administration"
          :options="[
            {
              label: 'Responsable du séjour',
              id: 'responsable_sejour',
              name: 'responsable_sejour',
            },
            {
              label: 'Accompagnant(s)',
              id: 'accompagnant',
              name: 'accompagnant',
            },
            {
              label: 'Professionnel de santé',
              id: 'professionnel_sante',
              name: 'professionnel_sante',
            },
          ]"
          :small="true"
          :required="true"
        />
      </div>
    </fieldset>
    <fieldset
      v-if="responsableAdministrationMedicament.length > 0"
      class="fr-fieldset"
    >
      <div class="fr-fieldset__element fr-col-12">
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
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="stockageMedicamentSecurise"
            legend="Stockage des médicaments dans un lieu sécurisé ?"
            :required="true"
            :model-value="stockageMedicamentSecurise"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="stockageMedicamentSecuriseMeta"
            :inline="true"
            :error-message="stockageMedicamentSecuriseErrorMessage"
            @update:model-value="onStockageMedicamentSecuriseChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="conservationMedicamentThermosensible"
            legend="Un dispositif est-il prévu pour la conservation des médicaments thermosensibles ?"
            :required="true"
            :model-value="conservationMedicamentThermosensible"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="conservationMedicamentThermosensibleMeta"
            :inline="true"
            :error-message="conservationMedicamentThermosensibleErrorMessage"
            @update:model-value="onConservationMedicamentThermosensibleChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            name="individualisationMedicaments"
            legend="Individualisation des médicaments ?"
            :required="true"
            :model-value="individualisationMedicaments"
            :options="[
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ]"
            :is-valid="individualisationMedicamentsMeta"
            :inline="true"
            :error-message="individualisationMedicamentsErrorMessage"
            @update:model-value="onIndividualisationMedicamentsChange"
          />
        </div>
      </div>
    </fieldset>
    <fieldset v-if="individualisationMedicaments" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>

    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="preparationPilluliers"
          legend="Méthode retenue pour la préparation des piluliers"
          :required="true"
          :model-value="preparationPilluliers"
          :options="[
            { label: 'Aucune méthode', value: 'aucune' },
            {
              label:
                'Piluliers préparés préalablement au séjour par le vacancier, sa famille, le représentant légal, l’établissement de résidence habituelle, le médecin',
              value: 'prepares_prealablement',
            },
            {
              label: 'Piluliers préparés durant le séjour',
              value: 'au_fur_et_a_mesure',
            },
          ]"
          :is-valid="preparationPilluliersMeta"
          :inline="true"
          :error-message="preparationPilluliersErrorMessage"
          @update:model-value="onPreparationPilluliersChange"
        />
      </div>
    </fieldset>
    <fieldset
      v-if="
        preparationPilluliers.includes('prepares_prealablement') ||
        preparationPilluliers.includes('au_fur_et_a_mesure')
      "
      class="fr-fieldset"
    >
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="prescritionMedicaleJointe"
          legend="une prescription médicale est-elle jointe à chaque pilulier ?"
          :required="true"
          :model-value="prescritionMedicaleJointe"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="prescritionMedicaleJointeMeta"
          :inline="true"
          :error-message="prescritionMedicaleJointeErrorMessage"
          @update:model-value="onPrescritionMedicaleJointeChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="protocoleModificationTraitement"
          legend="Existe-t-il un protocole en cas de modification de traitement en cours de séjour ?"
          :required="true"
          :model-value="protocoleModificationTraitement"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="protocoleModificationTraitementMeta"
          :inline="true"
          :error-message="protocoleModificationTraitementErrorMessage"
          @update:model-value="onProtocoleModificationTraitementChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="protocoleModificationTraitement" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="precisionProtocoleModificationTraitement"
          :required="true"
          placeholder=""
          label="Précisez"
          :label-visible="true"
          :is-textarea="true"
          :model-value="precisionProtocoleModificationTraitement"
          :error-message="precisionProtocoleModificationTraitementErrorMessage"
          :is-valid="precisionProtocoleModificationTraitementMeta"
          @update:model-value="onPrecisionProtocoleModificationTraitementChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="ficheSuiviMedicaments"
          legend="Existe-t-il une fiche de suivi de la distribution, de l’administration et de l’enregistrement des médicaments ?"
          :required="true"
          :model-value="ficheSuiviMedicaments"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="ficheSuiviMedicamentsMeta"
          :inline="true"
          :error-message="ficheSuiviMedicamentsErrorMessage"
          @update:model-value="onFicheSuiviMedicamentsChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="protocoleEvacuation"
          legend="Existe-t-il un protocole d’évacuation et de rapatriement des vacanciers si nécessaire au cours du séjour ?"
          :required="true"
          :model-value="protocoleEvacuation"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="protocoleEvacuationMeta"
          :inline="true"
          :error-message="protocoleEvacuationErrorMessage"
          @update:model-value="onProtocoleEvacuationChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="protocoleEvacuation" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="protocoleAccident"
          legend="Existe-t-il un protocole en cas de chute, d’intoxication (alimentaire, médicamenteuse, etc.) ou autre accident ?"
          :required="true"
          :model-value="protocoleAccident"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="protocoleAccidentMeta"
          :inline="true"
          :error-message="protocoleAccidentErrorMessage"
          @update:model-value="onProtocoleAccidentChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="protocoleAccident" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="protocoleReorientation"
          legend="Existe-t-il un protocole en cas de réorientation (inadaptation des conditions générales du séjour à la situation de la personne handicapée) des vacanciers ?"
          :required="true"
          :model-value="protocoleReorientation"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="protocoleReorientationMeta"
          :inline="true"
          :error-message="protocoleReorientationErrorMessage"
          @update:model-value="onProtocoleReorientationChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="protocoleReorientation" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrRadioButtonSet
          name="protocoleCanicule"
          legend="Existe-t-il un protocole en cas d’alerte canicule (locaux, transports…) ?"
          :required="true"
          :model-value="protocoleCanicule"
          :options="[
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ]"
          :is-valid="protocoleCaniculeMeta"
          :inline="true"
          :error-message="protocoleCaniculeErrorMessage"
          @update:model-value="onProtocoleCaniculeChange"
        />
      </div>
    </fieldset>
    <fieldset v-if="protocoleCanicule" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
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
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="retour" :secondary="true" @click="back"
            >Retour</DsfrButton
          >
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="precedent" :secondary="true" @click="previous"
            >Précédent</DsfrButton
          >
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="Suivant" :disabled="!meta.valid" @click="next"
            >Suivant</DsfrButton
          >
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useDemandeSejourStore } from "@/stores/demande-sejour";
import { useOperateurStore } from "@/stores/operateur";
import { useLayoutStore } from "@/stores/layout";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected"],
  layout: "demande-sejour",
});

const log = logger("demande-sejour/informations-generales");

const demandeSejourStore = useDemandeSejourStore();
const operateurStore = useOperateurStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const schemaInfosSanitaires = {
  dispositionsSpecifiques: yup.string().required(),
  precisionDispositionsSpecifiques: yup.string(),
  constitutionEquipe: yup.array().required(),
  precisionConstitutionEquipe: yup.string(),
  troussePharmacie: yup.string().required(),
  responsableAdministrationMedicament: yup.array().required(),
  stockageMedicamentSecurise: yup.string().required(),
  precisionStockageMedicamentSecurise: yup.string(),
  conservationMedicamentThermosensible: yup.string().required(),
  precisionConservationMedicament: yup.string().required(),
  individualisationMedicaments: yup.string().required(),
  precisionIndividualisationMedicaments: yup.string(),
  preparationPilluliers: yup.string().required(),
  precisionPreparationPilluliers: yup.string(),
  prescritionMedicaleJointe: yup.string().required(),
  protocoleModificationTraitement: yup.string().required(),
  precisionProtocoleModificationTraitement: yup.string(),
  ficheSuiviMedicaments: yup.string().required(),
  protocoleEvacuation: yup.string().required(),
  precisionProtocoleEvacuation: yup.string(),
  protocoleAccident: yup.string().required(),
  precisionProtocoleAccident: yup.string(),
  protocoleReorientation: yup.string().required(),
  precisionProtocoleReorientation: yup.string(),
  protocoleCanicule: yup.string().required(),
  precisionProtocoleCanicule: yup.string(),
  gestionBudgetPersonnel: yup.string().required(),
};

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosSanitaires,
  }),
);

const initialValues = computed(() => ({
  dispositionsSpecifiques:
    demandeCourante.value?.informationsSanitaires?.dispositionsSpecifiques ||
    "",
  precisionDispositionsSpecifiques:
    demandeCourante.value?.informationsSanitaires
      ?.precisionDispositionsSpecifiques || "",
  constitutionEquipe:
    demandeCourante.value?.informationsSanitaires?.constitutionEquipe || [],
  precisionConstitutionEquipe:
    demandeCourante.value?.informationsSanitaires
      ?.precisionConstitutionEquipe || "",
  troussePharmacie:
    demandeCourante.value?.informationsSanitaires?.troussePharmacie || "",
  responsableAdministrationMedicament:
    demandeCourante.value?.informationsSanitaires
      ?.responsableAdministrationMedicament || [],
  precisionResponsableAdministrationMedicament:
    demandeCourante.value?.informationsSanitaires
      ?.precisionResponsableAdministrationMedicament || "",
  stockageMedicamentSecurise:
    demandeCourante.value?.informationsSanitaires?.stockageMedicamentSecurise ||
    "",
  precisionStockageMedicamentSecurise:
    demandeCourante.value?.informationsSanitaires
      ?.precisionStockageMedicamentSecurise || "",
  conservationMedicamentThermosensible:
    demandeCourante.value?.informationsSanitaires
      ?.conservationMedicamentThermosensible || "",
  precisionConservationMedicament:
    demandeCourante.value?.informationsSanitaires
      ?.precisionConservationMedicament || "",
  individualisationMedicaments:
    demandeCourante.value?.informationsSanitaires?.individualisationMedicaments || "",
  precisionIndividualisationMedicaments:
    demandeCourante.value?.informationsSanitaires
      ?.precisionIndividualisationMedicaments || "",
  preparationPilluliers:
    demandeCourante.value?.informationsSanitaires?.preparationPilluliers || "",
  precisionPreparationPilluliers:
    demandeCourante.value?.informationsSanitaires
      ?.precisionPreparationPilluliers || "",
  prescritionMedicaleJointe:
    demandeCourante.value?.informationsSanitaires?.prescritionMedicaleJointe ||
    "",
  protocoleModificationTraitement:
    demandeCourante.value?.informationsSanitaires
      ?.protocoleModificationTraitement || "",
  precisionProtocoleModificationTraitement:
    demandeCourante.value?.informationsSanitaires
      ?.precisionProtocoleModificationTraitement || "",
  ficheSuiviMedicaments:
    demandeCourante.value?.informationsSanitaires?.ficheSuiviMedicaments || "",
  protocoleEvacuation:
    demandeCourante.value?.informationsSanitaires?.protocoleEvacuation || "",
  precisionProtocoleEvacuation:
    demandeCourante.value?.informationsSanitaires
      ?.precisionProtocoleEvacuation || "",
  protocoleAccident:
    demandeCourante.value?.informationsSanitaires?.protocoleAccident || "",
  precisionProtocoleAccident:
    demandeCourante.value?.informationsSanitaires?.precisionProtocoleAccident ||
    "",
  protocoleReorientation:
    demandeCourante.value?.informationsSanitaires?.protocoleReorientation || "",
  precisionProtocoleReorientation:
    demandeCourante.value?.informationsSanitaires
      ?.precisionProtocoleReorientation || "",
  protocoleCanicule:
    demandeCourante.value?.informationsSanitaires?.protocoleCanicule || "",
  precisionProtocoleCanicule:
    demandeCourante.value?.informationsSanitaires?.precisionProtocoleCanicule ||
    "",
  gestionBudgetPersonnel:
    demandeCourante.value?.informationsSanitaires?.gestionBudgetPersonnel || "",
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
  value: prescritionMedicaleJointe,
  errorMessage: prescritionMedicaleJointeErrorMessage,
  handleChange: onPrescritionMedicaleJointeChange,
  meta: prescritionMedicaleJointeMeta,
} = useField("prescritionMedicaleJointe");
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

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/informations-transport/${route.params.idDemande}`,
  );
}

async function next() {
  log.d("next - IN");
  try {
    const url = `/sejour/${route.params.idDemande}`;
    await useFetchWithCredentials(url, {
      method: "POST",
      body: {
        parametre: {
          informationsSanitaires: { ...values },
        },
        type: "informationsSanitaires",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde",
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("informations sanitaires sauvegardées");
          await navigateTo(
            `/demande-sejour/hebergement/${route.params.idDemande}`,
          );
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(async () => {
  layoutStore.breadCrumb = "informations sanitaires";
  layoutStore.stepperIndex = 6;
  await operateurStore.setMyOperateur();
  await demandeSejourStore.setDemandeCourante(route.params.idDemande);
  if (!demandeCourante.value.informationsSanitaires) {
    log.d("mise a jour depuis fiche operateur");
    demandeCourante.value.informationsSanitaires =
      operateurStore.operateurCourant.protocoleSanitaire;
  }
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
