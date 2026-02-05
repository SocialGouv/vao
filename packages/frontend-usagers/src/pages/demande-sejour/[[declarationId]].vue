<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <h1>
      Déclaration
      {{
        demandeCourante.statut &&
        demandeCourante.statut &&
        demandeCourante.statut !== DeclarationSejour.statuts.BROUILLON
          ? `: ${demandeCourante.libelle}`
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
      <DsfrAlert
        v-if="
          organismeStore.isSiegeSocial &&
          demandeCourante?.organisme?.typeOrganisme === 'personne_morale' &&
          !demandeCourante.organisme?.personneMorale?.siegeSocial
        "
      >
        <p>
          Vous visualisez une déclaration effectuée par l'établissement
          secondaire de {{ communeOrganisme }}
        </p>
      </DsfrAlert>

      <div class="fr-col-7">
        <div v-for="detail in demandeDetails" :key="detail.label">
          <strong>{{ detail.label }} : </strong>{{ detail.value }}
        </div>
      </div>
      <div class="fr-col-5 badge">
        <DemandeStatusBadge :statut="demandeCourante.statut" type="fo" />
      </div>
    </div>
    <DsfrTabs
      v-model="selectedTabIndex"
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @update:model-value="selectTab"
    >
      <DsfrTabContent
        panel-id="declaration-sejour-content-0"
        tab-id="declaration-sejour-tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <div class="fr-container">
          <div class="fr-grid-row fr-px-3w">
            <div class="fr-col-xs-12 fr-col-md-3">
              <DSMenuDemandeSejour
                :active-id="hash"
                :demande="demandeCourante"
              ></DSMenuDemandeSejour>
            </div>

            <div class="fr-col-xs-12 fr-col-md-9 fr-py-3w">
              <DSStepper :step="hash"></DSStepper>
              <div>
                <div id="info-generales">
                  <DSInformationsGenerales
                    v-if="hash === 'info-generales'"
                    :init-data="demandeCourante ?? {}"
                    :init-organisme="organismeEnCours"
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
                    :modifiable-en-cours="canModifyEnCours"
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
                    :modifiable-en-cours="canModifyEnCours"
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
                    :init-organisme="organismeEnCours"
                    :modifiable="canModify"
                    :modifiable-en-cours="canModifyEnCours"
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
        tab-id="declaration-sejour-tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <DSDocuments
          :declaration="demandeCourante ?? {}"
          :messages="demandeSejourStore.messages ?? []"
        ></DSDocuments>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="declaration-sejour-content-2"
        tab-id="declaration-sejour-tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <DSHistorique
          v-if="historique"
          :historique="historique.historique ?? []"
        ></DSHistorique>
        <DsfrAlert v-else-if="errorHistorique" type="error"
          >Une erreur est survenue durant la récupération de l'historique de la
          déclaration
        </DsfrAlert>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="declaration-sejour-content-3"
        tab-id="declaration-sejour-tab-3"
        :selected="selectedTabIndex === 3"
        :asc="asc"
      >
        <div v-if="demandeCourante.statut !== 'BROUILLON'">
          <Chat
            ref="chatRef"
            :cdn-url="`${config.public.backendUrl}/documents/`"
            :messages="demandeSejourStore.messages ?? []"
            :is-loading="isSendingMessage"
            @send="sendMessage"
          />
        </div>
        <div v-else>
          <DsfrAlert type="info" role="status"
            >La messagerie n'est pas accessible pour les demandes à l'état
            BROUILLON
          </DsfrAlert>
        </div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="declaration-sejour-content-4"
        tab-id="declaration-sejour-tab-4"
        :selected="selectedTabIndex === 4"
        :asc="asc"
      >
        <DSEigs
          v-if="eigs"
          :eigs="eigs.eigs"
          :ds="demandeCourante"
          :fetch-eig="executeEig"
        />
        <DsfrAlert v-else-if="errorEigs" type="error"
          >Une erreur est survenue durant la récupération des eig
        </DsfrAlert>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { Chat, DemandeStatusBadge, fileUtils, useToaster } from "@vao/shared-ui";
const getFileUploadErrorMessage = fileUtils.getFileUploadErrorMessage;

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
const links =
  parseInt(route.query?.defaultTabIndex) === 0
    ? [
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
      ]
    : [
        {
          to: "/",
          text: "Accueil",
        },
        {
          to: "/messagerie",
          text: "Liste des messages par déclaration",
        },
        {
          text: "Messages de ma déclaration de séjour",
        },
      ];

const log = logger("pages/demande-sejour/[[declarationId]]");

const config = useRuntimeConfig();
const demandeSejourStore = useDemandeSejourStore();
const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const organismeStore = useOrganismeStore();

const organismeEnCours = computed(() => {
  if (
    demandeSejourStore?.demandeCourante.statut === undefined ||
    demandeSejourStore?.demandeCourante.statut ===
      DeclarationSejour.statuts.BROUILLON
  ) {
    return organismeStore.organismeCourant;
  } else {
    return demandeSejourStore.demandeCourante.organisme;
  }
});

const initialSelectedIndex = parseInt(
  route.query?.defaultTabIndex ? route.query.defaultTabIndex : 0,
);

const chatRef = ref(null);
const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

if (route.params.declarationId) {
  demandeSejourStore.fetchMessages(route.params.declarationId);
}

const {
  data: historique,
  error: errorHistorique,
  execute: executeHistorique,
} = useFetchBackend(`/sejour/historique/${route.params.declarationId}`, {
  immediate: false,
  method: "GET",
  credentials: "include",
});

const {
  data: eigs,
  error: errorEigs,
  execute: executeEig,
} = useFetchBackend(`/eig/ds/${route.params.declarationId}`, {
  immediate: false,
  method: "GET",
  credentials: "include",
});

const selectTab = async (idx) => {
  asc.value = selectedTabIndex.value < idx;
  if (idx === 2 && !historique.value) {
    executeHistorique();
  }
  if (idx === 4 && !eigs.value) {
    executeEig();
  }
  if (idx === 3) {
    await demandeSejourStore.readMessages(route.params.declarationId);
    demandeSejourStore.fetchMessages(route.params.declarationId);
  }
};

const unreadMessages = computed(() => {
  const nb = demandeSejourStore.messages.filter(
    (m) => !m.readAt && m.backUserId != null,
  ).length;
  return nb && nb > 0 ? `(${nb})` : "";
});
const sejourId = ref(route.params.declarationId);

const tabTitles = computed(() => [
  {
    title: "Formulaire",
    tabId: "declaration-sejour-tab-0",
    panelId: "declaration-sejour-content-0",
  },
  {
    title: "Documents joints",
    tabId: "declaration-sejour-tab-1",
    panelId: "declaration-sejour-content-1",
  },
  ...(sejourId.value
    ? [
        {
          title: "Historique de la déclaration",
          tabId: "declaration-sejour-tab-2",
          panelId: "declaration-sejour-content-2",
        },
      ]
    : []),
  ...(sejourId.value
    ? [
        {
          title: `Messagerie ${unreadMessages.value}`,
          tabId: "declaration-sejour-tab-3",
          panelId: "declaration-sejour-content-3",
          icon: `${unreadMessages.value ? "ri:feedback-line" : ""}`,
        },
      ]
    : []),
  /*  ...(sejourId.value
      ? [
          {
            title: "EIG",
            tabId: "declaration-sejour-tab-4",
            panelId: "declaration-sejour-content-4",
          },
        ]
      : []),*/
]);

const sommaireOptions = demandeSejourMenus
  .filter(
    (menu) =>
      !menu.statutsMasques ||
      !menu.statutsMasques.includes(demandeCourante.value.statut),
  )
  .map((m) => m.id);

const titleStart = computed(() =>
  route.params.declarationId ? "Séjour | " : "Nouveau séjour | ",
);
const titleEnd = " | Vacances Adaptées Organisées";

const titles = {
  "#info-generales": () =>
    titleStart.value + "étape 1 sur 8 | Informations générales" + titleEnd,
  "#info-vacanciers": () =>
    titleStart.value +
    "étape 2 sur 8 | Informations sur les vacanciers" +
    titleEnd,
  "#info-personnel": () =>
    titleStart.value +
    "étape 3 sur 8 | Informations sur le personnel" +
    titleEnd,
  "#projet-sejour": () =>
    titleStart.value + "étape 4 sur 5 | Projet de séjour" + titleEnd,
  "#info-transport": () =>
    titleStart.value +
    "étape 5 sur 8 | Informations sur le transport" +
    titleEnd,
  "#info-sanitaires": () =>
    titleStart.value + "étape 6 sur 8 | Informations sanitaires" + titleEnd,
  "#hebergements": () =>
    titleStart.value + "étape 7 sur 8 | Sélection des hébergements" + titleEnd,
  "#synthese": () => titleStart.value + "étape 8 sur 8 | Synthèse" + titleEnd,
  1: () => titleStart.value + "Documents joints" + titleEnd,
  2: () => titleStart.value + "Historique de la déclaration" + titleEnd,
  3: () => titleStart.value + "Messagerie" + titleEnd,
  4: () => titleStart.value + "EIG" + titleEnd,
};

const hash = computed(() => {
  if (route.hash) {
    useHead({
      title:
        titles[
          selectedTabIndex.value === 0 ? route.hash : selectedTabIndex.value
        ](),
    });
    return route.hash.slice(1);
  }
  useHead({
    title:
      titles[
        selectedTabIndex.value === 0
          ? "#info-generales"
          : selectedTabIndex.value
      ](),
  });
  return sommaireOptions[0];
});

const canModify = computed(() => {
  return (
    !demandeCourante.value.statut ||
    ((demandeCourante.value.statut === DeclarationSejour.statuts.BROUILLON ||
      demandeCourante.value.statut === DeclarationSejour.statuts.A_MODIFIER ||
      demandeCourante.value.statut ===
        DeclarationSejour.statuts.ATTENTE_8_JOUR ||
      demandeCourante.value.statut ===
        DeclarationSejour.statuts.A_MODIFIER_8J) &&
      organismeStore.organismeCourant?.organismeId ===
        demandeCourante.value.organisme?.organismeId)
  );
});

const communeOrganisme = computed(() => {
  return DeclarationSejour.getOrganismeCommune(demandeCourante.value);
});
const canModifyEnCours = computed(() => {
  return (
    canModify.value ||
    demandeCourante.value.statut === DeclarationSejour.statuts.VALIDEE_8J ||
    (demandeCourante.value.statut ===
      DeclarationSejour.statuts.SEJOUR_EN_COURS &&
      organismeStore.organismeCourant?.organismeId ===
        demandeCourante.value.organisme?.organismeId)
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
      value: `${dayjs(demandeCourante.value.dateDebut).format("DD/MM/YYYY")} - ${dayjs(demandeCourante.value.dateFin).format("DD/MM/YYYY")}`,
    },
    {
      label: "Saison",
      value: DeclarationSejour.getSaison(demandeCourante.value.dateDebut),
    },
    {
      label: "Déclaration",
      value: demandeCourante.value.idFonctionnelle,
    },
  ];
});

const isSendingMessage = ref(false);

const sendMessage = async ({ message, file }) => {
  let newFile;
  isSendingMessage.value = true;
  if (file) {
    try {
      const uuid = await UploadFile("message", file);
      newFile = {
        uuid,
        name: file.name ?? "document_messagerie",
        createdAt: new Date(),
      };
      toaster.info({ titleTag: "h2", description: `Document déposé` });
    } catch (error) {
      isSendingMessage.value = false;
      log.w(error);
      const description = getFileUploadErrorMessage(
        file?.name,
        error?.data?.name,
      );
      toaster.error({
        titleTag: "h2",
        description,
        role: "alert",
      });
      return;
    }
  }
  try {
    const url = `/message/${sejourId.value}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: { message: message ?? "", file: newFile },
    });
    if (response.id) {
      chatRef.value.resetForm();
    }
    isSendingMessage.value = false;
  } catch (error) {
    isSendingMessage.value = false;
    log.w("envoi de message : ", { error });
    return toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors de l'envoi de votre message`,
      role: "alert",
    });
  }
  demandeSejourStore.fetchMessages(sejourId.value);
};

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
        toaster.info({ titleTag: "h2", description: `Document déposé` });
      } catch (error) {
        const description = getFileUploadErrorMessage(
          file?.name,
          error?.data?.name,
        );
        toaster.error({
          titleTag: "h2",
          description,
          role: "alert",
        });
        return;
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
        const description = getFileUploadErrorMessage(
          file?.name,
          error?.data?.name,
        );
        toaster.error({
          titleTag: "h2",
          description,
          role: "alert",
        });
        return;
      }
    }
    toaster.info({
      titleTag: "h2",
      description: `${counter} document${counter > 1 ? "s" : ""} déposé${counter > 1 ? "s" : ""}`,
    });
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
      {
        titleTag: "h2",
        description: `Déclaration de séjour ${sejourId.value ? "sauvegardée" : "créée"}`,
      }
    );
    log.d(`demande de séjour ${sejourId.value} mis à jour`);
    sejourId.value = response.id;
    return await nextHash();
  } catch (error) {
    log.w("Creation/modification de declaration de sejour: ", { error });
    return toaster.error({
      titleTag: "h2",
      description:
        error.data.message ??
        `Une erreur est survenue lors de la mise à jour de la déclaration de séjour`,
      role: "alert",
    });
  } finally {
    resetApiStatut();
  }
}

async function finalize(attestation) {
  log.i("finalize -IN");
  setApiStatut("Transmission de la déclaration en cours");
  try {
    const url = `/sejour/depose/${sejourId.value}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        attestation,
      },
    });
    if (
      demandeCourante.value.statut === DeclarationSejour.statuts.VALIDEE_8J ||
      demandeCourante.value.statut === DeclarationSejour.statuts.SEJOUR_EN_COURS
    ) {
      toaster.success({
        titleTag: "h2",
        description: `Votre déclaration de séjour "${demandeCourante.value.libelle}" a bien été mise à jour`,
      });
    } else {
      toaster.success({
        titleTag: "h2",
        description: `Félicitations, votre déclaration de séjour "${demandeCourante.value.libelle}" a été transmise`,
      });
    }
    if (response.DSuuid) {
      if (
        demandeCourante.value.statut === DeclarationSejour.statuts.BROUILLON ||
        demandeCourante.value.statut === DeclarationSejour.statuts.A_MODIFIER
      )
        toaster.info({
          titleTag: "h2",
          description: `Le PDF déclaration_2_mois a été ajouté aux documents de la déclaration de séjour`,
        });
      else
        toaster.info({
          titleTag: "h2",
          description: `Le PDF déclaration_8_jours a été ajouté aux documents de la déclaration de séjour`,
        });
    } else {
      toaster.error({
        titleTag: "h2",
        description:
          "Une erreur est survenue durant la génération du PDF mais la déclaration a bien été transmise",
        role: "alert",
      });
    }
    log.d(`demande de séjour ${sejourId.value} transmise`);
    return await navigateTo("/demande-sejour/liste");
  } catch (error) {
    log.w("Finalisation de la declaration de sejour : ", { error });
    const codeError = error?.data?.name;
    const displayMessage =
      codeError === "SaveDeclarationError"
        ? "Une erreur est survenue à l'enregistement de la déclaration. L'enregistrement a échoué."
        : codeError === "MailError"
          ? "Une erreur est survenue à l'envoie de la notification par mail. La déclaration a bien été enregistrée."
          : `Une erreur inconnue est survenue lors de la transmission de la déclaration de séjour`;

    return toaster.error({
      titleTag: "h2",
      description: displayMessage,
      role: "alert",
    });
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
    "#synthese": () => titleStart.value + "étape 8 sur 8 | Synthèse" + titleEnd,
  });
}

onMounted(async () => {
  if (parseInt(route.query?.defaultTabIndex) === 3)
    await demandeSejourStore.readMessages(route.params.declarationId);
});
</script>

<style scoped>
.badge {
  display: flex;
  justify-content: end;
  align-items: start;
}
</style>
