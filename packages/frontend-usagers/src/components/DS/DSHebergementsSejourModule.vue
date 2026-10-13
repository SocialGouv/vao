<template>
  <div>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckbox
          name="sejourItinerant"
          label="Séjour itinérant avec plusieurs hébergements"
          :model-value="sejourItinerant"
          :value="true"
          :readonly="!modifiable"
          @update:model-value="onSejourItinerantChange"
        />
      </div>
    </div>

    <div class="fr-fieldset">
      <div v-if="!sejourItinerant" class="fr-fieldset__element fr-col-12">
        <DSHebergementSelect
          :model-value="singleSiteId"
          label="Hébergement"
          name="hebergement"
          :options="siteOptions"
          :modifiable="modifiable"
          :error-message="singleSiteError"
          @update:model-value="onSingleSiteChange"
          @details="onDetails"
        />
      </div>
      <template v-else>
        <DSHebergementItinerant
          v-model="itineraryBlocks"
          :options="siteOptions"
          :date-debut="dateDebut"
          :date-fin="dateFin"
          :modifiable="modifiable"
          :date-debut-error="itineraryDateDebutError"
          :date-fin-error="itineraryDateFinError"
          :site-error="itinerarySiteError"
          @details="onDetails"
          @switched-to-single="onSwitchToSingle"
        />
        <div class="fr-fieldset__element fr-col-12">
          <div class="fr-input-group">
            <DsfrRadioButtonSet
              name="sejourEtranger"
              legend="Séjour à l'étranger"
              :model-value="sejourEtranger"
              :options="ouiNonOptions"
              :readonly="!modifiable"
              :inline="true"
              :error-message="sejourEtrangerError"
              @update:model-value="onSejourEtrangerChange"
            />
          </div>
        </div>
      </template>
    </div>

    <div v-if="modifiable" class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrButton
          secondary
          icon="ri:add-line"
          :label="`Créer un lieu d'hébergement`"
          @click="emit('createSite')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hebergement as hebergementUtils, useToaster } from "@vao/shared-ui";
import type {
  DemandeSejourHebergementItemDto,
  DemandeSejourHebergementDto,
  HebergementDto,
  SiteListeDto,
} from "@vao/shared-bridge";
import { formatISOShort } from "@vao/shared-bridge";
import { resolveSiteId, sortByDateDebut } from "~/utils/dsItineraire";
import { HebergementService } from "~/services/hebergementService";
import type { DSHebergementItinerantBlock } from "./DSHebergementItinerant.vue";
import type { SiteSelectOption } from "./DSHebergementSelect.vue";

interface DSHebergementsSejourModuleProps {
  modifiable?: boolean;
  dateDebut: string;
  dateFin: string;
  initialValue?: Partial<DemandeSejourHebergementDto>;
  singleSiteError?: string;
  itineraryDateDebutError?: (index: number) => string;
  itineraryDateFinError?: (index: number) => string;
  itinerarySiteError?: (index: number) => string;
  sejourEtrangerError?: string;
}

const props = withDefaults(defineProps<DSHebergementsSejourModuleProps>(), {
  modifiable: true,
  initialValue: () => ({}),
  singleSiteError: "",
  itineraryDateDebutError: () => "",
  itineraryDateFinError: () => "",
  itinerarySiteError: () => "",
  sejourEtrangerError: "",
});

const emit = defineEmits<{
  (e: "update", value: DemandeSejourHebergementDto): void;
  (e: "createSite"): void;
}>();

const toaster = useToaster();
const hebergementStore = useHebergementStore();

const ouiNonOptions = [
  { value: true, label: "Oui" },
  { value: false, label: "Non" },
];

const sejourItinerant = ref<boolean>(false);
const sejourEtranger = ref<boolean>(false);
const singleSiteId = ref<string>("");
const itineraryBlocks = ref<DSHebergementItinerantBlock[]>([]);

await hebergementStore.fetchSites({
  statut: hebergementUtils.statut.ACTIF,
  limit: -1,
});

const siteOptions = computed<SiteSelectOption[]>(() =>
  hebergementStore.sites.map((site) => ({
    text: site.nom ?? site.siteId,
    value: site.siteId,
    address: site.adresse,
  })),
);

function init() {
  const initialHebergements = props.initialValue?.hebergements ?? [];
  sejourItinerant.value = props.initialValue?.sejourItinerant ?? false;
  sejourEtranger.value = props.initialValue?.sejourEtranger ?? false;

  if (sejourItinerant.value && initialHebergements.length > 0) {
    const sortedHebergements = sortByDateDebut(initialHebergements);
    itineraryBlocks.value = sortedHebergements.map(
      (item: DemandeSejourHebergementItemDto, index: number) => ({
        id: `${index}`,
        siteId: resolveSiteId(hebergementStore.sites, item.hebergementId),
        dateDebut: formatISOShort(item.dateDebut) ?? "",
        dateFin: formatISOShort(item.dateFin) ?? "",
      }),
    );
  } else if (initialHebergements.length > 0) {
    singleSiteId.value = resolveSiteId(
      hebergementStore.sites,
      initialHebergements[0]!.hebergementId,
    );
  }
}

watch(
  () => props.initialValue,
  () => init(),
  { immediate: true },
);

function onSejourItinerantChange(value: string | number | boolean) {
  sejourItinerant.value = value === true;
  if (sejourItinerant.value && itineraryBlocks.value.length === 0) {
    itineraryBlocks.value = [
      {
        id: `${Date.now()}-0`,
        siteId: singleSiteId.value,
        dateDebut: formatISOShort(props.dateDebut) ?? "",
        dateFin: "",
      },
    ];
  }
}

function onSejourEtrangerChange(value: string | number | boolean) {
  sejourEtranger.value = value === true;
}

function onSingleSiteChange(value: string) {
  singleSiteId.value = value;
}

function onSwitchToSingle() {
  sejourItinerant.value = false;
  if (itineraryBlocks.value.length === 1) {
    singleSiteId.value = itineraryBlocks.value[0]!.siteId;
  }
  emitUpdate();
}

function findSite(siteId: string): SiteListeDto | undefined {
  return hebergementStore.sites.find((site) => site.siteId === siteId);
}

function getHebergementById(id: number): Promise<HebergementDto | null> {
  return HebergementService.getHebergement(id);
}

async function buildHebergementItem(
  siteId: string,
  dateDebut: string,
  dateFin: string,
): Promise<DemandeSejourHebergementItemDto> {
  const site = findSite(siteId);
  if (!site) {
    return {
      hebergementId: 0,
      nom: "",
      dateDebut,
      dateFin,
      coordonnees: {} as DemandeSejourHebergementItemDto["coordonnees"],
      informationsLocaux:
        {} as DemandeSejourHebergementItemDto["informationsLocaux"],
      informationsTransport:
        {} as DemandeSejourHebergementItemDto["informationsTransport"],
    };
  }
  const hebergement = await getHebergementById(site.id);
  if (!hebergement) {
    return {
      hebergementId: site.id,
      nom: site.nom ?? "",
      dateDebut,
      dateFin,
      coordonnees: {} as DemandeSejourHebergementItemDto["coordonnees"],
      informationsLocaux:
        {} as DemandeSejourHebergementItemDto["informationsLocaux"],
      informationsTransport:
        {} as DemandeSejourHebergementItemDto["informationsTransport"],
    };
  }
  return {
    hebergementId: hebergement.id,
    nom: hebergement.nom,
    dateDebut,
    dateFin,
    coordonnees: hebergement.coordonnees,
    informationsLocaux: hebergement.informationsLocaux,
    informationsTransport: hebergement.informationsTransport,
  };
}

async function buildPayload(): Promise<DemandeSejourHebergementDto> {
  const sortedBlocks = [...itineraryBlocks.value].sort((a, b) =>
    a.dateDebut.localeCompare(b.dateDebut),
  );
  const entries = sejourItinerant.value
    ? sortedBlocks.map((block) => ({
        siteId: block.siteId,
        dateDebut: block.dateDebut,
        dateFin: block.dateFin,
      }))
    : singleSiteId.value
      ? [
          {
            siteId: singleSiteId.value,
            dateDebut: props.dateDebut,
            dateFin: props.dateFin,
          },
        ]
      : [];

  const hebergements = await Promise.all(
    entries.map((entry) =>
      buildHebergementItem(entry.siteId, entry.dateDebut, entry.dateFin),
    ),
  );

  return {
    sejourItinerant: sejourItinerant.value,
    sejourEtranger: sejourItinerant.value ? sejourEtranger.value : null,
    hebergements,
  };
}

async function emitUpdate() {
  emit("update", await buildPayload());
}

watch([singleSiteId, sejourItinerant, itineraryBlocks, sejourEtranger], () => {
  emitUpdate();
});

function onDetails() {
  toaster.info({
    titleTag: "h2",
    description:
      "Fiche détaillée de l'hébergement non disponible pour le moment (fonctionnalité prévue).",
    role: "status",
  });
}
</script>
