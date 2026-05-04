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
        <AgrementStepper :step="hash" />
        <div>
          <div v-if="hash === 'agrement-coordonnees'" id="agrement-coordonnees">
            <AgrementCoordonnees
              v-if="hash === 'agrement-coordonnees'"
              :init-organisme="organismeStore.organismeCourant ?? {}"
              :init-agrement="agrementStore.agrementEnTraitement ?? {}"
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
              :init-agrement="agrementStore.agrementEnTraitement ?? {}"
              :modifiable="canModify"
              :cdn-url="`${config.public.backendUrl}/documents/`"
              @update="(formValues: any) => updateOrCreate(formValues)"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div
            v-if="hash === 'agrement-bilan'"
            id="agrement-bilan"
            :read-only="readOnly"
          >
            <AgrementBilan
              :init-agrement="agrementStore.agrementEnTraitement ?? {}"
              :modifiable="canModify"
              :cdn-url="`${config.public.backendUrl}/documents/`"
              @update="(formValues) => updateOrCreate(formValues)"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div
            v-if="hash === 'agrement-projets'"
            id="agrement-projets"
            :read-only="readOnly"
          >
            <AgrementProjets
              :init-agrement="agrementStore.agrementEnTraitement ?? {}"
              :cdn-url="`${config.public.backendUrl}/documents/`"
              @update="(formValues) => updateOrCreate(formValues)"
              @next="nextHash"
              @previous="previousHash"
            />
          </div>
          <div
            v-if="hash === 'agrement-synthese'"
            id="agrement-synthese"
            :read-only="readOnly"
          >
            <AgrementSynthese
              class="fr-my-2w"
              :init-organisme="organismeStore.organismeCourant ?? {}"
              :init-agrement="agrementStore.agrementEnTraitement ?? {}"
              :modifiable="false"
              :cdn-url="`${config.public.backendUrl}/documents/`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  FILE_CATEGORY,
  AgrementDto,
  AgrementFilesDto,
  FileKey,
} from "@vao/shared-bridge";
import { AGREMENT_STATUT, FILE_CATEGORY_CONFIG } from "@vao/shared-bridge";
import { useToaster, handleDocumentUploadError } from "@vao/shared-ui";
import { getFileByCategory } from "~/utils/agrementFile";

const route = useRoute();

const toaster = useToaster();

const agrementStore = useAgrementStore();
const organismeStore = useOrganismeStore();
const documentStore = useDocumentStore();
const config = useRuntimeConfig();

const readOnly = false;

type AgrementFormValues = Partial<AgrementDto> & {
  [K in FileKey]?: any;
};

const canModify = true;

/**
 * Fusionne les fichiers du store (tous les fichiers déjà uploadés)
 * et les fichiers du formulaire courant (ceux ajoutés, modifiés ou supprimés à cette étape).
 *
 * - Pour chaque catégorie :
 *   - Si la catégorie est multiple, on prend tous les fichiers présents dans le formulaire pour cette catégorie.
 *     Cela permet d'ajouter ou de supprimer des fichiers dans la liste.
 *   - Si la catégorie est single-upload, on prend le fichier du formulaire s'il existe,
 *     sinon on garde le fichier existant du store.
 * - Les catégories non modifiées à cette étape conservent leurs fichiers existants.
 * - Les catégories explicitement vidées dans le formulaire (liste vide) entraînent la suppression des fichiers correspondants.
 *
 * Cette fonction garantit la persistance des fichiers déjà uploadés tout au long du parcours,
 * tout en permettant l'ajout et la suppression effective de fichiers à chaque étape.
 */
function mergeAgrementFiles(
  storeFiles: AgrementFilesDto[],
  formFiles: AgrementFilesDto[],
): AgrementFilesDto[] {
  const filesByCategory = new Map<string, AgrementFilesDto[]>();
  for (const file of storeFiles) {
    if (!filesByCategory.has(file.category))
      filesByCategory.set(file.category, []);
    filesByCategory.get(file.category)!.push(file);
  }
  for (const file of formFiles) {
    filesByCategory.set(
      file.category,
      filesByCategory
        .get(file.category)
        ?.filter((f) => f.fileUuid !== file.fileUuid) ?? [],
    );
    filesByCategory.get(file.category)!.push(file);
  }
  const result: AgrementFilesDto[] = [];
  for (const [category, files] of filesByCategory.entries()) {
    const isMultiple =
      FILE_CATEGORY_CONFIG[category as keyof typeof FILE_CATEGORY_CONFIG]
        ?.multiple;
    if (isMultiple) {
      const formCatFiles = formFiles.filter((f) => f.category === category);
      result.push(...formCatFiles);
    } else {
      const formCatFile = formFiles.find((f) => f.category === category);
      if (formCatFile) {
        result.push(formCatFile);
      } else if (files.length) {
        result.push(files[0]);
      }
    }
  }
  return result;
}

async function updateOrCreate(formValues: AgrementFormValues) {
  const updatedData: AgrementFormValues = { ...formValues };

  try {
    const agrementEnTraitement = agrementStore.agrementEnTraitement;
    if (!agrementEnTraitement) {
      toaster.error({
        titleTag: "h2",
        title: "Erreur",
        description: "Impossible d’enregistrer l’agrément : données absentes.",
      });
      return;
    }

    updatedData.agrementFiles = [...(agrementEnTraitement.agrementFiles ?? [])];

    if (updatedData.id == null) {
      updatedData.statut = AGREMENT_STATUT.BROUILLON;
    }
    if (updatedData.statut === AGREMENT_STATUT.TRANSMIS) {
      updatedData.dateDepot = new Date();
    }

    const formFiles = [];
    for (const category of Object.keys(
      FILE_CATEGORY_CONFIG,
    ) as (keyof typeof FILE_CATEGORY_CONFIG)[]) {
      const { fileKey, multiple } = FILE_CATEGORY_CONFIG[category];
      const value = updatedData[fileKey];
      if (!value) continue;
      if (multiple) {
        const docs = await createDocuments({
          documents: value,
          category: category as FILE_CATEGORY,
        });
        formFiles.push(...docs);
      } else {
        const doc = await createDocument({
          document: value,
          category: category as FILE_CATEGORY,
        });
        if (doc) formFiles.push(doc);
      }
    }
    const storeFiles = agrementStore.agrementEnTraitement?.agrementFiles ?? [];
    updatedData.agrementFiles = mergeAgrementFiles(storeFiles, formFiles);

    const agrementFiles = getFileByCategory(agrementEnTraitement, updatedData);

    const rawOrganismeId = organismeStore.organismeCourant?.organismeId;
    const organismeId = rawOrganismeId != null ? Number(rawOrganismeId) : null;
    const newAgrement = {
      ...agrementEnTraitement,
      ...updatedData,
      agrementFiles,
      organismeId,
      statut: updatedData.statut ?? agrementEnTraitement.statut ?? null,
    };

    if (organismeId == null) {
      toaster.error({
        titleTag: "h2",
        title: "Erreur",
        description: "Impossible d’enregistrer l’agrément : organisme inconnu.",
      });
      return;
    }

    await agrementStore.postAgrement({
      agrement: newAgrement,
      organismeId,
    });

    toaster.success({
      titleTag: "h2",
      description: "Données enregistrées avec succès !",
    });
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      title: "Erreur lors de l'enregistrement de l'agrément",
      description: error instanceof Error ? error.message : String(error),
    });
  }
}

async function createDocuments({
  documents,
  category,
}: {
  documents: any[];
  category: FILE_CATEGORY;
}) {
  const result = [];

  for (const document of documents) {
    const docInfo = await createDocument({ document, category });
    if (docInfo) result.push(docInfo);
  }

  return result;
}

async function createDocument({
  document,
  category,
}: {
  document: any;
  category: FILE_CATEGORY;
}) {
  if (document && Object.keys(document?.uuid ?? {}).length === 0) {
    try {
      const uuid = await documentStore.postDocument({ document, category });
      toaster.info({
        titleTag: "h2",
        description: `Fichier ${document.name} déposé`,
      });

      return {
        name: document.name,
        uuid: uuid,
        fileUuid: uuid,
        category,
        agrementId: agrementStore.agrementEnTraitement?.id ?? null,
      };
    } catch (error) {
      handleDocumentUploadError(error, toaster);
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
      agrementId: agrementStore.agrementEnTraitement?.id ?? null,
    };
  }

  return null;
}

const hash = computed(() => {
  if (route.hash) {
    useHead({
      title: titles.value[route.hash as keyof typeof titles.value],
    });
    return route.hash.slice(1);
  }
  useHead({
    title: titles.value["#agrement-coordonnees"],
  });
  return sommaireOptions.value[0];
});

definePageMeta({
  middleware: [
    "is-connected",
    "check-organisme-is-complet",
    "check-feature-flags",
  ],
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

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  const id = agrementStore.agrementEnTraitement?.id ?? "";
  return navigateTo({
    path: `/agrement/${id}`,
    hash: "#" + sommaireOptions.value[index + 1],
  });
}

const sommaireOptions = computed(() => agrementMenu.menus.map((m) => m.id));

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
