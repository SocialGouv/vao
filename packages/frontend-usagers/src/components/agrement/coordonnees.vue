<template>
  <div id="agrement-coordonnees">
    <div id="personne-physique">
      <AgrementPersonnePhysique
        v-if="
          organismeStore.organismeCourant.typeOrganisme === 'personne_physique'
        "
        ref="personnePhysiqueRef"
      />
      <hr class="fr-my-2w" />
      <AgrementPersonneMorale
        v-if="
          organismeStore.organismeCourant.typeOrganisme === 'personne_morale'
        "
        ref="personneMoraleRef"
      />
    </div>

    <hr class="fr-mt-4w" />

    <AgrementCommentaire ref="commentaireRef" class="fr-my-2w" />

    <DsfrAlert
      v-if="personnePhysiqueError"
      role="alert"
      class="fr-grid-row fr-my-4v"
      type="error"
      :closeable="false"
    >
      {{ personnePhysiqueError }}
    </DsfrAlert>

    <DsfrAlert
      v-if="personneMoraleError"
      role="alert"
      class="fr-grid-row fr-my-4v"
      type="error"
      :closeable="false"
    >
      {{ personneMoraleError }}
    </DsfrAlert>

    <div v-if="props.showButtons">
      <UtilsNavigationButtons
        :show-buttons="props.showButtons"
        @next="onNext"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  showButtons: { type: Boolean, default: true },
});
const emit = defineEmits(["next"]);

const toaster = useToaster();
const agrementStore = useAgrementStore();
const organismeStore = useOrganismeStore();

const personnePhysiqueRef = ref();
const personneMoraleRef = ref();
const commentaireRef = ref();
const personnePhysiqueError = ref("");
const personneMoraleError = ref("");

// Validation et sauvegarde de l’étape
async function saveAgrement() {
  personnePhysiqueError.value = "";
  personneMoraleError.value = "";
  let valid = true;

  if (personnePhysiqueRef.value?.validateAndSave) {
    const ok = await personnePhysiqueRef.value.validateAndSave();
    if (!ok) {
      personnePhysiqueError.value =
        "Veuillez corriger les erreurs dans le formulaire de la personne physique.";
      valid = false;
    }
  }

  if (personneMoraleRef.value?.validateAndSave) {
    const ok = await personneMoraleRef.value.validateAndSave();
    if (!ok) {
      personneMoraleError.value =
        "Veuillez corriger les erreurs dans le formulaire de la personne morale.";
      valid = false;
    }
  }

  if (commentaireRef.value?.getComment()) {
    const commentaire = commentaireRef.value.getComment();
    await agrementStore.postAgrement({
      agrement: { commentaire: commentaire || "" },
      organismeId: organismeStore.organismeCourant?.organismeId,
    });
  }

  if (!valid) {
    return toaster.error({
      titleTag: "h2",
      description:
        "Des erreurs sont présentes dans le formulaire. Veuillez les corriger avant de continuer.",
    });
  }

  toaster.success({
    titleTag: "h2",
    description: "Les informations ont été enregistrées avec succès.",
  });
  emit("next");
}

function onNext() {
  saveAgrement();
}

defineExpose({ saveAgrement });
</script>
