<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="typeOperateur"
            legend="Type de personne qui organise des séjours"
            :required="true"
            :model-value="typeOperateur"
            :options="organisme.types"
            :is-valid="typeOperateurMeta"
            :inline="false"
            :error-message="typeOperateurErrorMessage"
            @update:model-value="onTypeOperateurChange"
          />
        </div>
      </div>
    </fieldset>
    <div v-if="typeOperateur === 'personne_morale'">
      <OperateurPersonneMorale
        :init-data="initData.personneMorale ?? {}"
        @next="next"
        @update="update"
      ></OperateurPersonneMorale>
    </div>
    <div v-if="typeOperateur === 'personne_physique'">
      <OperateurPersonnePhysique
        :init-data="initData.personnePhysique ?? {}"
        @next="next"
        @update="update"
      ></OperateurPersonnePhysique>
    </div>
  </div>
</template>

<script setup>
import { useField } from "vee-validate";

const emit = defineEmits(["next", "update"]);
const props = defineProps({
  initData: { type: Object, required: true },
});

const {
  value: typeOperateur,
  errorMessage: typeOperateurErrorMessage,
  handleChange: onTypeOperateurChange,
  meta: typeOperateurMeta,
} = useField("typeOperateur", null, {
  initialValue: props.initData.typeOperateur,
});

function update(data, type) {
  emit("update", data, type);
}
function next() {
  emit("next");
}
</script>

<style lang="scss" scoped></style>
