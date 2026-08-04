<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row fr-px-3w">
      <div class="fr-col-xs-12 fr-col-md-3">
        <EIGMenu
          :active-id="hash"
          :eig-id="eigId ? Number(eigId) : undefined"
        />
      </div>
      <div class="fr-col-xs-12 fr-col-md-9 fr-py-3w">
        <div class="text-italic">
          Les informations accessibles sur cette page, notamment celles
          relatives au personnel encadrant, sont particulièrement sensibles et
          confidentielles. Elles sont réservées aux seules personnes habilitées
          à en connaître dans le cadre du traitement de l’EIG et ne doivent en
          aucun cas être partagées. Les champs libres ne doivent contenir aucune
          donnée personnelle ou de santé non nécessaire au traitement de
          l’événement.
        </div>
        <div class="fr-pb-6v">
          <EIGStepper :step="hash" />
          <EIGSelectionSejour
            v-if="hash === 'eig-selection-sejour' || !hash"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @update="updateOrCreate"
            @next="nextHash"
          />
          <EIGType
            v-if="hash === 'eig-type-evenement'"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
          <EIGRenseignementsGeneraux
            v-if="hash === 'eig-renseignements-generaux'"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
          <EIGRecap
            v-if="hash === 'eig-recap'"
            :is-downloading="apiStatus.isDownloading"
            :cdn-url="`${config.public.backendUrl}/documents/`"
            :message="apiStatus.message"
            @finalize="finalize"
            @previous="previousHash"
          />
        </div>
        <DsfrAlert>
          <p>
            L’article R. 412-14-1 du code du tourisme prévoit que les personnes
            responsables de l’organisation du séjour sur le lieu de vacances
            sont tenues d’informer sans délai le préfet du département du lieu
            de séjour de tout accident grave ainsi que de toute situation
            présentant ou ayant présenté des risques graves pour la santé,
            l’intégrité ou le bien être physique et moral des personnes
            handicapées majeures.
          </p>
          <p>
            Le préfet de région qui a délivré l'agrément est informé de cette
            transmission.
          </p>
        </DsfrAlert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { eigModel, fileUtils, useToaster } from "@vao/shared-ui";
const getFileUploadErrorMessage = fileUtils.getFileUploadErrorMessage;

interface FinalizeBody {
  file?: File;
  name?: string;
  [key: string]: unknown;
}

interface UploadError {
  data?: {
    name?: string;
  };
}

definePageMeta({
  middleware: ["is-connected", "check-roles", "check-eig-id-param"],
});

useHead({
  title: "eig détaillée | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description d'une eig.",
    },
  ],
});

const route = useRoute();
const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();
const toaster = useToaster();
const eigStore = useEigStore();
const config = useRuntimeConfig();

const log = logger("pages/eig/[[eigId]]");

const eigId = ref<string | null>(route.params.eigId?.toString() ?? null);

const hash = computed(() => route.hash.slice(1) || eigMenu[0].id);

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/eig/liste",
    text: "Liste des déclarations des eig",
  },
  {
    text: "Déclarer un événement indésirable et grave",
  },
];

const updateOrCreate = async (data: unknown, type: string) => {
  log.i("updateOrCreate - IN", { data, type });
  setApiStatut(
    `${eigId.value ? "Sauvegarde" : "Création"} de la demande de séjour en cours`,
  );
  try {
    let response: { id: string | number };

    if (eigId.value) {
      response = await eigStore.updateEig(eigId.value, type, data);
    } else {
      response = await eigStore.create(data);
    }

    toaster.success({
      titleTag: "h2",
      description: `EIG ${eigId.value ? "sauvegardé" : "créé"}`,
    });
    log.d(`EIG ${eigId.value} mis à jour`);
    eigId.value = String(response.id);
    return await nextHash();
  } catch (error) {
    log.w("Creation/modification EIG: ", { error });
    return toaster.error({
      description: "Une erreur est survenue lors de la mise à jour de l'EIG",
      role: "alert",
    });
  } finally {
    resetApiStatut();
  }
};

function previousHash() {
  const index = eigMenu.findIndex((o) => o.id === hash.value);
  return navigateTo({ hash: "#" + eigMenu[index - 1].id });
}

const nextHash = () => {
  const index = eigMenu.findIndex((o) => o.id === hash.value);
  return navigateTo({
    path: `/eig/${eigId.value}`,
    hash: "#" + eigMenu[index + 1].id,
  });
};

async function finalize(body: FinalizeBody) {
  if (!eigId.value) {
    return;
  }
  log.i("finalize eig -IN");
  setApiStatut("Transmission de l'eig en cours");
  const newFile = {};
  if (body.file) {
    try {
      const uuid = await UploadFile("eig", body.file);
      Object.assign(newFile, {
        uuid,
        name: body.name ?? "document_eig",
        createdAt: new Date(),
      });
      toaster.info({
        titleTag: "h2",
        description: "Document déposé",
      });
    } catch (error) {
      const uploadError = error as UploadError;
      const description = getFileUploadErrorMessage(
        body.file?.name,
        uploadError.data?.name,
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
    await eigStore.updateEig(eigId.value, eigModel.UpdateTypes.FILE, {
      file: newFile,
    });
    await eigStore.updateEig(
      eigId.value,
      eigModel.UpdateTypes.EMAIL_AUTRES_DESTINATAIRES,
      body,
    );

    await eigStore.depose(eigId.value, body);
    toaster.success({
      titleTag: "h2",
      description: "L'EIG a été déposé",
    });
    log.d(`EIG ${eigId.value} deposé`);
    return await navigateTo("/eig/liste");
  } catch (error) {
    log.w("Finalisation de la declaration de sejour : ", { error });
    return toaster.error({
      description: "Une erreur est survenue lors de la transmission de l'EIG",
      role: "alert",
    });
  } finally {
    resetApiStatut();
  }
}
</script>

<style lang="css">
.text-italic {
  color: gray;
  font-style: italic;
  font-size: 1rem;
}
</style>
