<template>
  <DsfrModal
    :ref="modalRef"
    :name="name"
    :opened="opened"
    :title="title"
    @close="onClose"
  >
    <article class="fr-mb-4v">
      <slot />
    </article>
    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton
            id="previous-step"
            :secondary="true"
            @click.prevent="onClose"
            >Retour
          </DsfrButton>
        </div>
      </div>
      <div class="fr-col-8">
        <div class="fr-input-group">
          <DsfrButton id="next-step" @click.prevent="onValidate"
            >Valider la prise en charge
          </DsfrButton>
        </div>
      </div>
    </fieldset>
  </DsfrModal>
</template>

<script setup>
defineProps({
  modalRef: { type: String, required: true },
  name: { type: String, required: true },
  opened: { type: Boolean, default: false },
  title: { type: String, required: true },
  onClose: {
    type: Function,
    default: () => {},
  },
  onValidate: {
    type: Function,
    default: () => {},
  },
});
</script>

<style scoped></style>
