<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <h1>Déclaration de séjour</h1>
    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="declaration-sejour-content-0"
        tab-id="declaration-sejour-tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <div class="fr-container">
          <div class="fr-grid-row fr-px-3w">
            <div class="fr-col-3">
              <DSMenuDemandeSejour
                :active-id="hash"
                :demande="demandeCourante"
              ></DSMenuDemandeSejour>
            </div>

            <div class="fr-col-9 fr-py-3w">
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
                    :declaration-statut="demandeCourante.statut"
                    @update="updateOrCreate"
                    @next="nextHash"
                    @previous="previousHash"
                  />
                </div>
                <div id="projet-sejour">
                  <DSProjetSejour
                    v-if="hash === 'projet-sejour'"
                    :init-data="demandeCourante.projetSejour ?? {}"
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
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="declaration-sejour-content-1"
        tab-id="declaration-sejour-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <DSDocuments :declaration="demandeCourante ?? {}"></DSDocuments>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="declaration-sejour-content-2"
        tab-id="declaration-sejour-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <DSHistorique
          v-if="historique"
          :historique="historique.historique ?? []"
        ></DSHistorique>
        <DsfrAlert v-else-if="error" type="error"
          >Une erreur est survenue durant la récupération de l'historique de la
          déclaration
        </DsfrAlert>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
const route = useRoute();

const toaster = useToaster();

definePageMeta({
  middleware: [
    "is-connected",
    "check-organisme-is-complet",
    "check-demande-sejour-id-param",
  ],
});
useHead({
  title: "Déclaration de séjour détaillée | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description d'une déclaration de séjour.",
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

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const {
  data: historique,
  error,
  execute,
} = useFetchBackend(`/sejour/historique/${route.params.demandeId}`, {
  immediate: false,
  method: "GET",
  credentials: "include",
});

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
  if (idx === 2 && !historique.value) {
    execute();
  }
};

const sejourId = ref(route.params.demandeId);

const tabTitles = computed(() => [
  { title: "Formulaire" },
  { title: "Documents joints" },
  ...(sejourId.value ? [{ title: "Historique de la déclaration" }] : []),
]);

const sommaireOptions = demandeSejourMenus
  .filter(
    (menu) =>
      !menu.statutsMasques ||
      !menu.statutsMasques.includes(demandeCourante.value.statut),
  )
  .map((m) => m.id);

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return sommaireOptions[0];
});

const canModify = computed(() => {
  return (
    !demandeCourante.value.statut ||
    demandeCourante.value.statut === DeclarationSejour.statuts.BROUILLON ||
    demandeCourante.value.statut === DeclarationSejour.statuts.A_MODIFIER ||
    demandeCourante.value.statut === DeclarationSejour.statuts.ATTENTE_8_JOUR
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
    const url = `/sejour/${sejourId.value}/depose`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        attestation,
      },
    });

    toaster.success(
      `Félicitations, votre déclaration de séjour n°${sejourId.value} a été transmise`,
    );

    if (response.DSuuid) {
      toaster.info(
        `Le PDF déclaration_2_mois a été ajouté aux documents de la déclaration de séjour`,
      );
    } else {
      toaster.error(
        "Une erreur est survenue durant la génération du PDF mais la déclaration a bien été transmise",
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
