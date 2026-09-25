<template>
  <form novalidate @submit.prevent="onCheckAddressConfirm">
    <p class="fr-pb-3w fr-col-12">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>
    <div class="fr-fieldset fr-mb-6w">
      <div class="fr-col-12">
        <DsfrAlert
          class="fr-grid-row fr-my-3v"
          type="info"
          :closeable="false"
          title="Vérifiez les informations transmises"
        >
          Les informations saisies dans ce formulaire vous engagent, elles
          doivent être vérifiées auprès de l'hébergeur afin de garantir leur
          fiabilité.
        </DsfrAlert>
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nomSiteOfficiel"
          label="Nom officiel du lieu"
          :label-visible="true"
          placeholder=""
          hint="Saisir le nom officiel tel qu’indiqué par l’hébergeur. Exemple : Gîte des Pins"
          :model-value="nomSiteOfficiel"
          :error-message="nomSiteOfficielErrorMessage"
          :is-valid="nomSiteOfficielMeta.valid"
          :disabled="!props.modifiable"
          @update:model-value="onNomSiteOfficielChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nomSiteOrganisme"
          label="Nom utilisé par votre organisme (optionnel)"
          hint="Exemple : Gîte de mon séjour n°5"
          :label-visible="true"
          placeholder=""
          :model-value="nomSiteOrganisme"
          :error-message="nomSiteOrganismeErrorMessage"
          :is-valid="nomSiteOrganismeMeta.valid"
          :disabled="!props.modifiable"
          @update:model-value="onNomSiteOrganismeChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <AddressSearchAddress
          name="adresse"
          :value="(adresse as unknown as Record<string, unknown>) ?? undefined"
          label="Adresse"
          :free-address-modale="false"
          :initial-adress="initialAdresse"
          :error-message="adresseErrorMessage"
          hint="Exemple : 123 route des oiseaux, 17800 Saint-Mauret"
          :modifiable="props.modifiable"
          @select="onAdresseSelection"
          @manual-address="onManualAddressSelection"
          @update:query="onTypedAddressChange"
        />
      </div>
    </div>
    <div v-if="markers" class="fr-fieldset__element fr-col-12">
      <div style="height: 50vh">
        <MglMap
          :map-style="`https://api.maptiler.com/maps/streets/style.json?key=${config.public.apiMapTiler}`"
          :zoom="zoom"
          :center="markers"
          aria-label="Localisation de l'adresse de l’hébergement"
          role="img"
        >
          <MglNavigationControl />
          <MglMarker :coordinates="markers" />
        </MglMap>
      </div>
      <p v-if="adresse?.label" class="fr-my-2w">
        <span class="fr-text--bold">Localisation de l’adresse :</span>
        {{ adresse?.label }}
      </p>
    </div>
    <div class="site-form-actions fr-mt-2w">
      <NuxtLink
        :to="defaultBackRoute"
        class="fr-btn fr-btn--secondary no-background-image"
      >
        Retour
      </NuxtLink>
      <DsfrButton v-if="props.modifiable" type="submit">
        Confirmer la localisation
      </DsfrButton>
    </div>
  </form>
  <DsfrModal
    name="modal-confirmation-adresse"
    title="Nous ne parvenons pas à localiser l’adresse :"
    :opened="showConfirmationModal"
    :closeable="true"
    @close="onAddressEdit"
  >
    <SearchAddressConfirm
      :address="typedAddress"
      @confirm="onAddressConfirm"
      @edit="onAddressEdit"
    />
  </DsfrModal>
  <DsfrModal
    name="modal-similarite-adresse"
    title="Vérification des informations saisies"
    :opened="showSimilarityModal"
    :closeable="true"
    @close="onReturnToSaisie"
  >
    <SearchAddressSimilarity
      v-if="saisie"
      :saisie="saisie"
      :similarites="similarites"
      @continue="onContinueWithoutModifying"
      @edit="onReturnToSaisie"
    />
  </DsfrModal>
</template>

<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import { DsfrButton, DsfrInputGroup } from "@gouvminint/vue-dsfr";
import {
  HEBERGEMENT_STATUT,
  type AdresseDto,
  type SiteDto,
  type SiteSimilariteResult,
} from "@vao/shared-bridge";
import SearchAddressConfirm from "~/components/address/search-address-confirm.vue";
import SearchAddressSimilarity from "~/components/address/search-address-similarity.vue";
import {
  buildSiteFormValidationSchema,
  requiresAddressConfirmation,
  type SiteFormValidationValues,
} from "./siteFormValidation";

const config = useRuntimeConfig();
const hebergementStore = useHebergementStore();

const zoom = 15;

const props = withDefaults(
  defineProps<{
    initSite?: Partial<SiteFormValidationValues>;
    modifiable?: boolean;
    defaultBackRoute: string;
  }>(),
  {
    initSite: () => ({}),
    modifiable: true,
  },
);

const emit = defineEmits<{
  (e: "submit", site: SiteFormValidationValues): void;
}>();
const initialValues = {
  statut: props.initSite?.statut ?? HEBERGEMENT_STATUT.BROUILLON,
  nomSiteOfficiel: props.initSite?.nomSiteOfficiel ?? "",
  nomSiteOrganisme: props.initSite?.nomSiteOrganisme ?? "",
  adresse: props.initSite?.adresse ?? null,
};
const validationSchema = buildSiteFormValidationSchema(initialValues.statut);

const { meta, handleSubmit } = useForm<SiteFormValidationValues>({
  validationSchema,
  initialValues,
});

const {
  value: nomSiteOfficiel,
  errorMessage: nomSiteOfficielErrorMessage,
  handleChange: onNomSiteOfficielChange,
  meta: nomSiteOfficielMeta,
} = useField<string>("nomSiteOfficiel");
const {
  value: nomSiteOrganisme,
  errorMessage: nomSiteOrganismeErrorMessage,
  handleChange: onNomSiteOrganismeChange,
  meta: nomSiteOrganismeMeta,
} = useField<string>("nomSiteOrganisme");
const {
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAdresseChange,
} = useField<AdresseDto | null>("adresse");

const initialAdresse = computed<string | undefined>(
  () => props.initSite?.adresse?.label ?? undefined,
);
const showConfirmationModal = ref(false);
const typedAddress = ref("");
const requiresManualAddressConfirmation = ref(false);

const similarites = ref<SiteSimilariteResult[]>([]);
const showSimilarityModal = ref(false);
const saisie = ref<{
  nomSiteOfficiel: string;
  adresse: AdresseDto | null;
} | null>(null);
let pendingSubmit: SiteFormValidationValues | null = null;

const hasCoordinates = (value: AdresseDto | null | undefined) =>
  Array.isArray(value?.coordinates) && value.coordinates.length > 0;

function syncTypedAddress(value: AdresseDto | null | undefined) {
  if (value && hasCoordinates(value)) {
    typedAddress.value = value.label ?? typedAddress.value;
  }
}

function onTypedAddressChange(query: string) {
  typedAddress.value = query;
  requiresManualAddressConfirmation.value = false;
  if (adresse.value && !hasCoordinates(adresse.value)) {
    adresse.value = null;
  }
}

function onAdresseSelection(value: AdresseDto | null) {
  onAdresseChange(value);
  syncTypedAddress(value);
}

function onManualAddressSelection(value: AdresseDto | null) {
  requiresManualAddressConfirmation.value = true;
  onAdresseSelection(value);
}

const markers = computed(() => {
  const coordinates = adresse.value?.coordinates;
  return coordinates && coordinates.length > 0 ? coordinates : null;
});

function onCheckAddressConfirm() {
  if (
    adresse.value &&
    !requiresManualAddressConfirmation.value &&
    !requiresAddressConfirmation(adresse.value)
  ) {
    onSubmit();
    return;
  }

  if (adresse.value || typedAddress.value.trim().length > 0) {
    showConfirmationModal.value = true;
    return;
  }

  showConfirmationModal.value = false;
}

function onAddressConfirm() {
  requiresManualAddressConfirmation.value = false;

  showConfirmationModal.value = false;
  onSubmit();
}

function onAddressEdit() {
  showConfirmationModal.value = false;
}

const onSubmit = handleSubmit(async (values) => {
  if (!values.adresse) {
    return;
  }

  const submitValues = { ...values, statut: initialValues.statut };
  pendingSubmit = submitValues;
  saisie.value = {
    nomSiteOfficiel: submitValues.nomSiteOfficiel,
    adresse: submitValues.adresse,
  };

  similarites.value = await hebergementStore.checkSiteSimilarites(
    submitValues as unknown as SiteDto,
  );

  if (similarites.value.length === 0) {
    emit("submit", submitValues);
    pendingSubmit = null;
    return;
  }

  showSimilarityModal.value = true;
});

function onContinueWithoutModifying() {
  showSimilarityModal.value = false;
  if (pendingSubmit) {
    emit("submit", pendingSubmit);
    pendingSubmit = null;
  }
}

function onReturnToSaisie() {
  showSimilarityModal.value = false;
  pendingSubmit = null;
}
</script>

<style scoped>
.site-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
</style>
