<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-py-3w fr-col-xs-12 fr-col-md-3">
        <OrganismeMenuOrganisme
          :active-id="hash"
          :organisme="organismeStore.organismeCourant ?? {}"
        ></OrganismeMenuOrganisme>
      </div>

      <div class="fr-col-xs-12 fr-col-md-9 fr-py-3w">
        <DsfrBreadcrumb :links="links" />
        <OrganismeStepper :step="hash"></OrganismeStepper>
        <div>
          <div id="info-generales">
            <OrganismeInformationsGenerales
              v-if="hash === 'info-generales'"
              :init-data="organismeStore.organismeCourant ?? {}"
              :is-downloading="apiStatus.isDownloading"
              :message="apiStatus.message"
              @update="updateOrCreate"
              @next="nextHash"
            />
          </div>
          <div id="etablissement-secondaires">
            <OrganismeEtablissementsSecondaires
              v-if="hash === 'etablissement-secondaires'"
              :is-downloading="apiStatus.isDownloading"
              :message="apiStatus.message"
              @update="updateOrCreate"
              @previous="previousHash"
              @next="nextHash"
            />
          </div>
          <div id="agrement">
            <OrganismeAgrement
              v-if="hash === 'agrement'"
              :init-agrement="organismeStore.organismeCourant.agrement ?? {}"
              :modifiable="isPorteurAgrement"
              :is-downloading="apiStatus.isDownloading"
              :message="apiStatus.message"
              :cdn-url="`${config.public.backendUrl}/documents/`"
              @previous="previousHash"
              @next="nextHash"
              @update="updateOrCreateAgrement"
            ></OrganismeAgrement>
          </div>
          <div id="protocole-transport">
            <ProtocoleTransport
              v-if="hash === 'protocole-transport'"
              :init-data="
                organismeStore.organismeCourant.protocoleTransport ?? {}
              "
              :is-downloading="apiStatus.isDownloading"
              :message="apiStatus.message"
              @update="updateOrCreate"
              @previous="previousHash"
              @next="nextHash"
            ></ProtocoleTransport>
          </div>
          <div id="protocole-sanitaire">
            <ProtocoleSanitaire
              v-if="hash === 'protocole-sanitaire'"
              :init-data="
                organismeStore.organismeCourant.protocoleSanitaire ?? {}
              "
              :is-downloading="apiStatus.isDownloading"
              :message="apiStatus.message"
              @update="updateOrCreate"
              @previous="previousHash"
              @next="nextHash"
            ></ProtocoleSanitaire>
          </div>
          <div id="synthese">
            <OrganismeSynthese
              v-if="hash === 'synthese'"
              :is-downloading="apiStatus.isDownloading"
              :message="apiStatus.message"
              @finalize="finalizeOrganisme"
              @previous="previousHash"
            ></OrganismeSynthese>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getFileUploadErrorMessage } from "@vao/shared/src/utils/file.mjs";
const route = useRoute();
const toaster = useToaster();
const log = logger("pages/organisme/[[organismeId]]");
const config = useRuntimeConfig();
const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();

definePageMeta({
  middleware: ["is-connected", "check-organisme-id-param"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Ma fiche organisateur",
  },
];

useHead({
  title: "Fiche organisateur | ",
  meta: [
    {
      name: "description",
      content: "Page de gestion de la fiche organisateur",
    },
  ],
});

const organismeStore = useOrganismeStore();

const isPorteurAgrement = computed(() => {
  return (
    organismeStore.organismeCourant?.typeOrganisme === "personne_physique" ||
    organismeStore.organismeCourant?.personneMorale?.porteurAgrement === true
  );
});

const sommaireOptions = computed(() =>
  organismeMenus.menus(organismeStore.isSiegeSocial).map((m) => m.id),
);

const titles = computed(() =>
  organismeMenus.titles(organismeStore.isSiegeSocial),
);

const hash = computed(() => {
  if (route.hash) {
    useHead({
      title: titles.value[route.hash],
    });
    return route.hash.slice(1);
  }
  useHead({
    title: titles.value["#info-generales"],
  });
  return sommaireOptions.value[0];
});

const organismeId = ref(route.params.organismeId);

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  log.d({ hash: hash.value, index, next: sommaireOptions.value[index - 1] });
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  log.d({ index, next: sommaireOptions.value[index + 1] });
  return navigateTo({
    path: `/organisme/${organismeId.value}`,
    hash: "#" + sommaireOptions.value[index + 1],
  });
}

async function updateOrCreate(organismeData, type) {
  log.i("updateOrCreate - IN", { organismeData, type });
  setApiStatut(
    ` ${organismeId.value ? "Sauvegarde" : "Création"} de la fiche organisateur en cours`,
  );
  let counter = 0;

  if (organismeData.file) {
    log.d("updateOrCreate - look at organismeData.file");
    const file = unref(organismeData.file);
    if (!file.uuid) {
      try {
        const uuid = await UploadFile(type, file);
        organismeData.file = {
          uuid,
          name: file.name,
          createdAt: new Date(),
        };
        toaster.info(`Document déposé`);
      } catch (error) {
        resetApiStatut();
        const description = getFileUploadErrorMessage(
          file?.name,
          error?.data?.name,
        );
        return toaster.error({
          titleTag: "h2",
          description,
        });
      }
    }
  }

  if (organismeData.files && organismeData.files.length) {
    log.d("updateOrCreate - look at organismeData.files");
    const files = [];
    for (let i = 0; i < organismeData.files.length; i++) {
      const file = unref(organismeData.files[i]);
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
        log.w(error.response);
        resetApiStatut();
        if (error.response.status === 413) {
          return toaster.error({
            titleTag: "h2",
            description: `Le fichier ${file.name} dépasse la taille maximale autorisée`,
          });
        }
        return toaster.error({
          titleTag: "h2",
          description: `Une erreur est survenue lors du dépôt du document ${file.name}`,
        });
      }
    }
    toaster.info({
      duration: 5000,
      titleTag: "h2",
      description: `${counter} ${counter === 1 ? "document déposé" : "documents déposés"}`,
    });
    organismeData.files = files;
  }

  try {
    const url = organismeId.value
      ? `/organisme/${organismeId.value}`
      : "/organisme";
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...organismeData },
        type,
      },
    });

    toaster.success({
      titleTag: "h2",
      description: `Fiche organisateur ${organismeId.value ? "sauvegardée" : "créée"}`,
    });
    organismeId.value = data.organismeId;
    await organismeStore.setMyOrganisme();
    log.d(`organisme ${organismeId.value} mis à jour`);
    return await nextHash();
  } catch (error) {
    if (
      error.response?.status === 403 &&
      error.data?.name?.match("siret update - organisme incomplete")
    ) {
      return toaster.error({
        titleTag: "h2",
        description: "Ce SIRET est déjà utilisé",
      });
    }

    log.w("Creation/modification d'organisme : ", { error });
    toaster.error({
      titleTag: "h2",
      description:
        "Une erreur est survenue lors de la sauvegarde de la fiche organisateur",
    });
  } finally {
    resetApiStatut();
  }
}

async function updateOrCreateAgrement(agrementData, type) {
  log.i("updateOrCreateAgrement - IN", { agrementData, type });
  setApiStatut("Creation de l'agrément en cours");
  if (agrementData.file) {
    log.d("updateOrCreateAgrement - look at agrementData.file");
    const file = unref(agrementData.file);
    if (!file.uuid) {
      try {
        const uuid = await UploadFile(type, file);
        agrementData.file = {
          uuid,
          name: file.name,
          createdAt: new Date(),
        };
      } catch (error) {
        if (error.response.status === 413) {
          resetApiStatut();
          return toaster.error({
            titleTag: "h2",
            description: `Le fichier ${file.name} dépasse la taille maximale autorisée`,
          });
        }
        if (error.response.status === 415) {
          return toaster.error(
            `Le fichier ${file.name} n'est pas au format PDF`,
          );
        }
        log.w(error);
        return toaster.error(
          `Une erreur est survenue lors du dépôt du document ${file.name}`,
        );
      }
    }
  }

  try {
    const url = "/agrements";
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: { ...agrementData, organismeId: organismeId.value },
    });

    toaster.success({ titleTag: "h2", description: `Agrément sauvegardé` });
    log.d(`agrement mis à jour`);

    return await nextHash();
  } catch (error) {
    log.w("Creation/modification d'agrement : ", { error });
    return toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors de la mise à jour des informations de l'agrément`,
    });
  } finally {
    resetApiStatut();
  }
}

async function finalizeOrganisme() {
  log.i("finalizeOrganisme - IN");
  setApiStatut("Finalisation de la fiche organisateur");
  try {
    const url = `/organisme/${organismeStore.organismeCourant.organismeId}/finalize`;
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
    });
    log.d(
      `organisateur ${organismeStore.organismeCourant.organismeId} finalisé`,
    );
    toaster.success({
      titleTag: "h2",
      description: "Fiche organisateur finalisée",
    });
    await organismeStore.setMyOrganisme();
    return await navigateTo("/");
  } catch (error) {
    log.w("Creation/modification d'organisateur : ", { error });
    toaster.error({
      titleTag: "h2",
      description:
        "Une erreur est survenue lors de la finalisation de la fiche organisateur",
    });
  } finally {
    resetApiStatut();
  }
}
</script>

<style lang="scss" scoped></style>
