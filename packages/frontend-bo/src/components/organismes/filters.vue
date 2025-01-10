<template>
  <div class="fr-fieldset">
    <div :class="filedsetClass + 'fr-col-md-4 fr-col-lg-4'">
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="nameSync"
          type="text"
          name="name"
          label="Nom"
          placeholder="Nom"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass + 'fr-col-md-2 fr-col-lg-2'">
      <div class="fr-input-group">
        <DsfrInputGroup
          v-model="siretSync"
          type="text"
          name="name"
          label="Siret"
          placeholder="Siret"
          :label-visible="true"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass + 'fr-col-md-2 fr-col-lg-2'">
      <div class="fr-input-group">
        <DsfrSelect
          v-model="yearObtentionSync"
          label="Date d’obtention de l’agrément"
          name="dateAgrément"
          mode="tags"
          :options="years"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass + 'fr-col-md-2 fr-col-lg-2'">
      <div class="fr-input-group">
        <DsfrSelect
          v-model="regionObtentionSync"
          label="Région d’obtention de l’agrément"
          name="regionObtention"
          mode="tags"
          :options="regions"
          @update:model-value="filtersUpdate"
        />
      </div>
    </div>
    <div :class="filedsetClass + 'fr-col-md-2 fr-col-lg-2'">
      <ul class="fr-btns-group">
        <li>
          <DsfrButton
            type="button"
            label="Extraire en CSV"
            primary
            @click="getCsv"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const regionStore = useRegionStore();
const organismeStore = useOrganismeStore();

const props = defineProps<{
  siret: string;
  name: string;
  regionObtention: string;
  yearObtention: string;
}>();

const emits = defineEmits<{
  "update:siret": [string];
  "update:name": [string];
  "update:regionObtention": [string];
  "update:yearObtention": [string];
  "filters-update": [];
}>();

const filedsetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 ";

const siretSync = computed({
  get() {
    return props.siret;
  },
  set(value) {
    emits("update:siret", value);
  },
});
const nameSync = computed({
  get() {
    return props.name;
  },
  set(value) {
    emits("update:name", value);
  },
});
const regionObtentionSync = computed({
  get() {
    return props.regionObtention;
  },
  set(value) {
    emits("update:regionObtention", value);
  },
});
const yearObtentionSync = computed({
  get() {
    return props.yearObtention;
  },
  set(value) {
    emits("update:yearObtention", value);
  },
});

const getLast20Years = () => {
  const currentYear = new Date().getFullYear();
  const years = Array(20)
    .fill(currentYear)
    .map((y, index) => ({ value: `${y - index}`, text: `${y - index}` }));
  years.unshift({ value: "", text: "Toutes les années" });

  return years;
};

const years = getLast20Years();
const regions = computed(() => [
  { text: "Toutes", value: "" },
  ...regionStore.regions,
]);
regionStore.fetch();

const filtersUpdate = () => emits("filters-update");
const getCsv = async () => {
  const response = await organismeStore.exportOrganismes();
  exportCsv(response, "organismes.csv");
};
</script>
