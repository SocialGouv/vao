<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import {
  MultiSelectOption,
  ApiUnavailable,
  apiModel,
  useToaster,
} from "@vao/shared-ui";
import { ref, onMounted, onUnmounted, watch } from "vue";

const apiTypes = apiModel.apiTypes;

const useExternalApi = useExternalApiStore();

await useExternalApi.checkApiAdresse();

const toaster = useToaster();

const log = logger("components/search-address");

const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, required: false, default: null },
  initialAdress: { type: String, default: null },
  value: { type: Object, default: null },
  errorMessage: { type: String, default: null },
  validMessage: { type: String, default: null },
  modifiable: { type: Boolean, default: true },
  freeAddressModale: { type: Boolean, default: true },
});

const emits = defineEmits([
  "select",
  "clear",
  "update:query",
  "manual-address",
]);

const NB_CAR_ADDRESSE_MIN = 5;

type AddressOption = {
  id: string;
  label: string;
  cleInsee?: string;
  codeInsee?: string;
  codePostal?: string;
  coordinates?: number[];
  departement?: string;
};

type AddressApiDto = {
  properties: {
    label: string;
    id: string;
    citycode: string;
    postcode: string;
    context: string;
  };
  geometry: {
    coordinates: number[];
  };
};

function toAddressOption(address: AddressApiDto): AddressOption {
  return {
    id: address.properties.id,
    label: address.properties.label,
    cleInsee: address.properties.id,
    codeInsee: address.properties.citycode,
    codePostal: address.properties.postcode,
    coordinates: address.geometry.coordinates,
    departement: address.properties.context.split(",")[0],
  };
}

const options = ref<AddressOption[]>([]);
const isLoading = ref(false);
const searchQuery = ref("");

const isModalOpen = ref(false);
const multiselectRef = ref<Multiselect | null>(null);
const multiselectWrapperRef = ref<HTMLElement | null>(null);

const canShowClear = ref(false);
const isPublishingSelection = ref(false);

const message = computed(() => props.errorMessage || props.validMessage);

const messageClass = computed(() =>
  props.errorMessage ? "fr-error-text" : "fr-valid-text",
);

const selectedLabel = computed(() => props.value?.label ?? undefined);

function setPointerAtIndex(index: number) {
  const option = options.value[index];
  if (option) {
    multiselectRef.value?.setPointer(option);
  }
}

let searchId = 0;

let abortController: AbortController | null = null;

function resetSearch() {
  searchId++;
  abortController?.abort();
  abortController = null;
  searchQuery.value = "";
  options.value = [];
  canShowClear.value = false;
  isLoading.value = false;
}

function isRequestUpToDate(
  queryString: string,
  currentSearchId: number,
): boolean {
  return currentSearchId === searchId && searchQuery.value === queryString;
}

function searchAddress(queryString: string) {
  if (isPublishingSelection.value) {
    return;
  }

  searchQuery.value = queryString;
  emits("update:query", queryString);

  if (queryString.length === 0 || queryString.length <= NB_CAR_ADDRESSE_MIN) {
    resetSearch();
    return;
  }

  canShowClear.value = true;
  searchAddressDebounced(queryString);
}
const searchAddressDebounced = debounce(async function (queryString: string) {
  const currentSearchId = ++searchId;
  log.d("searchAddressDebounced - IN", {
    queryString,
    searchId: currentSearchId,
  });
  abortController?.abort();
  const controller = new AbortController();
  abortController = controller;

  try {
    isLoading.value = true;
    options.value = [];
    const { adresses } = await $fetchBackend("/geo/adresse/", {
      body: { queryString },
      method: "POST",
      credentials: "include",
      signal: controller.signal,
    });

    if (!isRequestUpToDate(queryString, currentSearchId)) {
      log.d("Recherche ignorée car obsolète", {
        queryString,
        currentSearchId,
        searchId,
      });

      return;
    }

    options.value = adresses.map((address: AddressApiDto) =>
      toAddressOption(address),
    );

    log.d("searchAddress - DONE", {
      adresses,
      queryString,
      searchId: currentSearchId,
    });
  } catch (error) {
    if (
      controller.signal.aborted ||
      !isRequestUpToDate(queryString, currentSearchId)
    ) {
      log.d("Recherche annulée", {
        queryString,
        searchId: currentSearchId,
      });

      return;
    }

    log.w("searchAddress", error);
    toaster.error({
      titleTag: "h2",
      description: "erreur lors de l'appel à l'API adresse",
      role: "alert",
    });
  } finally {
    if (currentSearchId === searchId) {
      isLoading.value = false;
    }

    if (abortController === controller) {
      abortController = null;
    }

    log.d("searchAddressDebounced - DONE", {
      queryString,
      searchId: currentSearchId,
    });
  }
}, 500);

function select(_value: string | null, option: AddressOption) {
  log.i("select", option);
  emits("select", option);
  canShowClear.value = true;
  applyEditableLabel(option.label);
}

function applyEditableLabel(label: string) {
  isPublishingSelection.value = true;
  multiselectRef.value?.update(null);
  if (multiselectRef.value) {
    multiselectRef.value.search = label;
  }
  requestAnimationFrame(() => {
    multiselectRef.value?.close();
    isPublishingSelection.value = false;
  });
}

function onClear() {
  log.d("onClear");
  resetSearch();
  emits("update:query", "");
  if (multiselectRef.value) {
    isPublishingSelection.value = true;
    multiselectRef.value.search = "";
    requestAnimationFrame(() => {
      isPublishingSelection.value = false;
    });
  }
  emits("clear");
}

function onManualChooseAddress(adresse: AddressOption) {
  options.value = [{ ...adresse }];
  onCloseModal();
  emits("manual-address", adresse);
  select(null, adresse);
}

function onCloseModal() {
  isModalOpen.value = false;
}

function openFreeAddressModal() {
  isModalOpen.value = true;
  multiselectRef.value?.deactivate();
}

function focusOption(el: HTMLElement) {
  el.tabIndex = 0;
  el.focus();
  const index = Array.from(el.parentElement?.children ?? []).indexOf(el);
  if (index >= 0) {
    setPointerAtIndex(index);
  }
}

function onListKeydown(event: KeyboardEvent) {
  if (event.key !== "Tab" || options.value.length === 0) {
    return;
  }

  const focused = document.activeElement as HTMLElement | null;
  if (!focused) {
    return;
  }

  const optionEls = Array.from(
    multiselectWrapperRef.value?.querySelectorAll<HTMLElement>(
      ".multiselect-option",
    ) ?? [],
  );

  const isInput = focused === multiselectRef.value?.input;
  const isOption = focused.classList.contains("multiselect-option");

  if (!isInput && !isOption) {
    return;
  }

  if (isInput) {
    focusFirstOption(event, optionEls);
    return;
  }

  const index = optionEls.indexOf(focused);

  if (event.shiftKey) {
    focusPreviousOption(event, optionEls, index);
    return;
  }

  focusNextOption(event, optionEls, index);
}

function focusFirstOption(event: KeyboardEvent, optionEls: HTMLElement[]) {
  const first = optionEls[0];

  if (!first) {
    return;
  }

  event.preventDefault();
  focusOption(first);
}

function focusPreviousOption(
  event: KeyboardEvent,
  optionEls: HTMLElement[],
  index: number,
) {
  if (index === 0) {
    event.preventDefault();
    multiselectRef.value?.focus();
    return;
  }

  const previous = optionEls[index - 1];

  if (!previous) {
    return;
  }

  event.preventDefault();
  focusOption(previous);
}

function focusNextOption(
  event: KeyboardEvent,
  optionEls: HTMLElement[],
  index: number,
) {
  const lastIndex = optionEls.length - 1;

  if (index < lastIndex) {
    const next = optionEls[index + 1];

    if (next) {
      event.preventDefault();
      focusOption(next);
    }

    return;
  }

  if (index === lastIndex) {
    event.preventDefault();
    document.getElementById("btn-saisir-adresse-libre")?.focus();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onListKeydown);
  if (props.value?.label) {
    applyEditableLabel(props.value.label);
  }
});

watch(
  () => props.value?.label,
  (label) => {
    if (label) {
      applyEditableLabel(label);
    }
  },
);

onUnmounted(() => {
  document.removeEventListener("keydown", onListKeydown);
});
</script>

<template>
  <div class="fr-fieldset">
    <div v-if="initialAdress" class="fr-fieldset__element">
      <div class="fr-input-group fr-col-12">
        <DsfrInputGroup
          name="adresseSauvegardée"
          label="Adresse enregistrée"
          :label-visible="true"
          :model-value="initialAdress"
          :read-only="true"
          :disabled="!props.modifiable"
        />
      </div>
    </div>
    <div v-if="props.modifiable" class="fr-fieldset__element">
      <div class="fr-fieldset__element fr-col-12">
        <ApiUnavailable
          :api-unavailable-types="useExternalApi.apisUnavailable"
          :display-types="[apiTypes.ADRESSE]"
        />
      </div>

      <div class="fr-input-group fr-col-12">
        <div
          class="fr-input-group"
          :class="{
            'fr-input-group--error': errorMessage,
            'fr-input-group--valid': validMessage,
          }"
        >
          <label class="fr-label">
            {{ label }}
            <span v-if="hint" class="fr-hint-text">
              {{ hint }}
            </span>
          </label>
          <div ref="multiselectWrapperRef" class="fr-multiselect-adress">
            <Multiselect
              ref="multiselectRef"
              :value="selectedLabel"
              value-prop="label"
              track-by="label"
              mode="single"
              :close-on-select="true"
              :clear-on-blur="false"
              :searchable="true"
              :internal-search="true"
              :loading="isLoading"
              no-options-text="Rechercher une adresse"
              :options="options"
              autocomplete="off"
              :can-clear="canShowClear"
              :filter-results="false"
              @search-change="searchAddress"
              @select="select"
              @clear="onClear"
            >
              <template #option="{ option, isPointed }">
                <MultiSelectOption
                  :label="option.label"
                  :is-pointed="isPointed(option)"
                />
              </template>
              <template #nooptions>
                <span v-if="searchQuery.length > NB_CAR_ADDRESSE_MIN">
                  Pas de résultat
                </span>
                <span v-else>
                  Rechercher une adresse (saisissez au moins
                  {{ NB_CAR_ADDRESSE_MIN }} caractères)
                </span>
              </template>
              <template #noresults> Pas de résultat </template>
              <template #afterlist>
                <div class="fr-multiselect-adress--free">
                  <span>Vous ne trouvez pas votre adresse ?</span>
                  <DsfrButton
                    id="btn-saisir-adresse-libre"
                    label="Saisir une adresse libre"
                    type="button"
                    icon="fr-icon-edit-line"
                    always-visible
                    secondary
                    @click="openFreeAddressModal"
                  />
                </div>
              </template>
            </Multiselect>
          </div>
          <div v-if="message" class="fr-messages-group">
            <p :class="messageClass">
              <span>{{ message }}</span>
            </p>
          </div>
        </div>
      </div>
      <div v-if="!props.freeAddressModale">
        <div v-if="isModalOpen">
          <fieldset>
            <legend>
              <span class="fr-text--lg fr-text--bold"
                >Saisir une adresse libre</span
              >
              <span class="fr-text--sm">
                Vérifiez l'exactitude avec l'hébergeur
              </span>
            </legend>

            <AddressSearchAddressMunicipality
              :label-voie="`Numéro et libellé  de la voie`"
              :hint-voie="`Exemple : 123 route des oiseaux`"
              :label-cp="`Code postal et ville`"
              :hint-cp="`Exemple : 17800 Saint-Mauret`"
              @choose-manual-address="onManualChooseAddress"
              @close="onCloseModal"
            />
          </fieldset>
        </div>
      </div>
      <div v-else class="fr-multiselect-adress--free">
        <DsfrModal
          ref="modal-search-address-municipality"
          name="modal-search-address-municipality"
          :opened="isModalOpen"
          title="Ajouter une adresse"
          size="md"
          @close="onCloseModal"
        >
          <AddressSearchAddressMunicipality
            @choose-manual-address="onManualChooseAddress"
            @close="onCloseModal"
          />
        </DsfrModal>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fr-multiselect-adress {
  position: relative;
}
.address-municipality {
  padding: 1rem;
  border: 1px solid var(--border-default-grey, #ddd);
}
.fr-multiselect-adress--free {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--background-contrast-grey, #fff);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
}
.fr-multiselect-adress--free .fr-btn {
  width: auto;
  flex: 0 0 auto;
}
.fr-multiselect-adress--pointer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}
.fr-multiselect-adress--pointer input {
  width: 4rem;
  padding: 0.25rem 0.5rem;
}
.btn-multiselect-clear {
  position: absolute;
  display: block;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
}
.fr-multiselect-adress :deep(.multiselect-dropdown) {
  max-height: 500px !important;
}

.fr-multiselect-adress :deep(.multiselect-options) {
  max-height: none !important;
  overflow-y: visible !important;
}

.fr-multiselect-adress :deep(.multiselect-option) {
  padding: 0.75rem 1rem;
}

.fr-multiselect-adress :deep(.multiselect-option.is-pointed) {
  background-color: var(--background-contrast-blue-france, #f5f5fe);
  box-shadow: inset 0.25rem 0 0 0 var(--artwork-major-blue-france, #000091);
  outline: none;
}
</style>
