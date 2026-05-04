<template>
  <div v-if="isActionsVisible">
    <DsfrAlert
      class="fr-grid-row fr-alert--sm fr-my-3v"
      :role="'alert'"
      description="Vous devez confirmer la complétude du dossier et fournir un récépissé. Vous pourrez ensuite valider l’agrément et fournir l’arrêté."
      type="info"
      :closeable="false"
    />
    <DsfrModal
      name="modalComplement"
      :opened="isModalComplementOpened"
      title="Demande de compléments"
      size="lg"
      @close="isModalComplementOpened = false"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description=""
        :have-commentaire="true"
        :have-required-file="false"
        valid-button="Confirmer"
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.A_MODIFIER)"
        @close="isModalComplementOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrModal
      name="modalCorrection"
      :opened="isModalCorrectionOpened"
      title="Demande de correction"
      size="lg"
      @close="isModalCorrectionOpened = false"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description=""
        :text-alert="textAlertModaleCorrection"
        :type-alert="'warning'"
        :have-commentaire="true"
        :have-required-file="false"
        valid-button="Envoyer la demande"
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.A_CORRIGER)"
        @close="isModalCorrectionOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrModal
      name="modalModaleConfirmations"
      :opened="isModalModaleConfirmationsOpened"
      title="Confirmation de la complétude du dossier"
      size="lg"
      @close="isModalModaleConfirmationsOpened = false"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description="Vous devez fournir un récépissé de complétude du dossier, qui sera transmis à l'organisateur."
        :text-alert="textAlertModaleConfirmations"
        :type-alert="'info'"
        :have-commentaire="false"
        :have-required-file="true"
        valid-button="Confirmer"
        @valid="
          (payload) => onValidForm(payload, AGREMENT_STATUT.COMPLETUDE_CONFIRME)
        "
        @close="isModalModaleConfirmationsOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrModal
      name="modalRefuse"
      :opened="isModalRefusOpened"
      title="Refuser l'agrément"
      size="lg"
      @close="isModalRefusOpened = false"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        :have-commentaire="false"
        :have-required-file="true"
        valid-button="Confirmer le refus"
        description="Pour le refus de l’agrément, veuillez fournir l’arrêté de refus qui sera transmis à l’organisateur."
        @valid="(payload) => onValidForm(payload, AGREMENT_STATUT.REFUSE)"
        @close="isModalRefusOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrButtonGroup :inline-layout-when="true">
      <DsfrButton
        v-if="!isActionsCompletude"
        label="Demander des compléments à l'organisateur"
        tertiary
        type="button"
        @click="isModalComplementOpened = true"
      />
      <DsfrButton
        v-if="isActionsCompletude"
        label="Demander des corrections à l'organisateur"
        tertiary
        type="button"
        @click="isModalCorrectionOpened = true"
      />

      <DsfrButton
        label="Refuser l'agrément"
        secondary
        type="button"
        @click="isModalRefusOpened = true"
      />
      <DsfrButton
        label="Confirmer la complétude du dossier"
        primary
        type="button"
        @click="isModalModaleConfirmationsOpened = true"
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

const agrementStore = useAgrementStore();
const documentStore = useDocumentStore();
const file = ref<File | undefined>(undefined);
const fileUpdate = (f: File | undefined) => (file.value = f);

const toaster = useToaster();
const props = defineProps<{
  cdnUrl: string;
}>();

const ALLOWED_STATUTS_ACTIONS = [
  AGREMENT_STATUT.PRIS_EN_CHARGE,
  AGREMENT_STATUT.EN_COURS,
  AGREMENT_STATUT.COMPLETUDE_CONFIRME,
];

const isModalComplementOpened = ref(false);
const isModalCorrectionOpened = ref(false);
const isModalModaleConfirmationsOpened = ref(false);
const isModalRefusOpened = ref(false);
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

const isActionsCompletude = computed(
  () =>
    agrementStore?.agrementCourant?.statut ===
    AGREMENT_STATUT.COMPLETUDE_CONFIRME,
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
  [AGREMENT_STATUT.COMPLETUDE_CONFIRME]: {
    category: FILE_CATEGORY.COMPLETUDE,
    description: "La confirmation de complétude de l'agrément a été envoyée",
  },
  [AGREMENT_STATUT.REFUSE]: {
    category: FILE_CATEGORY.REFUS,
    description: "Le refus d'agrément a été envoyé",
  },
  [AGREMENT_STATUT.A_CORRIGER]: {
    category: FILE_CATEGORY.ACORRIGER,
    description: `La demande de correction a été envoyée`,
  },
  [AGREMENT_STATUT.A_MODIFIER]: {
    category: FILE_CATEGORY.AMODIFER,
    description: `La demande de complétion de l'agrément a été envoyée`,
  },
};

const onValidForm = async (
  payload: { commentaire: string },
  statut: AGREMENT_STATUT,
) => {
  isModalModaleConfirmationsOpened.value = false;

  const config = statutConfig[statut];

  if (!config) {
    toaster.error({
      titleTag: "h2",
      description: `Statut d'agrément non autorisé ${statut}`,
    });
    return;
  }

  const { category, description } = config;

  if (agrementStore.agrementCourant?.id) {
    try {
      const fileCompletude = await createDocument({
        document: file?.value,
        category,
      });

      const body: {
        agrementId: number;
        statut: AGREMENT_STATUT;
        file?: AgrementFilesDto;
        commentaire?: string;
      } = {
        agrementId: agrementStore.agrementCourant.id,
        statut,
        file: fileCompletude,
      };

      if (payload.commentaire && payload.commentaire.trim().length > 0) {
        body.commentaire = payload.commentaire;
      }

      await agrementStore.changeStatutAgrement(body);
      toaster.success({
        titleTag: "h2",
        description,
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  }
};

async function createDocument({
  document,
  category,
}: {
  document: File | undefined;
  category: FILE_CATEGORY;
}) {
  if (document) {
    try {
      const uuid = await documentStore.postDocument({ document, category });
      toaster.info({
        titleTag: "h2",
        description: `Fichier ${document.name} déposé`,
      });
      return {
        fileUuid: uuid,
        category,
        agrementId: agrementStore.agrementCourant?.id ?? null,
      };
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  }
}
</script>
