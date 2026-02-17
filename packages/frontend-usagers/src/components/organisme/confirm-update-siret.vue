<template>
  <DsfrModal :opened="opened" title="Mettre à jour le SIRET" @close="onCancel">
    <p class="fr-mb-4w">
      Le siret de l'organisme va être mis à jour : <br />
      - Ancien SIRET : {{ props.ancienSiret }} <br />
      - Nouveau SIRET : {{ props.nouveauSiret }}
    </p>

    <div class="fr-btns-group fr-btns-group--inline fr-btns-group--center">
      <button class="fr-btn" @click="onConfirm">
        Confirmer la mise à jour du SIRET
      </button>

      <button class="fr-btn fr-btn--secondary" @click="onCancel">
        Annuler
      </button>
    </div>
  </DsfrModal>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { DsfrModal } from "@gouvminint/vue-dsfr";

const props = defineProps({
  opened: { type: Boolean, default: false },
  nouveauSiret: { type: String, required: true },
  ancienSiret: { type: String, required: true },
});

const emit = defineEmits(["confirm", "close"]);

function onConfirm() {
  emit("confirm");
}

function onCancel() {
  emit("close");
}
</script>
