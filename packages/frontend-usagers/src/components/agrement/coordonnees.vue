<template>
  <div id="agrement-coordonnees">
    <div id="personne-physique">
      <AgrementPersonnePhysique
        v-if="
          organismeStore.organismeCourant?.typeOrganisme === 'personne_physique'
        "
        ref="personnePhysiqueRef"
        :init-organisme="props.initOrganisme"
        :init-agrement="props.initAgrement"
        :modifiable="props.modifiable"
      />
      <div class="separator fr-my-2w"></div>
      <AgrementPersonneMorale
        v-if="
          organismeStore.organismeCourant?.typeOrganisme === 'personne_morale'
        "
        ref="personneMoraleRef"
        :init-organisme="props.initOrganisme"
        :init-agrement="props.initAgrement"
        :modifiable="props.modifiable"
      />
    </div>

    <h3 class="fr-text--lg fr-mt-4w">Procès verbal</h3>
    <FileUpload
      v-model="fileProcesVerbal"
      :cdn-url="props.cdnUrl"
      label="Dernier procès verbal d'assemblée générale"
      hint="Taille maximale à 5 Mo, les formats supportés sont jpg, png, pdf."
      :modifiable="props.modifiable"
    />
    <div
      v-if="fileProcesVerbalError"
      class="fr-input-group fr-input-group--error"
    >
      <label class="fr-label">
        {{ fileProcesVerbalError }}
      </label>
    </div>
    <div class="separator fr-my-2w"></div>

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

<script setup lang="ts">
import { ref } from "vue";
import { FileUpload, useToaster } from "@vao/shared-ui";
import { FILE_CATEGORY, AGREMENT_STATUT } from "@vao/shared-bridge";

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

const getFileByCategory = (category: string) => {
  return (
    props.initAgrement?.agrementFiles?.find(
      (file: { category: string }) => file.category === category,
    ) || null
  );
};

const personnePhysiqueRef = ref<any>(null);
const personneMoraleRef = ref<any>(null);
const commentaireRef = ref<any>(null);
const personnePhysiqueError = ref<string>("");
const personneMoraleError = ref<string>("");
const fileProcesVerbal = ref(getFileByCategory(FILE_CATEGORY.PROCVERBAL));
const fileProcesVerbalError = ref<string>("");

async function saveAgrement() {
  fileProcesVerbalError.value = "";
  let commentaire;
  if (commentaireRef.value?.getComment) {
    commentaire = await commentaireRef.value.getComment();
  }

  if (
    props.initAgrement.statut !== AGREMENT_STATUT.BROUILLON &&
    !fileProcesVerbal.value
  ) {
    console.error(
      "Validation error: Procès verbal is required for non-draft agrement",
    );
    fileProcesVerbalError.value = "Le procès verbal est requis.";
    toaster.error({
      titleTag: "h2",
      description:
        "Des erreurs sont présentes dans le formulaire. Veuillez les corriger avant de continuer.",
    });
    return false;
  }

  const agrementValues = {
    ...(fileProcesVerbal.value
      ? { fileProcesVerbal: fileProcesVerbal.value }
      : {}),
    ...(commentaire ? { commentaire } : {}),
  };

  emit("update", agrementValues);
  return true;
}

async function validatePersonne(
  ref: any,
  saveMethod: string,
  errorRef: { value: string },
  errorMsg: string,
): Promise<any> {
  if (ref.value?.[saveMethod]) {
    const data = await ref.value[saveMethod]();
    if (!data) {
      errorRef.value = errorMsg;
      return null;
    } else {
      try {
        if (saveMethod === "savePersonneMorale") {
          await organismeStore.updatePersonneMorale({
            ...organismeStore.organismeCourant?.personneMorale,
            ...data,
          });
        } else if (saveMethod === "savePersonnePhysique") {
          await organismeStore.updatePersonnePhysique({
            ...organismeStore.organismeCourant?.personnePhysique,
            ...data,
          });
        }
        return data;
      } catch (err: any) {
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

  if (props.modifiable) {
    const agrementSaved = await saveAgrement();
    if (!agrementSaved) {
      console.error(
        "Échec de la sauvegarde de l'agrément depuis la page de coordonnées",
      );
      console.error(
        "Coordonnees invalides: échec de la sauvegarde de l'agrément",
      );
      isValid = false;
      return;
    }
  }
  // props.modifiable ? saveAgrement() : emit("update:valid", isValid);

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

function coordonneesIsValid() {
  if (!fileProcesVerbal.value) {
    fileProcesVerbalError.value = "Le procès verbal est requis.";
    return false;
  }
  return true;
}

onMounted(async () => {
  if (!props.modifiable) {
    saveCoordonneesStep();
  }
});

function onNext() {
  saveCoordonneesStep();
}

defineExpose({ saveCoordonneesStep, coordonneesIsValid });
</script>
