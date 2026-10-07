<template>
  <div>
    <p class="fr-mb-2w">
      Le <strong>type d’hébergement</strong> que vous avez renseigné est
      différent de celui renseigné par un autre organisme pour ce même lieu.
    </p>
    <p class="fr-mb-2w">
      Votre saisie :
      <strong>{{ getHebergementTypeLabel(saisieType) }}</strong>
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
import { computed } from "vue";
import { DsfrButton } from "@gouvminint/vue-dsfr";
import { hebergement } from "@vao/shared-ui";

defineProps<{
  saisieType: string;
  declareType: string;
}>();

const typeLabelByValue = computed(
  () =>
    new Map(
      hebergement.typeOptions.map((option) => [option.value, option.label]),
    ),
);

const getHebergementTypeLabel = (value: string | null | undefined) =>
  value ? (typeLabelByValue.value.get(value) ?? value) : "";

const emit = defineEmits<{
  (e: "continue" | "edit"): void;
}>();
</script>
