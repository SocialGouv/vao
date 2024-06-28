<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <h1>
      Déclaration
      {{
        demandeCourante.statut && demandeCourante.statut !== DeclarationSejour.statuts.BROUILLON
          ? `:  ${demandeCourante.libelle}`
          : " de séjour"
      }}
    </h1>
    <div
      v-if="
        demandeCourante.statut &&
        demandeCourante.statut !== DeclarationSejour.statuts.BROUILLON
      "
      class="fr-grid-row fr-mb-5w fr-px-2w"
    >
      <div class="fr-col-7">
        <div v-for="detail in demandeDetails" :key="detail.label">
          <strong>{{ detail.label }} : </strong>{{ detail.value }}
        </div>
      </div>
      <div class="fr-col-5 badge">
        <DsfrBadge
          :small="false"
          :type="
            DeclarationSejour.statusTagStates[demandeCourante.statut] ?? 'union'
          "
          :label="demandeCourante.statut"
        />
      </div>
    </div>
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
                    @update="updateOrCreate"
                    @next="nextHash"
                  />
                </div>
                <div id="info-vacanciers">
                  <DSInformationsVacanciers
                    v-if="hash === 'info-vacanciers'"
                    :init-data="demandeCourante.informationsVacanciers ?? {}"
                    :modifiable="canModify"
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
                    :is-downloading="apiStatus.isDownloading"
                    :message="apiStatus.message"
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
import dayjs from "dayjs";

const route = useRoute();

const toaster = useToaster();

const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();

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
    demandeCourante.value.statut === DeclarationSejour.statuts.ATTENTE_8_JOUR ||
    demandeCourante.value.statut === DeclarationSejour.statuts.A_MODIFIER_8J
  );
});

const demandeDetails = computed(() => {
  return [
    {
      label: "Organisme",
      value: DeclarationSejour.getOrganismeName(demandeCourante.value),
    },
    {
      label: "Date (début / fin)",
      value: `${dayjs(demandeCourante.dateDebut).format("DD/MM/YYYY")} - ${dayjs(demandeCourante.dateFin).format("DD/MM/YYYY")}`,
    },
    {
      label: "Saison",
      value: DeclarationSejour.getSaison(demandeCourante.value.dateDebut),
    },
    {
      label: "Déclaration",
      value: demandeCourante.value.statut,
    },
  ];
});

async function updateOrCreate(data, type) {
  log.i("updateOrCreate - IN", { data, type });
  setApiStatut(
    `${sejourId.value ? "Sauvegarde" : "Création"} de la demande de séjour en cours`,
  );
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
    return await nextHash();
  } catch (error) {
    log.w("Creation/modification de declaration de sejour: ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la mise à jour de la déclaration de séjour`,
    );
  } finally {
    resetApiStatut();
  }
}

async function finalize(attestation) {
  log.i("finalize -IN");
  setApiStatut("Transmition de la déclaration en cours");
  try {
    const url = `/sejour/depose/${sejourId.value}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        attestation,
      },
    });

    toaster.success(
      `Félicitations, votre déclaration de séjour "${demandeCourante.value.libelle}" a été transmise`,
    );

    if (response.DSuuid) {
      if (
        demandeCourante.value.statut === DeclarationSejour.statuts.BROUILLON ||
        demandeCourante.value.statut === DeclarationSejour.statuts.A_MODIFIER
      )
        toaster.info(
          `Le PDF déclaration_2_mois a été ajouté aux documents de la déclaration de séjour`,
        );
      else
        toaster.info(
          `Le PDF déclaration_8_jours a été ajouté aux documents de la déclaration de séjour`,
        );
    } else {
      toaster.error(
        "Une erreur est survenue durant la génération du PDF mais la déclaration a bien été transmise",
      );
    }
    log.d(`demande de séjour ${sejourId.value} transmise`);
    return await navigateTo("/demande-sejour/liste");
  } catch (error) {
    log.w("Finalisation de la declaration de sejour : ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la transmission de la déclaration de séjour`,
    );
  } finally {
    resetApiStatut();
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

<style scoped>
.badge {
  display: flex;
  justify-content: end;
  align-items: start;
}
</style>
