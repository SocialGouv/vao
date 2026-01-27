<script setup>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import { MultiSelectOption, ApiUnavailable, apiModel } from "@vao/shared-ui";
import { ref } from "vue";
const apiTypes = apiModel.apiTypes;

const useExternalApi = useExternalApiStore();

await useExternalApi.checkApiAdresse();

const toaster = useToaster();

const log = logger("components/search-address");

const props = defineProps({
  label: { type: String, required: true },
  initialAdress: { type: String, default: null },
  value: { type: Object, default: null },
  errorMessage: { type: String, default: null },
  validMessage: { type: String, default: null },
  modifiable: { type: Boolean, default: true },
});

const emits = defineEmits(["select"]);

const NB_CAR_ADDRESSE_MIN = 5;

const options = ref([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const multiselectRef = ref(null);

const canShowClear = ref(false);

const message = computed(() => props.errorMessage || props.validMessage);
const messageClass = computed(() =>
  props.errorMessage ? "fr-error-text" : "fr-valid-text",
);

function clearSelection() {
  multiselectRef.value?.clear();
  nextTick(() => {
    multiselectRef.value?.input?.focus();
  });
}

async function searchAddress(queryString) {
  if (queryString.length > NB_CAR_ADDRESSE_MIN && isLoading.value === false) {
    await searchAddressDebounced(queryString);
    canShowClear.value = true;
  }
  if (multiselectRef.value?.input.value.length === 0) {
    canShowClear.value = false;
  }
}

const searchAddressDebounced = debounce(async function (queryString) {
  log.d("searchAddressDebounced - IN", { queryString });
  try {
    isLoading.value = true;
    options.value = [];
    const url = "/geo/adresse/";
    const { adresses } = await $fetchBackend(url, {
      body: { queryString },
      method: "POST",
      credentials: "include",
    });
    log.d("searchAddress", { adresses });
    options.value = adresses.map((address) => {
      return {
        label: address.properties.label,
        cleInsee: address.properties.id,
        codeInsee: address.properties.citycode,
        codePostal: address.properties.postcode,
        coordinates: address.geometry.coordinates,
        departement: address.properties.context.split(",")[0],
      };
    });
    isLoading.value = false;
    log.d("searchAddress - DONE", { adresses });
  } catch (error) {
    log.w("searchAddress", error);
    isLoading.value = false;
    toaster.error({
      titleTag: "h2",
      description: "erreur lors de l'appel à l'API adresse",
    });
  }
  log.d("searchAddressDebounced - DONE", { queryString });
}, 500);

function select(_value, option) {
  log.i("select", unref(option));
  emits("select", unref(option));
  canShowClear.value = true;
}

function onManualChooseAddress(adresse) {
  options.value = [{ ...adresse }];
  onCloseModal();
  select(null, adresse);
}

function onCloseModal() {
  isModalOpen.value = false;
}
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
        ></ApiUnavailable>
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
          </label>
          <div class="fr-multiselect-adress">
            <Multiselect
              ref="multiselectRef"
              :value="props.value?.label"
              value-prop="label"
              track-by="label"
              mode="single"
              :close-on-select="true"
              :searchable="true"
              :internal-search="true"
              :loading="isLoading"
              no-options-text="Rechercher une adresse"
              :options="options"
              autocomplete="off"
              :can-clear="true"
              :filter-results="false"
              @search-change="searchAddress"
              @select="select"
              @clear="() => (canShowClear = false)"
            >
              <template #option="{ option, isPointed }">
                <MultiSelectOption
                  :label="option.label"
                  :is-pointed="isPointed(option)"
                />
              </template>
              <template #no-result> Pas de résultat</template>
            </Multiselect>
            <button
              v-if="canShowClear"
              class="btn-multiselect-clear"
              aria-label="Supprimer l’adresse"
              @click="clearSelection"
              @keydown.enter.prevent="clearSelection"
              @keydown.space.prevent="clearSelection"
            >
              <span aria-hidden="true" class="fr-icon-close-line"></span>
            </button>
            <span v-else aria-hidden="true"></span>
          </div>
          <div class="container">
            <DsfrButton type="button" size="sm" @click="isModalOpen = true"
              >Adresse introuvable
            </DsfrButton>
          </div>

          <div v-if="message" class="fr-messages-group">
            <p :class="messageClass">
              <span>{{ message }}</span>
            </p>
          </div>
        </div>
      </div>
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
        />
      </DsfrModal>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1rem;
  width: 100%;
}
.fr-multiselect-adress {
  position: relative;
}
.btn-multiselect-clear {
  position: absolute;
  display: block;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
}
</style>
