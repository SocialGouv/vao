<template>
  <div>
    <p class="fr-mb-2w">
      Le <strong>type d’hébergement</strong> que vous avez renseigné est
      différent de celui renseigné par un autre organisme pour ce même lieu.
    </p>
    <p class="fr-mb-2w">
      Votre saisie :
      <strong>{{ getHebergementTypeLabel(saisieType) || "—" }}</strong>
    </p>
    <p>
      Saisie similaire :
      <strong>{{ getHebergementTypeLabel(declareType) }}</strong>
    </p>
    <div class="fr-btns-group fr-btns-group--inline-md fr-btns-group--right">
      <DsfrButton
        type="button"
        label="Retourner à la saisie"
        secondary
        @click="emit('edit')"
      />
      <DsfrButton
        type="button"
        label="Continuer sans modifier"
        primary
        @click="emit('continue')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DsfrButton } from "@gouvminint/vue-dsfr";
import { getHebergementTypeLabel } from "~/utils/hebergementType";

defineProps<{
  saisieType: string;
  declareType: string;
}>();

const emit = defineEmits<{
  (e: "continue" | "edit"): void;
}>();
</script>
