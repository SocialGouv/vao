<template>
  <div>
    <div class="fr-fieldset">
      <div :class="filedsetClass">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="labelSync"
            type="text"
            name="Libellé"
            label="Libellé du territoire"
            placeholder="Libellé du territoire"
            :label-visible="true"
            @update:model-value="filtersUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  label: string;
}>();

const emits = defineEmits<{
  "update:label": [string];
  "filters-update": [];
}>();

const filedsetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2";

const labelSync = computed({
  get() {
    return props.label;
  },
  set(value) {
    emits("update:label", value);
  },
});

const filtersUpdate = () => emits("filters-update");
</script>
