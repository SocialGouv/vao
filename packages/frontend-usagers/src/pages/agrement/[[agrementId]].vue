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
          <div
            v-if="hash === 'agrement-bilan'"
            id="agrement-bilan"
            :read-only="readOnly"
          >
            <AgrementBilan
              :init-agrement="agrementStore.agrementCourant ?? {}"
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
              :init-agrement="agrementStore.agrementCourant ?? {}"
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
<script setup lang="ts">
const route = useRoute();

const toaster = useToaster();

const agrementStore = useAgrementStore();
const organismeStore = useOrganismeStore();
const documentStore = useDocumentStore();
const config = useRuntimeConfig();

const readOnly = false;

import { FILE_CATEGORY, type FileKey } from "@vao/shared-bridge";
import type { AgrementDto } from "@vao/shared-bridge";

type AgrementFormValues = Partial<AgrementDto> & {
  [K in FileKey]?: any;
};

const canModify = true;

async function updateOrCreate(formValues: AgrementFormValues) {
  const updatedData: AgrementFormValues = { ...formValues };
  try {
    updatedData.agrementFiles = [];
    const fileMappings: {
      key: FileKey;
      multiple: boolean;
      category: FILE_CATEGORY;
    }[] = [
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
      {
        key: "filesChangeEvol",
        multiple: true,
        category: FILE_CATEGORY.CHANGEEVOL,
      },
      {
        key: "filesBilanQualit",
        multiple: true,
        category: FILE_CATEGORY.BILANQUALIT,
      },
      {
        key: "filesBilanFinancier",
        multiple: true,
        category: FILE_CATEGORY.BILANFINANC,
      },
      {
        key: "filesAgrementSejour",
        multiple: true,
        category: FILE_CATEGORY.SEJOUR,
      },
      {
        key: "filesAccompResp",
        multiple: true,
        category: FILE_CATEGORY.ACCOMPRESP,
      },
      {
        key: "filesSuiviMed",
        multiple: true,
        category: FILE_CATEGORY.SUIVIMED,
      },
      {
        key: "filesBilanQualitPerception",
        multiple: true,
        category: FILE_CATEGORY.BILANQUALITPERCEPTION,
      },
      {
        key: "filesBilanQualitPerspectives",
        multiple: true,
        category: FILE_CATEGORY.BILANQUALITPERSPECTIVE,
      },
      {
        key: "filesBilanQualitElementsMarquants",
        multiple: true,
        category: FILE_CATEGORY.BILANQUALITELEMARQ,
      },
      {
        key: "filesBilanQualitComplementaires",
        multiple: true,
        category: FILE_CATEGORY.BILANQUALITCOMPLEMENTAIRES,
      },
      {
        key: "filesBilanFinancierQuatreAnnees",
        multiple: true,
        category: FILE_CATEGORY.BILANFINANCIERQUATREANNEES,
      },
      {
        key: "filesProjetsSejoursPrevus",
        multiple: true,
        category: FILE_CATEGORY.PROJETSSEJOURSPREVUS,
      },
      {
        key: "filesProjetsSejoursCompetencesExperience",
        multiple: true,
        category: FILE_CATEGORY.PROJETSSEJOURSCOMPETENCESEXPERIENCE,
      },
      {
        key: "filesProjetsSejoursMesures",
        multiple: true,
        category: FILE_CATEGORY.PROJETSSEJOURSMESURES,
      },
      {
        key: "filesProjetsSejoursComplementaires",
        multiple: true,
        category: FILE_CATEGORY.PROJETSSEJOURSCOMPLEMENTAIRES,
      },
      {
        key: "fileProjetsSejoursCasier",
        multiple: false,
        category: FILE_CATEGORY.PROJETSSEJOURSCASIER,
      },
      {
        key: "filesProjetsSejoursOrgaTransports",
        multiple: true,
        category: FILE_CATEGORY.PROJETSSEJOURSORGATRANSPORT,
      },
      {
        key: "filesProjetsSejoursSuiviMed",
        multiple: true,
        category: FILE_CATEGORY.PROJETSSEJOURSSUIVIMED,
      },
      {
        key: "filesProjetsSejoursProtocoleReorientation",
        multiple: true,
        category: FILE_CATEGORY.PROJSEJPROTCOREORIENT,
      },
      {
        key: "filesProjetsSejoursProtocoleRapatriement",
        multiple: true,
        category: FILE_CATEGORY.PROJSSEJOURSPROTCOLERAPATR,
      },
      {
        key: "filesProjSejoursBudgetPersonnes",
        multiple: true,
        category: FILE_CATEGORY.PROJSEJOURSBUDGETPERSONNES,
      },
    ];

    for (const { key, multiple, category } of fileMappings) {
      const value = updatedData[key as FileKey];

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

    const rawOrganismeId = organismeStore.organismeCourant?.organismeId;
    const organismeId = rawOrganismeId != null ? Number(rawOrganismeId) : null;
    const newAgrement = {
      ...agrementStore.agrementCourant,
      ...updatedData,
      organismeId,
      statut:
        updatedData.statut ?? agrementStore.agrementCourant?.statut ?? null,
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

    toaster.success("Données enregistrées avec succès !");
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
        agrementId: agrementStore.agrementCourant?.id ?? null,
      };
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description: error instanceof Error ? error.message : String(error),
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
      agrementId: agrementStore.agrementCourant?.id ?? null,
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

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  const id = agrementStore.agrementCourant?.id ?? "";
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
