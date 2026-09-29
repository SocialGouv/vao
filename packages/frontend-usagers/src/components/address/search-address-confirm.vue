<template>
  <div class="fr-p-4w fr-background-alt--blue-france">
    <p class="fr-text--lead fr-mb-2w">
      Nous ne parvenons pas à localiser cette adresse
    </p>

    <p class="fr-mb-1w">{{ props.address }}</p>
    <p class="fr-text--bold fr-mb-3w">Est-elle correcte ?</p>

    <div class="fr-btns-group fr-btns-group--inline-md">
      <DsfrButton
        type="button"
        label="Confirmer mon adresse"
        secondary
        @click="onConfirm"
      />
      <DsfrButton
        type="button"
        label="Modifier mon adresse"
        primary
        @click="onEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  address: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["confirm", "edit"]);

function onConfirm() {
  emit("confirm");
}

function onEdit() {
  emit("edit");
}
</script>
