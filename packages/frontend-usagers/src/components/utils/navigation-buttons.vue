<template>
  <fieldset v-if="props.showButtons" class="fr-fieldset">
    <DsfrButtonGroup
      v-if="!props.isDownloading"
      :inline-layout-when="true"
      :reverse="true"
    >
      <DsfrButton
        id="previous-step"
        :secondary="true"
        @click.prevent="
          () => {
            emit('previous');
          }
        "
        >Précédent
      </DsfrButton>
      <DsfrButton
        id="next-step"
        :disabled="props.disabled"
        @click.prevent="emit('next')"
        >Suivant
      </DsfrButton>
    </DsfrButtonGroup>
    <is-downloading
      :message="props.message"
      :is-downloading="props.isDownloading"
    />
  </fieldset>
</template>

<script setup>
import { IsDownloading } from "@vao/shared";

const emit = defineEmits(["previous", "next"]);

const props = defineProps({
  disabled: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});
</script>

<style scoped lang="scss"></style>
