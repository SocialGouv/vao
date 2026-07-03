<template>
  <div id="agrement-synthese">
    <DsfrAccordionsGroup v-model="expandedIndex">
      <DsfrAccordion>
        <template #title>
          Coordonnées à vérifier
          <DsfrBadge
            :label="coordonneesValid ? 'Complet' : 'Incomplet'"
            :type="coordonneesValid ? 'success' : 'warning'"
            small
          />
        </template>
        <AgrementCoordonnees
          ref="coordonneesRef"
          :init-organisme="props.initOrganisme ?? {}"
          :init-agrement="props.initAgrement ?? {}"
          :modifiable="false"
          :cdn-url="cdnUrl"
          :valid="coordonneesValid"
        />
        <DsfrButton
          class="fr-mb-6v fr-mt-6v"
          @click.prevent="onModifierCoordonnees"
          >Modifier</DsfrButton
        >
      </DsfrAccordion>
      <DsfrAccordion>
        <template #title>
          Dossier candidature
          <DsfrBadge
            :label="dossierValid ? 'Complet' : 'Incomplet'"
            :type="dossierValid ? 'success' : 'warning'"
            small
          />
        </template>
        <AgrementDossier
          ref="dossierRef"
          class="fr-my-2w"
          :init-agrement="props.initAgrement ?? {}"
          :modifiable="false"
          :cdn-url="cdnUrl"
          :valid="dossierValid"
        />
        <DsfrButton class="fr-mb-6v fr-mt-6v" @click.prevent="onModifierDossier"
          >Modifier</DsfrButton
        >
      </DsfrAccordion>
      <DsfrAccordion v-if="!props.firstAgrement">
        <template #title>
          Bilan des 4 années précédentes
          <DsfrBadge
            :label="bilanValid ? 'Complet' : 'Incomplet'"
            :type="bilanValid ? 'success' : 'warning'"
            small
          />
        </template>
        <AgrementBilan
          v-model:valid="bilanValid"
          :init-agrement="props.initAgrement ?? {}"
          :modifiable="false"
          :cdn-url="cdnUrl"
        />
        <DsfrButton class="fr-mb-6v fr-mt-6v" @click.prevent="onModifierBilan"
          >Modifier</DsfrButton
        >
      </DsfrAccordion>
      <DsfrAccordion>
        <template #title>
          Projet de séjours envisagés
          <DsfrBadge
            :label="projetValid ? 'Complet' : 'Incomplet'"
            :type="projetValid ? 'success' : 'warning'"
            small
          />
        </template>
        <AgrementProjets
          v-model:valid="projetValid"
          :init-agrement="props.initAgrement ?? {}"
          :modifiable="false"
          :cdn-url="cdnUrl"
        />
        <DsfrButton class="fr-mb-6v fr-mt-6v" @click.prevent="onModifierProjet"
          >Modifier</DsfrButton
        >
      </DsfrAccordion>
      <DsfrAlert role="info">
        <h2>Vérification</h2>
        <ul role="list">
          <li role="listitem">
            Vérifiez que toutes les informations soient exactes.
          </li>
          <li role="listitem">
            Assurez-vous que tous les documents soient lisibles.
          </li>
          <li role="listitem">
            Toutes les étapes du formulaire doivent être marquées comme «
            Complet » pour pouvoir être envoyées
          </li>
        </ul>
      </DsfrAlert>
    </DsfrAccordionsGroup>
    <DsfrButton
      class="fr-mb-6v fr-mt-6v"
      :disabled="
        !(coordonneesValid && projetValid && dossierValid && bilanValid)
      "
      @click.prevent="transmitAgrement"
      >Confirmer ma demande d'agrément</DsfrButton
    >
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  firstAgrement: { type: Boolean, default: false },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});

const emit = defineEmits(["update"]);

const expandedIndex = ref<number>(-1);
const coordonneesValid = ref<boolean>(false);
const dossierValid = ref<boolean>(false);
const bilanValid = ref<boolean>(false);
const projetValid = ref<boolean>(false);
const coordonneesRef = ref();
const dossierRef = ref();

onMounted(async () => {
  if (coordonneesRef.value?.coordonneesIsValid) {
    coordonneesValid.value = await coordonneesRef.value.coordonneesIsValid();
  }
  if (dossierRef.value?.validateDossier) {
    const result = await dossierRef.value.validateDossier();
    dossierValid.value = result.valid;
  }
});

watch(
  () => props.initAgrement,
  async () => {
    if (coordonneesRef.value?.coordonneesIsValid) {
      coordonneesValid.value = await coordonneesRef.value.coordonneesIsValid();
    }
    if (dossierRef.value?.validateDossier) {
      const result = await dossierRef.value.validateDossier();
      dossierValid.value = result.valid;
    }
  },
  { deep: true },
);

watch(
  coordonneesRef,
  async (newRef) => {
    if (newRef?.coordonneesIsValid) {
      coordonneesValid.value = await newRef.coordonneesIsValid();
    }
  },
  { immediate: true },
);

watch(
  dossierRef,
  async (newRef) => {
    if (newRef?.validateDossier) {
      const result = await newRef.validateDossier();
      dossierValid.value = result.valid;
    }
  },
  { immediate: true },
);

const agrementStore = useAgrementStore();
const { agrementCourant } = storeToRefs(agrementStore);

const toaster = useToaster();

const log = logger("components/agrement/synthese.vue");

async function onNext() {
  if (!agrementCourant.value?.id) {
    toaster.error({
      description: "Aucun agrément trouvé. Veuillez réessayer.",
      role: "alert",
    });

    return;
  }
  try {
    const stepDemandeTransmise =
      props.initAgrement.statut === AGREMENT_STATUT.BROUILLON ? 0 : 1;
    const success = await agrementStore.changeStatutAgrement({
      agrementId: props.initAgrement?.id,
      statut: AGREMENT_STATUT.TRANSMIS,
    });
    if (success) {
      navigateTo(`/demande-agrement-transmise?step=${stepDemandeTransmise}`);
    } else {
      toaster.error({
        description:
          "Erreur lors de la transmission de votre demande. Veuillez réessayer.",
        role: "alert",
      });
    }
  } catch (err) {
    log.w("Erreur lors de la transmission de la demande d'agrément", err);
    toaster.error({
      description:
        "Erreur lors de la transmission de votre demande. Veuillez réessayer.",
      role: "alert",
    });
  }
}

async function transmitAgrement() {
  emit("update");
}

function onModifierCoordonnees() {
  navigateTo("/agrement#agrement-coordonnees");
}
function onModifierDossier() {
  navigateTo("/agrement#agrement-dossier");
}
function onModifierBilan() {
  navigateTo("/agrement#agrement-bilan");
}
function onModifierProjet() {
  navigateTo("/agrement#agrement-projets");
}
</script>
