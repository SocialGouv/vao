<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-px-3w">
      <div class="fr-col-3">
        <DSMenuDemandeSejour
          :active-id="hash"
          :demande="demandeCourante"
        ></DSMenuDemandeSejour>
      </div>

      <div class="fr-col-9 fr-py-3w">
        <div class="fr-grid-row">
          <div class="fr-col">
            <DsfrBreadcrumb :links="links" />
          </div>
        </div>

        <DSStepper :step="hash"></DSStepper>
        <div>
          <div id="info-generales">
            <DSInformationsGenerales
              v-if="hash === 'info-generales'"
              :init-data="demandeCourante ?? {}"
              :modifiable="canModify"
              @update="updateOrCreate"
              @next="nextHash"
            />
          </div>
          <div id="info-vacanciers">
            <DSInformationsVacanciers
              v-if="hash === 'info-vacanciers'"
              :init-data="demandeCourante.informationsVacanciers ?? {}"
              :modifiable="canModify"
              @update="updateOrCreate"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div id="info-transport">
            <protocole-transport
              v-if="hash === 'info-transport'"
              :init-data="demandeCourante.informationsTransport ?? {}"
              :modifiable="canModify"
              @update="updateOrCreate"
              @next="nextHash"
              @previous="previousHash"
            ></protocole-transport>
          </div>
          <div id="info-sanitaires">
            <protocole-sanitaire
              v-if="hash === 'info-sanitaires'"
              :init-data="demandeCourante.informationsSanitaires ?? {}"
              :modifiable="canModify"
              @update="updateOrCreate"
              @next="nextHash"
              @previous="previousHash"
            ></protocole-sanitaire>
          </div>
          <div id="info-personnel">
            <DSInformationsPersonnel
              v-if="hash === 'info-personnel'"
              :modifiable="canModify"
              :init-data="demandeCourante.informationsPersonnel ?? {}"
              @update="updateOrCreate"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div id="projet-sejour">
            <DSProjetSejour
              v-if="hash === 'projet-sejour'"
              :init-data="demandeCourante.informationsProjetSejour ?? {}"
              :modifiable="canModify"
              @update="updateOrCreate"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div id="hebergements">
            <DSHebergementsSejour
              v-if="hash === 'hebergements'"
              :date-debut="demandeCourante.dateDebut"
              :date-fin="demandeCourante.dateFin"
              :hebergement="demandeCourante.hebergement ?? {}"
              :modifiable="canModify"
              @update="updateOrCreate"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div id="synthese">
            <DSSynthese
              v-if="hash === 'synthese'"
              :declaration-courante="demandeCourante ?? {}"
              :modifiable="canModify"
              @finalize="finalize"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected", "check-demande-sejour-id-param"],
});
useHead({
  title: "VAO - déclaration de séjour",
  meta: [
    {
      name: "description",
      content: "Page déclaration de séjour.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/demande-sejour/liste",
    text: "Liste des déclarations de séjour",
  },
  {
    text: "Ma déclaration de séjour",
  },
];

const log = logger("pages/demande-sejour/[[demandeId]]");

const demandeSejourStore = useDemandeSejourStore();
const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const sommaireOptions = demandeSejourMenus.map((m) => m.id);

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return sommaireOptions[0];
});

const sejourId = ref(route.params.demandeId);

const canModify = computed(() => {
  return (
    !demandeCourante.value.statut ||
    demandeCourante.value.statut === "BROUILLON" ||
    demandeCourante.value.statut === "TRANSMISE"
  );
});

async function updateOrCreate(data, type) {
  log.i("updateOrCreate - IN", { data, type });
  let counter = 0;

  if (data.file) {
    log.d("updateOrCreate - look at data.file");
    const file = unref(data.file);
    if (!file.uuid) {
      try {
        const uuid = await UploadFile(type, file);
        data.file = {
          uuid,
          name: file.name,
          createdAt: new Date(),
        };
        toaster.info(`Document déposé`);
      } catch (error) {
        if (error.response.status === 413) {
          return toaster.error(
            `Le fichier ${file.name} dépasse la taille maximale autorisée`,
          );
        }
        return toaster.error(
          `Une erreur est survenue lors du dépôt du document ${file.name}`,
        );
      }
    }
  }

  if (data.files && data.files.length) {
    log.d("updateOrCreate - look at data.files");
    const files = [];
    for (let i = 0; i < data.files.length; i++) {
      const file = unref(data.files[i]);
      if (!file.name) {
        continue;
      }
      log.d(file.name);
      if (file.uuid) {
        files.push(file);
        continue;
      }
      try {
        const uuid = await UploadFile(type, file);
        files.push({
          uuid,
          name: file.name,
          createdAt: new Date(),
        });
        counter++;
      } catch (error) {
        if (error.response.status === 413) {
          return toaster.error(
            `Le fichier ${file.name} dépasse la taille maximale autorisée`,
          );
        }
        return toaster.error(
          `Une erreur est survenue lors du dépôt du document ${file.name}`,
        );
      }
    }
    toaster.info(
      `${counter} document${counter > 1 ? "s" : ""} déposé${counter > 1 ? "s" : ""}`,
    );
    data.files = files;
  }

  try {
    const url = sejourId.value ? `/sejour/${sejourId.value}` : "/sejour";
    log.d(url);
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...data },
        type: type,
      },
    });

    toaster.success(
      `Demande de séjour ${sejourId.value ? "sauvegardée" : "créée"}`,
    );
    log.d(`demande de séjour ${sejourId.value} mis à jour`);
    sejourId.value = response.id;
    return nextHash();
  } catch (error) {
    log.w("Creation/modification de declaration de sejour: ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la mise à jour de la déclaration de séjour`,
    );
  }
}

async function finalize(attestation) {
  log.i("finalize -IN");
  try {
    const url = `/sejour/depose/${sejourId.value}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        attestation,
      },
    });

    if (response.demandeId) {
      toaster.success(
        `Félicitations, votre déclaration de séjour n°${sejourId.value} a été transmise`,
      );
    }
    if (response.DSuuid) {
      toaster.info(
        `Le PDF déclaration_2_mois a été ajouté aux documents de la déclaration de séjour`,
      );
    } else {
      toaster.error(
        "Une erreur est survenue durant la génération du PDF mais la déclaration a bien été transmise",
      );
    }
    if (response.ARuuid) {
      toaster.info(
        `Le récépissé de la déclaration_2_mois a été ajouté aux documents de la déclaration de séjour`,
      );
    } else {
      toaster.error(
        "Une erreur est survenue durant la génération du récépissé mais la déclaration a bien été transmise",
      );
    }
    log.d(`demande de séjour ${sejourId.value} transmise`);
    return navigateTo("/demande-sejour/liste");
  } catch (error) {
    log.w("Finalisation de la declaration de sejour : ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la transmission de la déclaration de séjour`,
    );
  }
}

function previousHash() {
  const index = sommaireOptions.findIndex((o) => o === hash.value);
  return navigateTo({ hash: "#" + sommaireOptions[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.findIndex((o) => o === hash.value);
  return navigateTo({
    path: `/demande-sejour/${sejourId.value}`,
    hash: "#" + sommaireOptions[index + 1],
  });
}
</script>

<style lang="scss" scoped></style>
