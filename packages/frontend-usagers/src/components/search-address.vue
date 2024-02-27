<script setup>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";

const log = logger("components/search-address");

const props = defineProps({
  value: { type: Object, default: null },
  label: { type: String, required: true },
});

const emits = defineEmits(["select"]);

const NB_CAR_ADDRESSE_MIN = 6;

const options = ref([]);
const isLoading = ref(false);
const adresseInitiale = props.value?.label;

async function searchAddress(queryString) {
  if (queryString.length > NB_CAR_ADDRESSE_MIN && isLoading.value === false) {
    await searchAddressDebounced(queryString);
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
    toaster.error("erreur lors de l'appel à l'API adresse");
  }
  log.d("searchAddressDebounced - DONE", { queryString });
}, 500);

function select(_value, option) {
  log.i("select", unref(option));
  emits("select", unref(option));
}
</script>

<template>
  <div>
    <fieldset class="fr-fieldset">
      <div v-if="adresseInitiale" class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrInputGroup
            name="adresseSauvegardée"
            label="Adresse enregistrée"
            :label-visible="true"
            :model-value="adresseInitiale"
            :disabled="true"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <label>{{ props.label }}</label>
          <Multiselect
            :value="props.value?.label"
            value-prop="label"
            track-by="label"
            mode="single"
            :close-on-select="true"
            :searchable="true"
            :internal-search="true"
            :loading="isLoading"
            :options="options"
            autocomplete="off"
            :filter-results="false"
            @search-change="searchAddress"
            @select="select"
          />
        </div>
      </div>
    </fieldset>
  </div>
</template>

<style lang="scss" scoped></style>
