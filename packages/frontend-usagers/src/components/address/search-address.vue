<script setup lang="ts">
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import {
  MultiSelectOption,
  ApiUnavailable,
  apiModel,
  useToaster,
} from "@vao/shared-ui";
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

type AddressOption = {
  label: string;
  cleInsee?: string;
  codeInsee?: string;
  codePostal?: string;
  coordinates?: number[];
  departement?: string;
};

const options = ref<AddressOption[]>([]);
const isLoading = ref(false);

const isModalOpen = ref(false);
const multiselectRef = ref<Multiselect | null>(null);

const canShowClear = ref(false);

const message = computed(() => props.errorMessage || props.validMessage);
const messageClass = computed(() =>
  props.errorMessage ? "fr-error-text" : "fr-valid-text",
);

async function searchAddress(queryString: string) {
  if (queryString.length > NB_CAR_ADDRESSE_MIN && isLoading.value === false) {
    await searchAddressDebounced(queryString);
    canShowClear.value = true;
  }
  if (multiselectRef.value?.input.value.length === 0) {
    canShowClear.value = false;
  }
}

const searchAddressDebounced = debounce(async function (queryString: string) {
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
    options.value = adresses.map(
      (address: {
        properties: {
          label: string;
          id: string;
          citycode: string;
          postcode: string;
          context: string;
        };
        geometry: { coordinates: number[] };
      }) => {
        return {
          label: address.properties.label,
          cleInsee: address.properties.id,
          codeInsee: address.properties.citycode,
          codePostal: address.properties.postcode,
          coordinates: address.geometry.coordinates,
          departement: address.properties.context.split(",")[0],
        };
      },
    );
    isLoading.value = false;
    log.d("searchAddress - DONE", { adresses });
  } catch (error) {
    log.w("searchAddress", error);
    isLoading.value = false;
    toaster.error({
      titleTag: "h2",
      description: "erreur lors de l'appel à l'API adresse",
      role: "alert",
    });
  }
  log.d("searchAddressDebounced - DONE", { queryString });
}, 500);

function select(_value: string | null, option: AddressOption) {
  log.i("select", option);
  emits("select", option);
  canShowClear.value = true;
}

function onManualChooseAddress(adresse: AddressOption) {
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
              <template #noresults> Pas de résultat</template>
              <template #afterlist>
                <div class="fr-multiselect-adress--free">
                  <span>Vous ne trouvez pas votre adresse ?</span>
                  <DsfrButton
                    label="Saisir une adresse libre"
                    type="bouton"
                    icon="fr-icon-edit-line"
                    always-visible
                    secondary
                    @click="isModalOpen = true"
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
.fr-multiselect-adress {
  position: relative;
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
</style>
