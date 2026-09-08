<template>
  <div v-if="isActionsVisible">
    <DsfrAlert
      class="fr-grid-row fr-alert--sm fr-my-3v"
      :role="'alert'"
      :description="alerteDescription"
      type="info"
      :closeable="false"
    />
    <DsfrModal
      name="modalComplement"
      :opened="isModalComplementOpened"
      title="Demande de compléments"
      size="lg"
      @close="closeModal('complement')"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description=""
        :have-commentaire="true"
        :have-required-file="false"
        :showRequiredFieldsMessage="true"
        valid-button="Confirmer"
        :submit-error-message="submitErrorMessage"
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.A_COMPLETER)"
        @close="closeModal('complement')"
      />
    </DsfrModal>
    <DsfrModal
      name="modalCorrection"
      :opened="isModalCorrectionOpened"
      title="Demande de correction"
      size="lg"
      @close="closeModal('correction')"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description=""
        :text-alert="textAlertModaleCorrection"
        :type-alert="'warning'"
        :have-commentaire="true"
        :have-required-file="false"
        :showRequiredFieldsMessage="true"
        valid-button="Envoyer la demande"
        :submit-error-message="submitErrorMessage"
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.A_CORRIGER)"
        @close="closeModal('correction')"
      />
    </DsfrModal>
    <DsfrModal
      name="modalModaleConfirmations"
      :opened="isModalModaleConfirmationsOpened"
      title="Confirmation de la complétude du dossier"
      size="lg"
      @close="closeModal('confirmation')"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description="Vous devez fournir un récépissé de complétude du dossier, qui sera transmis à l'organisateur."
        :text-alert="textAlertModaleConfirmations"
        :type-alert="'info'"
        :have-commentaire="false"
        :have-required-file="true"
        :showRequiredFieldsMessage="true"
        valid-button="Confirmer"
        :submit-error-message="submitErrorMessage"
        @valid="
          (payload) => onValidForm(payload, AGREMENT_STATUT.EN_INSTRUCTION)
        "
        @close="closeModal('confirmation')"
      />
    </DsfrModal>
    <DsfrModal
      name="modalRefuse"
      :opened="isModalRefusOpened"
      title="Refuser l'agrément"
      size="lg"
      @close="closeModal('refus')"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        :have-commentaire="false"
        :have-required-file="true"
        :showRequiredFieldsMessage="true"
        valid-button="Confirmer le refus"
        description="Pour le refus de l’agrément, veuillez fournir l’arrêté de refus qui sera transmis à l’organisateur."
        :submit-error-message="submitErrorMessage"
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.REFUSE)"
        @close="closeModal('refus')"
      />
    </DsfrModal>
    <DsfrModal
      name="modalModaleValidation"
      :opened="isModalModaleValidationOpened"
      title="Validation de l'agrément"
      size="lg"
      @close="closeModal('validation')"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description="Pour l’obtention de l’agrément, veuillez fournir l’arrêté qui sera transmis à l’organisateur."
        :have-commentaire="false"
        :have-required-file="true"
        :have-agrement-number="true"
        :showRequiredFieldsMessage="true"
        valid-button="Valider"
        :submit-error-message="submitErrorMessage"
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.VALIDE)"
        @close="closeModal('validation')"
      />
    </DsfrModal>

    <DsfrButtonGroup :inline-layout-when="true">
      <DsfrButton
        v-if="!isActionsCompletude"
        label="Demander des compléments à l'organisateur"
        tertiary
        type="button"
        @click="openModal('complement')"
      />
      <DsfrButton
        v-if="isActionsCompletude"
        label="Demander des corrections à l'organisateur"
        tertiary
        type="button"
        @click="openModal('correction')"
      />

      <DsfrButton
        label="Refuser l'agrément"
        secondary
        type="button"
        @click="openModal('refus')"
      />
      <DsfrButton
        v-if="!isActionsCompletude"
        label="Confirmer la complétude du dossier"
        primary
        type="button"
        @click="openModal('confirmation')"
      />
      <DsfrButton
        v-if="isActionsCompletude"
        label="Valider l'agrément"
        primary
        type="button"
        @click="openModal('validation')"
      />
    </DsfrButtonGroup>
  </div>
</template>

<script setup lang="ts">
import {
  AGREMENT_STATUT,
  FILE_CATEGORY,
  type AgrementFilesDto,
} from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";
import { useAgrementStore } from "~/stores/agrement";
import { useDocumentStore } from "~/stores/document";

const log = logger("components/agrements/ActionsStatut");

const agrementStore = useAgrementStore();
const documentStore = useDocumentStore();

const toaster = useToaster();
const props = defineProps<{
  cdnUrl: string;
}>();

const ALLOWED_STATUTS_ACTIONS = [
  AGREMENT_STATUT.PRIS_EN_CHARGE,
  AGREMENT_STATUT.EN_INSTRUCTION,
];

const isModalComplementOpened = ref(false);
const isModalCorrectionOpened = ref(false);
const isModalModaleConfirmationsOpened = ref(false);
const isModalModaleValidationOpened = ref(false);
const isModalRefusOpened = ref(false);

const modalOpenRefs = {
  complement: isModalComplementOpened,
  correction: isModalCorrectionOpened,
  confirmation: isModalModaleConfirmationsOpened,
  validation: isModalModaleValidationOpened,
  refus: isModalRefusOpened,
} as const;

type ModalKey = keyof typeof modalOpenRefs;

const modalKeyByStatut: Partial<Record<AGREMENT_STATUT, ModalKey>> = {
  [AGREMENT_STATUT.A_COMPLETER]: "complement",
  [AGREMENT_STATUT.A_CORRIGER]: "correction",
  [AGREMENT_STATUT.REFUSE]: "refus",
  [AGREMENT_STATUT.EN_INSTRUCTION]: "confirmation",
  [AGREMENT_STATUT.VALIDE]: "validation",
};

// anti double-clic.
const isSubmittingAction = ref(false);

const submitErrorMessage = ref<string | null>(null);

const textAlertModaleConfirmations = [
  "Cette étape ne constitue pas une décision d’agrément. Elle atteste uniquement que le dossier est complet.",
  "La décision d’agrément intervient à l’étape suivante, dans un délai de deux mois.",
];
const textAlertModaleCorrection = [
  "En envoyant la demande, le délai légal d’instruction de 2 mois sera suspendu jusqu’à réception complète des pièces complémentaires.",
];

const isActionsVisible = computed(() =>
  agrementStore.agrementCourant
    ? ALLOWED_STATUTS_ACTIONS.includes(
        agrementStore.agrementCourant.statut as AGREMENT_STATUT,
      )
    : false,
);

const alerteDescription = computed(() =>
  !isActionsCompletude.value
    ? "Vous devez confirmer la complétude du dossier et fournir un récépissé. Vous pourrez ensuite valider l’agrément et fournir l’arrêté."
    : "Valider l’agrément pour déposer le fichier de l’arrêté",
);
const isActionsCompletude = computed(
  () =>
    agrementStore?.agrementCourant?.statut === AGREMENT_STATUT.EN_INSTRUCTION,
);

const statutConfig: Partial<
  Record<
    AGREMENT_STATUT,
    {
      category: FILE_CATEGORY;
      description: string;
    }
  >
> = {
  [AGREMENT_STATUT.EN_INSTRUCTION]: {
    category: FILE_CATEGORY.COMPLETUDE,
    description:
      "Succès: la confirmation de complétude de l'agrément a été envoyée",
  },
  [AGREMENT_STATUT.REFUSE]: {
    category: FILE_CATEGORY.REFUS,
    description: "Le refus d'agrément a été envoyé",
  },
  [AGREMENT_STATUT.A_CORRIGER]: {
    category: FILE_CATEGORY.ACORRIGER,
    description: `Succès: la demande de correction a été envoyée`,
  },
  [AGREMENT_STATUT.A_COMPLETER]: {
    category: FILE_CATEGORY.AMODIFER,
    description: `Succès: la demande de complétion de l'agrément a été envoyée`,
  },
  [AGREMENT_STATUT.VALIDE]: {
    category: FILE_CATEGORY.ARRETE_AGREMENT,
    description: `Succès: la validation de l'agrément a été envoyée`,
  },
};

const modalOpenRefByStatut: Partial<Record<AGREMENT_STATUT, Ref<boolean>>> = {
  [AGREMENT_STATUT.A_COMPLETER]: isModalComplementOpened,
  [AGREMENT_STATUT.A_CORRIGER]: isModalCorrectionOpened,
  [AGREMENT_STATUT.REFUSE]: isModalRefusOpened,
  [AGREMENT_STATUT.EN_INSTRUCTION]: isModalModaleConfirmationsOpened,
  [AGREMENT_STATUT.VALIDE]: isModalModaleValidationOpened,
};

function openModal(key: ModalKey) {
  submitErrorMessage.value = null;
  modalOpenRefs[key].value = true;
}

function closeModal(key: ModalKey) {
  submitErrorMessage.value = null;
  modalOpenRefs[key].value = false;
}

const onValidForm = async (
  payload: {
    commentaire?: string;
    numeroAgrement?: string;
    file: File | null;
  },
  statut: AGREMENT_STATUT,
) => {
  if (isSubmittingAction.value) return;

  const modalKey = modalKeyByStatut[statut];
  const config = statutConfig[statut];

  if (!config) {
    toaster.error({
      titleTag: "h2",
      description: `Statut d'agrément non autorisé ${statut}`,
    });
    return;
  }

  if (!agrementStore.agrementCourant?.id) {
    return;
  }

  isSubmittingAction.value = true;
  submitErrorMessage.value = null;

  const { category, description } = config;

  try {
    const fileCompletude = await createDocument({
      document: payload.file,
      category,
    });

    const body: {
      agrementId: number;
      statut: AGREMENT_STATUT;
      file?: AgrementFilesDto;
      commentaire?: string;
      numeroAgrement?: string;
    } = {
      agrementId: agrementStore.agrementCourant.id,
      statut,
      file: fileCompletude,
    };

    if (payload.commentaire && payload.commentaire.trim().length > 0) {
      body.commentaire = payload.commentaire;
    }
    if (payload.numeroAgrement && payload.numeroAgrement.trim().length > 0) {
      body.numeroAgrement = payload.numeroAgrement;
    }

    const success = await agrementStore.changeStatutAgrement(body);

    if (!success) {
      submitErrorMessage.value =
        "Erreur: votre requête n'a pas abouti. Veuillez vérifier les champs et réessayer.";
      return;
    }

    toaster.success({ titleTag: "h2", description });

    if (modalKey) {
      closeModal(modalKey);
    }
  } catch (error) {
    log.w("onValidForm - changeStatutAgrement failed", error);
    submitErrorMessage.value =
      "Erreur: votre requête n'a pas abouti. Veuillez vérifier les champs et réessayer.";
  } finally {
    isSubmittingAction.value = false;
  }
};

async function createDocument({
  document,
  category,
}: {
  document: File | null | undefined;
  category: FILE_CATEGORY;
}) {
  if (document) {
    const uuid = await documentStore.postDocument({ document, category });
    return {
      fileUuid: uuid,
      category,
      agrementId: agrementStore.agrementCourant?.id ?? null,
    };
  }
}
</script>
