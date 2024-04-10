<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Hébergement {{ hebergementStore.hebergementCourant.nom }}</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <Hebergement
          :init-hebergement="hebergementStore.hebergementCourant"
          label-next="Modifier hébergement"
          @cancel="back"
          @submit="editHebergement"
        ></Hebergement>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-hebergement-id-param"],
});

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/hebermgents/[hebergementId]");
const hebergementStore = useHebergementStore();

const route = useRoute();

useHead({
  title: "VAO - hébergement",
  meta: [
    {
      name: "description",
      content: "Page détaillant un hébergement.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/hebergements",
    text: "Mes hébergements",
  },
  {
    text: `Hébergement ${hebergementStore.hebergementCourant.nom}`,
  },
];

const hebergementId = route.params.hebergementId;

async function editHebergement(hebergement) {
  log.d("editHebergement - IN");

  // Recopie de la branche informationsLocaux (pour pouvoir modifier la partie file à l'enregistrement)
  let updatedInformationsLocaux = { ...hebergement.informationsLocaux };

  if (hebergement.informationsLocaux.reglementationErp === true) {
    const fileDAS = hebergement.informationsLocaux.fileDerniereAttestationSecurite;
    // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
    if (!fileDAS.uuid) {
      try {
        const uuid = await UploadFile("attestation_securite", fileDAS);
        //mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
        updatedInformationsLocaux.fileDerniereAttestationSecurite = {
          uuid,
          name: fileDAS.name,
          createdAt: new Date(),
        };
      } catch (error) {
        if (error.response.status === 413) {
          return toaster.error(
            `Le fichier ${fileDAS.name} dépasse la taille maximale autorisée`,
          );
        }
        log.w("fileDerniereAttestationSecurite", error);
        return toaster.error(
          `Une erreur est survenue lors du dépôt du document ${fileDAS.name}`,
        );
      }
    }

    const fileAAM = hebergement.informationsLocaux.fileDernierArreteAutorisationMaire;
    // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
    if (!fileAAM.uuid) {
      try {
        const uuid = await UploadFile("arrete_autorisation_maire", fileAAM);
        //mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
        updatedInformationsLocaux.fileDernierArreteAutorisationMaire = {
          uuid,
          name: fileAAM.name,
          createdAt: new Date(),
        };
      } catch (error) {
        if (error.response.status === 413) {
          return toaster.error(
            `Le fichier ${fileAAM.name} dépasse la taille maximale autorisée`,
          );
        }
        log.w("fileDernierArreteAutorisationMaire", error);
        return toaster.error(
          `Une erreur est survenue lors du dépôt du document ${fileAAM.name}`,
        );
      }
    }    
  }
  else
  {
    /*
    updatedInformationsLocaux.fileReponseExploitantOuProprietaire = hebergementStore.addFile(hebergement,"reponse_explouprop")
    console.log("editHebergement(hebergement) updatedInformationsLocaux.fileReponseExploitantOuProprietaire",updatedInformationsLocaux.fileReponseExploitantOuProprietaire)
    */
    
    const fileREP = hebergement.informationsLocaux.fileReponseExploitantOuProprietaire;
    // Sauvegarde de la pièce jointe si celle-ci ne comporte pas de uuid (donc pas déjà)
    if (!fileREP.uuid) {
      try {
        const uuid = await UploadFile("reponse_explouprop", fileREP);
        //mise à jour des informations du fichier, remplacement du file par les informations uuid, name et date
        updatedInformationsLocaux.fileReponseExploitantOuProprietaire = {
          uuid,
          name: fileREP.name,
          createdAt: new Date(),
        };
      } catch (error) {
        if (error.response.status === 413) {
          return toaster.error(
            `Le fichier ${fileREP.name} dépasse la taille maximale autorisée`,
          );
        }
        log.w("fileReponseExploitantOuProprietaire", error);
        return toaster.error(
          `Une erreur est survenue lors du dépôt du document ${fileREP.name}`,
        );
      }
    }  
  }


  let majHerbergement = { ...hebergement, informationsLocaux: updatedInformationsLocaux };

  // Sauvegarde de la mise à jour de l'hébergement
  try {
    const url = `/hebergement/${hebergementId}`;
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: majHerbergement,
    });
    log.d("hebergement sauvegardé");
    toaster.success("Hébergement sauvegardé");
  } catch (error) {
    toaster.error(
      error.data.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    );
    log.w("editHebergement - erreur", { error });
  }
}

function back() {
  navigateTo("/hebergements");
}
</script>

<style scoped></style>
