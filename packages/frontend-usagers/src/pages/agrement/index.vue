<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-pb-3w fr-col-12">
        <DsfrBreadcrumb :links="links" />
        <h1>Renouvellement d’agrément</h1>
        <p class="fr-mb-2w">
          Sauf mention contraire, tous les champs sont obligatoires.
          <br />Documents importés : taille maximale à 5 Mo, les formats
          supportés sont jpg, png, pdf.
        </p>

        <p>
          <span
            class="fr-icon-success-fill default-success fr-mr-1w"
            aria-hidden="true"
          ></span>
          <b>
            <span class="default-success"
              >Saisies enregistrées à chaque étape :</span
            >
            au clic sur “Suivant”, vos informations sont enregistrées, vous
            pourrez reprendre plus tard, en retrouvant le lien depuis
            l’accueil.</b
          >
        </p>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-xs-12 fr-col-md-3">
        <!-- todo -->
        <AgrementMenuAgrement />
        <!-- <AgrementMenuAgrement :active-id="activeId" :agrement="agrement" /> -->
      </div>

      <div class="fr-col-xs-12 fr-col-md-9">
        <AgrementStepper />

        <div id="personne-physique">
          <AgrementPersonnePhysique ref="personnePhysiqueRef" />
          <hr class="fr-my-2w" />
          <AgrementPersonneMorale ref="personneMoraleRef" />
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

        <DsfrButton
          label="Suivant"
          class="next-btn fr-mb-6v"
          primary
          type="button"
          @click="onSuivantClick"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
const personnePhysiqueRef = ref();
const personneMoraleRef = ref();
const commentaireRef = ref();
const personnePhysiqueError = ref("");
const personneMoraleError = ref("");

const toaster = useToaster();

const agrementStore = useAgrementStore();

async function onSuivantClick() {
  personnePhysiqueError.value = "";
  personneMoraleError.value = "";
  let valid = true;

  if (personnePhysiqueRef.value?.validateAndSave) {
    const result = await personnePhysiqueRef.value.validateAndSave();
    if (!result) {
      personnePhysiqueError.value =
        "Veuillez corriger les erreurs dans le formulaire de la personne physique.";
      valid = false;
    }
  }
  if (personneMoraleRef.value?.validateAndSave) {
    const result = await personneMoraleRef.value.validateAndSave();
    if (!result) {
      personneMoraleError.value =
        "Veuillez corriger les erreurs dans le formulaire de la personne morale.";
      valid = false;
    }
  }

  if (commentaireRef.value?.getComment) {
    const commentaire = commentaireRef.value.getComment();
    console.log("Commentaire récupéré :", commentaire);
    agrementStore.commentaire = commentaire || "";
  }

  if (!valid) {
    return toaster.error({
      titleTag: "h2",
      description: `Des erreurs sont présentes dans le formulaire. Veuillez les corriger avant de continuer.`,
    });
  } else {
    // todo: page suivante
  }
}
definePageMeta({
  middleware: ["is-connected"], //check-organisme-is-complet ou pas la peine ?
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Renouvellement d'agrément",
  },
];

useHead({
  title:
    "Renouvellement d'agrément - Coordonnées à vérifier | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Parcours de renouvellement d'agrément.",
    },
  ],
});
</script>
<style scoped>
.default-success {
  color: var(--text-default-success);
}
.next-btn {
  float: right;
}
</style>
