<template>
  <div>
    <DsfrFieldset
      hint="Sauf mention contraire “(optionnel)” dans le label, tous les champs  sont obligatoires"
    >
      <div class="fr-fieldset__element">
        <DsfrHighlight
          v-if="DeclarationSejour.isPost8Jour(declarationStatut)"
          text="Les accompagnants et le responsable du déroulement du séjour sur le lieu de vacances ne doivent pas avoir fait l’objet d’une condamnation inscrite au bulletin n°3 du casier judiciaire (article R412-14 du code du tourisme)."
          :small="false"
          :large="true"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="nombreResponsable"
          label="Nombre total de personnes responsables du déroulement du séjour sur le(s) lieu(x) de séjour"
          :label-visible="true"
          :model-value="nombreResponsable"
          :readonly="
            !props.modifiable || DeclarationSejour.isUpdate8Jour(declarationStatut)
          "
          :is-valid="nombreResponsableMeta.valid"
          :error-message="nombreResponsableErrorMessage"
          placeholder="nombre total de responsable"
          @update:model-value="onNombreResponsableChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrInputGroup
          name="nombreAccompagnant"
          label="Nombre total d'accompagnants sur le(s) lieu(x) de séjour"
          :label-visible="true"
          :model-value="nombreAccompagnant"
          :readonly="
            !props.modifiable ||
            declarationStatut === DeclarationSejour.statuts.ATTENTE_8_JOUR ||
            declarationStatut === DeclarationSejour.statuts.A_MODIFIER_8J
          "
          :is-valid="nombreAccompagnantMeta.valid"
          :error-message="nombreAccompagnantErrorMessage"
          placeholder="nombre total d'accompagnant"
          @update:model-value="onNombreAccompagnantChange"
        />
      </div>
      <div class="fr-fieldset__element">
        <DsfrRadioButtonSet
          name="procedureRecrutementSupplementaire"
          legend="Procédure en cas de recrutement de personnels supplémentaires durant
          le séjour"
          :disabled="!props.modifiable"
          :model-value="procedureRecrutementSupplementaire"
          :options="ouiNonOptions"
          :is-valid="procedureRecrutementSupplementaireMeta.valid"
          :inline="true"
          :error-message="procedureRecrutementSupplementaireErrorMessage"
          @update:model-value="onProcedureRecrutementSupplementaireChange"
        />
      </div>
      <div
        v-if="DeclarationSejour.isPost8Jour(declarationStatut)"
        class="fr-fieldset__element"
      >
        <DsfrInputGroup
          name="formation"
          label="Organisation, contenu  et durée d’une session de formation/information en amont de l’arrivée des vacanciers en vue de la coordination des équipes d’accompagnement"
          :label-visible="true"
          :model-value="formation"
          :readonly="!props.modifiable"
          :is-valid="formationMeta.valid"
          :error-message="formationErrorMessage"
          placeholder=""
          @update:model-value="onFormationChange"
        >
        </DsfrInputGroup>
      </div>
    </DsfrFieldset>
    <DsfrAccordionsGroup
      v-if="DeclarationSejour.isPost8Jour(declarationStatut)"
    >
      <DsfrAccordion
        :id="1"
        :expanded-id="expandedId"
        @expand="(id) => (expandedId = id)"
      >
        <template #title>
          <span :style="accompagnantsMeta.valid ?? 'color: #b34000'"
            >Personnel d'encadrement&nbsp;</span
          >
          <DsfrBadge
            :label="encadrantsMeta.valid ? 'Complet' : 'Incomplet'"
            :small="true"
            :type="encadrantsMeta.valid ? 'success' : 'warning'"
          />
        </template>
        <div class="fr-fieldset__element fr-input-group fr-col-12">
          <DSPersonnel
            :personnes="encadrants"
            :modifiable="props.modifiable"
            :show-adresse="false"
            :show-attestation="true"
            :show-competence="true"
            :show-date-naissance="true"
            :show-email="false"
            :show-fonction="false"
            :show-liste-fonction="true"
            :show-telephone="true"
            titre="Personnel d'encadrement"
            label-bouton-ajouter="Ajouter un encadrant"
            @update-personne="updateEncadrants"
          ></DSPersonnel>
        </div>
      </DsfrAccordion>
      <DsfrAccordion
        :id="2"
        :expanded-id="expandedId"
        @expand="(id) => (expandedId = id)"
      >
        <template #title>
          <span :style="accompagnantsMeta.valid ?? 'color: #b34000'"
            >Personnel d'accompagnement&nbsp;</span
          >
          <DsfrBadge
            :label="accompagnantsMeta.valid ? 'Complet' : 'Incomplet'"
            :small="true"
            :type="accompagnantsMeta.valid ? 'success' : 'warning'"
          />
        </template>
        <div class="fr-fieldset__element fr-input-group fr-col-12">
          <DSPersonnel
            :personnes="accompagnants"
            :modifiable="props.modifiable"
            :show-adresse="false"
            :show-attestation="true"
            :show-competence="true"
            :show-date-naissance="true"
            :show-email="false"
            :show-fonction="false"
            :show-liste-fonction="true"
            :show-telephone="true"
            titre="Personnel d'accompagnement"
            label-bouton-ajouter="Ajouter un accompagnant"
            @update-personne="updateAccompagnant"
          >
          </DSPersonnel>
        </div>
      </DsfrAccordion>
      <DsfrAccordion
        :id="3"
        :expanded-id="expandedId"
        :title="`Prestataire en charge des médicaments - ${prestatairesMedicaments.length ?? 0}`"
        @expand="(id) => (expandedId = id)"
      >
        <DSPrestataires
          :modifiable="props.modifiable"
          :prestataires="prestatairesMedicaments"
          titre="Prestaire en charge des médicaments"
          @update-prestataire="updatePrestatairesMedicaments"
        >
        </DSPrestataires>
      </DsfrAccordion>
      <DsfrAccordion
        :id="4"
        :expanded-id="expandedId"
        :title="`Prestataire en charge du transport des vacanciers - ${prestatairesTransport.length ?? 0}`"
        @expand="(id) => (expandedId = id)"
      >
        <DSPrestataires
          :modifiable="props.modifiable"
          :prestataires="prestatairesTransport"
          titre="Prestaire en charge du transport"
          @update-prestataire="updatePrestatairesTransport"
        >
        </DSPrestataires>
      </DsfrAccordion>
      <DsfrAccordion
        :id="5"
        :expanded-id="expandedId"
        :title="`Prestataire en charge de la restauration - ${prestatairesRestauration.length ?? 0}`"
        @expand="(id) => (expandedId = id)"
      >
        <DSPrestataires
          :modifiable="props.modifiable"
          :prestataires="prestatairesRestauration"
          titre="Prestaire en charge de la restauration"
          @update-prestataire="updatePrestatairesRestauration"
        >
        </DSPrestataires>
      </DsfrAccordion>
      <DsfrAccordion
        :id="6"
        :expanded-id="expandedId"
        :title="`Prestataire en charge de l’entretien et du ménage - ${prestatairesEntretien.length ?? 0}`"
        @expand="(id) => (expandedId = id)"
      >
        <DSPrestataires
          :modifiable="props.modifiable"
          :prestataires="prestatairesEntretien"
          titre="Prestaire en charge de l'entretien"
          @update-prestataire="updatePrestatairesEntretien"
        >
        </DSPrestataires>
      </DsfrAccordion>
      <DsfrAccordion
        :id="7"
        :expanded-id="expandedId"
        :title="`Prestataire en charge d'encadrer les activités spécifiques - ${prestatairesActivites.length ?? 0}`"
        @expand="(id) => (expandedId = id)"
      >
        <DSPrestataires
          :modifiable="props.modifiable"
          :prestataires="prestatairesActivites"
          titre="Prestaire en charge des activités'"
          @update-prestataire="updatePrestatairesActivites"
        >
        </DSPrestataires>
      </DsfrAccordion>
    </DsfrAccordionsGroup>
    <div class="fr-mb-5w">
      <!-- Cette div sert a compenser le margin bottom par défault des dsfr-table qui est de 2.5rem.
          On cherche a rapprocher le bouton du tableau -->
      <div class="fr-mb-n6v"></div>
    </div>
    <DsfrFieldset v-if="props.showButtons">
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
        <DsfrButton id="next-step" @click.prevent="next">Suivant</DsfrButton>
      </DsfrButtonGroup>
    </DsfrFieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { DeclarationSejour } from "#imports";

const log = logger("components/DS/informations-personnel");

const props = defineProps({
  initData: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
});
const emit = defineEmits(["previous", "next", "update"]);

const demandeSejourStore = useDemandeSejourStore();
const declarationStatut = computed(() => {
  return demandeSejourStore.demandeCourante.statut;
});

const expandedId = ref(0);

const validationSchema = yup.object(
  informationsPersonnel.schema(declarationStatut.value),
);

const initialValues = {
  nombreResponsable:
    declarationStatut.value === DeclarationSejour.statuts.ATTENTE_8_JOUR ||
    declarationStatut === DeclarationSejour.statuts.A_MODIFIER_8J
      ? props.initData.encadrants?.length ?? "0"
      : props.initData.nombreResponsable ?? null,
  encadrants: props.initData.encadrants ?? [],
  accompagnants: props.initData.accompagnants ?? [],
  prestatairesMedicaments: props.initData.prestatairesMedicaments ?? [],
  prestatairesTransport: props.initData.prestatairesTransport ?? [],
  prestatairesRestauration: props.initData.prestatairesRestauration ?? [],
  prestatairesEntretien: props.initData.prestatairesEntretien ?? [],
  prestatairesActivites: props.initData.prestatairesActivites ?? [],
  formation: props.initData.formation,
  procedureRecrutementSupplementaire:
    props.initData.procedureRecrutementSupplementaire ?? null,
  nombreAccompagnant:
    declarationStatut.value === DeclarationSejour.statuts.ATTENTE_8_JOUR ||
    declarationStatut.value === DeclarationSejour.statuts.A_MODIFIER_8J
      ? props.initData.accompagnants?.length ?? "0"
      : props.initData.nombreAccompagnant ?? null,
};

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
});
const {
  value: nombreAccompagnant,
  errorMessage: nombreAccompagnantErrorMessage,
  handleChange: onNombreAccompagnantChange,
  meta: nombreAccompagnantMeta,
} = useField("nombreAccompagnant");
const { value: encadrants, meta: encadrantsMeta } = useField("encadrants");
const { value: accompagnants, meta: accompagnantsMeta } =
  useField("accompagnants");
const { value: prestatairesMedicaments } = useField("prestatairesMedicaments");
const { value: prestatairesTransport } = useField("prestatairesTransport");
const { value: prestatairesRestauration } = useField(
  "prestatairesRestauration",
);
const { value: prestatairesEntretien } = useField("prestatairesEntretien");
const { value: prestatairesActivites } = useField("prestatairesActivites");
const {
  value: formation,
  errorMessage: formationErrorMessage,
  handleChange: onFormationChange,
  meta: formationMeta,
} = useField("formation");
const {
  value: nombreResponsable,
  errorMessage: nombreResponsableErrorMessage,
  handleChange: onNombreResponsableChange,
  meta: nombreResponsableMeta,
} = useField("nombreResponsable");
const {
  value: procedureRecrutementSupplementaire,
  errorMessage: procedureRecrutementSupplementaireErrorMessage,
  handleChange: onProcedureRecrutementSupplementaireChange,
  meta: procedureRecrutementSupplementaireMeta,
} = useField("procedureRecrutementSupplementaire");

function updateEncadrants(personnes) {
  encadrants.value = personnes;
  nombreResponsable.value = encadrants.value?.length;
}

function updateAccompagnant(personnes) {
  accompagnants.value = personnes;
  nombreAccompagnant.value = accompagnants.value?.length;
}

function updatePrestatairesMedicaments(prestataires) {
  log.i("updatePrestatairesMedicaments - In");
  log.i(prestataires);
  prestatairesMedicaments.value = prestataires;
}

function updatePrestatairesTransport(prestataires) {
  log.i("updatePrestatairesTransport - In");
  log.i(prestataires);
  prestatairesTransport.value = prestataires;
}

function updatePrestatairesRestauration(prestataires) {
  log.i("updatePrestatairesRestauration - In");
  log.i(prestataires);
  prestatairesRestauration.value = prestataires;
}

function updatePrestatairesEntretien(prestataires) {
  log.i("updatePrestatairesEntretien - In");
  log.i(prestataires);
  prestatairesEntretien.value = prestataires;
}

function updatePrestatairesActivites(prestataires) {
  log.i("updatePrestatairesActivites - In");
  log.i(prestataires);
  prestatairesActivites.value = prestataires;
}

function next() {
  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    { ...values, meta: meta.value.valid },
    "informationsPersonnel",
  );
}
</script>

<style lang="scss" scoped></style>
