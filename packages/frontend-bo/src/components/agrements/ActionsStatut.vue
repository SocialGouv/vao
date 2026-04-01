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
      size="xl"
      @close="isModalComplementOpened = false"
    >
      <AgrementsDemandeComplements
        :cdn-url="props.cdnUrl"
        @valid="onValidComplement"
        @close="isModalComplementOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrModal
      name="modalModaleConfirmations"
      :opened="isModalModaleConfirmationsOpened"
      title="Confirmation de la complétude du dossier"
      size="xl"
      @close="isModalModaleConfirmationsOpened = false"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        description="Vous devez fournir un récépissé de complétude du dossier, qui sera transmis à l'organisateur."
        :text-alert="textAlertModaleConfirmations"
        valid-button="Confirmer"
        @valid="() => onValidForm(AGREMENT_STATUT.COMPLETUDE_CONFIRME)"
        @close="isModalModaleConfirmationsOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrModal
      name="modalRefuse"
      :opened="isModalRefusOpened"
      title="Refuser l'agrément"
      size="xl"
      @close="isModalRefusOpened = false"
    >
      <AgrementsModaleConfirmations
        :cdn-url="props.cdnUrl"
        valid-button="Confirmer le refus"
        description="Pour le refus de l’agrément, veuillez fournir l’arrêté de refus qui sera transmis à l’organisateur."
        @valid="() => onValidForm(AGREMENT_STATUT.REFUSE)"
        @close="isModalRefusOpened = false"
        @update:file="fileUpdate"
      />
    </DsfrModal>
    <DsfrButtonGroup :inline-layout-when="true">
      <DsfrButton
        label="Demander des compléments à l'organisateur"
        tertiary
        type="button"
        @click="isModalComplementOpened = true"
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
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
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
];

const isModalComplementOpened = ref(false);
const isModalModaleConfirmationsOpened = ref(false);
const isModalRefusOpened = ref(false);
const textAlertModaleConfirmations = [
  "Cette étape ne constitue pas une décision d’agrément. Elle atteste uniquement que le dossier est complet.",
  "La décision d’agrément intervient à l’étape suivante, dans un délai de deux mois.",
];
const isActionsVisible = computed(() =>
  agrementStore.agrementCourant
    ? ALLOWED_STATUTS_ACTIONS.includes(
        agrementStore.agrementCourant.statut as AGREMENT_STATUT,
      )
    : false,
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
};

const onValidForm = async (statut: AGREMENT_STATUT) => {
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
      await agrementStore.changeStatutAgrement({
        agrementId: agrementStore.agrementCourant.id,
        statut,
        file: fileCompletude,
      });
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
const onValidComplement = async (payload: { commentaire: string }) => {
  isModalComplementOpened.value = false;
  if (agrementStore.agrementCourant?.id) {
    try {
      const fileAModifier = await createDocument({
        document: file?.value,
        category: FILE_CATEGORY.AMODIFER,
      });
      await agrementStore.changeStatutAgrement({
        agrementId: agrementStore.agrementCourant.id,
        statut: AGREMENT_STATUT.A_MODIFIER,
        commentaire: payload.commentaire,
        file: fileAModifier,
      });
      toaster.success({
        titleTag: "h2",
        description: `La demande de complétion de l'agrément a été envoyée`,
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
