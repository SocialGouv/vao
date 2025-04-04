<template>
  <div class="fr-fieldset">
    <div
      class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
    >
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="searchSync"
          type="text"
          name="libelle"
          label="Recherche"
          placeholder="Recherche"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div
      v-if="isExportAvailable"
      class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2 extract"
    >
      <DsfrButton
        type="button"
        label="Extraire en CSV"
        primary
        @click="emits('get-csv')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  search: string;
  isExportAvailable: boolean;
}>();

const emits = defineEmits<{
  "update:search": [string];
  "get-csv": [];
  "filters-update": [];
}>();

const searchSync = computed({
  get() {
    return props.search;
  },
  set(value) {
    emits("update:search", value);
  },
});

const filtersUpdate = () => emits("filters-update");
</script>

<style scoped>
.extract {
  margin-top: auto;
}
</style>
