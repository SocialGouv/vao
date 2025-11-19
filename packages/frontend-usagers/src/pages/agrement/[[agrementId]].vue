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
        <AgrementMenuAgrement :active-id="hash" @select="hash = $event" />
      </div>

      <div class="fr-col-xs-12 fr-col-md-9">
        <AgrementStepper />
        <div>
          <div v-if="hash === 'agrement-coordonnees'" id="agrement-coordonnees">
            <AgrementCoordonnees
              v-if="hash === 'agrement-coordonnees'"
              :init-organisme="organismeStore.organismeCourant ?? {}"
              :init-agrement="agrementStore.agrementCourant ?? {}"
              :modifiable="canModify"
              :cdn-url="`${config.public.backendUrl}/documents/`"
              @update="updateOrCreate"
              @next="nextHash"
            />
          </div>
          <div
            v-if="hash === 'agrement-dossier'"
            id="agrement-dossier"
            :read-only="readOnly"
          >
            <AgrementDossier
              class="fr-my-2w"
              :init-agrement="agrementStore.agrementCourant ?? {}"
              :modifiable="canModify"
              :cdn-url="`${config.public.backendUrl}/documents/`"
              @update="(formValues) => updateOrCreate(formValues)"
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

// TODO  - Pour la suite lorsque l'on aura l'ID dans l'URL
//const agrementId = computed(() => route.params?.agrementId);

const toaster = useToaster();

const agrementStore = useAgrementStore();
const organismeStore = useOrganismeStore();
const documentStore = useDocumentStore();
const config = useRuntimeConfig();
import { FILE_CATEGORY } from "@vao/shared-bridge";

const canModify = true;

async function updateOrCreate(formValues) {
  const updatedData = { ...formValues };
  try {
    updatedData.agrementFiles = [];
    const fileMappings = [
      {
        key: "filesMotivation",
        multiple: true,
        category: FILE_CATEGORY.MOTIVATION,
      },
      {
        key: "fileProcesVerbal",
        multiple: false,
        category: FILE_CATEGORY.PROCVERBAL,
      },
      {
        key: "fileImmatriculation",
        multiple: false,
        category: FILE_CATEGORY.IMMATRICUL,
      },
      {
        key: "fileAttestationsRespCivile",
        multiple: false,
        category: FILE_CATEGORY.ASSURRESP,
      },
      {
        key: "fileAttestationsRapatriement",
        multiple: false,
        category: FILE_CATEGORY.ASSURRAPAT,
      },
    ];

    for (const { key, multiple, category } of fileMappings) {
      const value = updatedData[key];

      if (!value) continue;
      if (multiple) {
        const docs = await createDocuments({ documents: value, category });
        updatedData.agrementFiles.push(...docs);
      } else {
        const doc = await createDocument({
          document: value,
          category,
        });
        if (doc) updatedData.agrementFiles.push(doc);
      }
    }

    const newAgrement = {
      ...agrementStore.agrementCourant,
      ...updatedData,
    };
    agrementStore.agrementCourant = newAgrement;

    // await agrementStore.postAgrement({
    //   agrement: newAgrement,
    //   organismeId: organismeStore.organismeCourant?.organismeId,
    // });

    toaster.success("Données enregistrées avec succès !");
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      title: "Erreur lors de l'enregistrement de l'agrément",
      description: error?.message,
    });
  }
}

async function createDocuments({ documents, category }) {
  const result = [];

  for (const document of documents) {
    const docInfo = await createDocument({ document, category });
    if (docInfo) result.push(docInfo);
  }

  return result;
}

async function createDocument({ document, category }) {
  if (document && Object.keys(document?.uuid ?? {}).length === 0) {
    try {
      const uuid = await documentStore.postDocument({
        document,
        category,
      });
      toaster.info({
        titleTag: "h2",
        description: `Fichier ${document.name} déposé`,
      });

      return {
        name: document.name,
        uuid: uuid,
        fileUuid: uuid,
        category,
      };
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description: error?.message,
      });
      return null;
    }
  }

  // Fichier déjà existant - on le garde
  if (document && document.uuid) {
    return {
      name: document?.name,
      uuid: document?.uuid,
      fileUuid: document.uuid,
      category,
    };
  }

  return null;
}

const hash = computed(() => {
  if (route.hash) {
    useHead({
      title: titles.value[route.hash],
    });
    return route.hash.slice(1);
  }
  useHead({
    title: titles.value["#agrement-coordonnees"],
  });
  return sommaireOptions.value[0];
});

definePageMeta({
  middleware: ["is-connected", "check-organisme-is-complet"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/agrement",
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

try {
  await agrementStore.getByOrganismeId(
    organismeStore.organismeCourant?.organismeId,
  );
} catch (error) {
  toaster.error({
    titleTag: "h2",
    title: "Erreur lors du chargement de l'agrément",
    description: error?.message,
  });
}

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  return navigateTo({
    path: `/agrement/${agrementStore.agrementCourant.value?.id ?? ""}`,
    hash: "#" + sommaireOptions.value[index + 1],
  });
}

const sommaireOptions = computed(() => agrementMenu.menus.map((m) => m.id));

//const titleEnd = " | Vacances Adaptées Organisées";

const titles = computed(() => agrementMenu.titles());
</script>
<style scoped>
.default-success {
  color: var(--text-default-success);
}
.next-btn {
  float: right;
}
</style>
