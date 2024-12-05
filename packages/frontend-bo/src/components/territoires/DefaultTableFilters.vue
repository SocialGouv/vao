<template>
  <div>
    <div class="fr-fieldset">
      <div :class="filedsetClass">
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="textSync"
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
  text: string;
}>();

const emits = defineEmits<{
  "update:text": [string];
  "filters-update": [];
}>();

const filedsetClass =
  "fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2";

const textSync = computed({
  get() {
    return props.text;
  },
  set(value) {
    emits("update:text", value);
  },
});

const filtersUpdate = () => emits("filters-update");
</script>
