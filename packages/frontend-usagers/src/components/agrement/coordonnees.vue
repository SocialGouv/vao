<template>
  <div id="agrement-coordonnees">
    <div id="personne-physique">
      <AgrementPersonnePhysique
        v-if="
          organismeStore.organismeCourant.typeOrganisme === 'personne_physique'
        "
        ref="personnePhysiqueRef"
        :init-organisme="props.initOrganisme"
        :init-agrement="props.initAgrement"
        :modifiable="props.modifiable"
      />
      <hr class="fr-my-2w" />
      <AgrementPersonneMorale
        v-if="
          organismeStore.organismeCourant.typeOrganisme === 'personne_morale'
        "
        ref="personneMoraleRef"
        :init-organisme="props.initOrganisme"
        :init-agrement="props.initAgrement"
        :modifiable="props.modifiable"
      />
    </div>

    <h4 class="fr-text--lg fr-mt-4w">Procès verbal</h4>
    <FileUpload
      v-model="fileProcesVerbal"
      :cdn-url="props.cdnUrl"
      label="Dernier procès verbal d'assemblée générale"
      :modifiable="props.modifiable"
    />
    <hr class="fr-mt-4w" />

    <AgrementCommentaire
      ref="commentaireRef"
      :init-commentaire="props.initAgrement.commentaire"
      :modifiable="props.modifiable"
      class="fr-my-2w"
    />

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

    <DsfrButton v-if="props.modifiable" class="fr-mb-6v" @click.prevent="onNext"
      >Suivant</DsfrButton
    >
  </div>
</template>

<script setup>
import { ref } from "vue";
import { FileUpload, useToaster } from "@vao/shared-ui";

const props = defineProps({
  valid: { type: Boolean, default: true },
  initAgrement: { type: Object, required: true },
  initOrganisme: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
  cdnUrl: { type: String, required: true },
});
const emit = defineEmits(["next", "update", "update:valid"]);

const toaster = useToaster();
const organismeStore = useOrganismeStore();

const getFileByCategory = (category) => {
  return (
    props.initAgrement?.agrementFiles?.find(
      (file) => file.category === category,
    ) || null
  );
};

const personnePhysiqueRef = ref();
const personneMoraleRef = ref();
const commentaireRef = ref("");
const personnePhysiqueError = ref("");
const personneMoraleError = ref("");
const fileProcesVerbal = ref(getFileByCategory("PROCVERBAL"));

async function saveAgrement() {
  let commentaire;
  if (commentaireRef.value?.getComment) {
    commentaire = await commentaireRef.value.getComment();
  }

  const agrementValues = {
    ...(fileProcesVerbal.value
      ? { fileProcesVerbal: fileProcesVerbal.value }
      : {}),
    ...(commentaire ? { commentaire } : {}),
  };

  emit("update", agrementValues);
}

async function validatePersonne(ref, saveMethod, errorRef, errorMsg) {
  if (ref.value?.[saveMethod]) {
    const data = await ref.value[saveMethod]();
    if (!data) {
      errorRef.value = errorMsg;
      return null;
    } else {
      try {
        if (saveMethod === "savePersonneMorale") {
          await organismeStore.updatePersonneMorale({
            ...organismeStore.organismeCourant.personneMorale,
            ...data,
          });
        } else if (saveMethod === "savePersonnePhysique") {
          await organismeStore.updatePersonnePhysique({
            ...organismeStore.organismeCourant.personnePhysique,
            ...data,
          });
        }
        return data;
      } catch (err) {
        console.error("Erreur lors de la sauvegarde :", err);
        errorRef.value =
          "Erreur lors de la sauvegarde : " +
          (err?.message || "Erreur inconnue.");
        return null;
      }
    }
  }
  return null;
}

async function saveCoordonneesStep() {
  personnePhysiqueError.value = "";
  personneMoraleError.value = "";
  let isValid = true;
  const personnePhysiqueData = await validatePersonne(
    personnePhysiqueRef,
    "savePersonnePhysique",
    personnePhysiqueError,
    "Veuillez corriger les erreurs dans le formulaire de la personne physique.",
  );
  if (personnePhysiqueRef.value && !personnePhysiqueData) {
    isValid = false;
    return;
  }

  const personneMoraleData = await validatePersonne(
    personneMoraleRef,
    "savePersonneMorale",
    personneMoraleError,
    "Veuillez corriger les erreurs dans le formulaire de la personne morale.",
  );
  if (personneMoraleRef.value && !personneMoraleData) {
    isValid = false;
    return;
  }
  props.modifiable ? saveAgrement() : emit("update:valid", isValid);

  if (!isValid) {
    return toaster.error({
      titleTag: "h2",
      description:
        "Des erreurs sont présentes dans le formulaire. Veuillez les corriger avant de continuer.",
    });
  }
  if (props.modifiable) {
    emit("next");
  }
}

onMounted(async () => {
  if (!props.modifiable) {
    saveCoordonneesStep();
  }
});

function onNext() {
  saveCoordonneesStep();
}

defineExpose({ saveCoordonneesStep });
</script>
