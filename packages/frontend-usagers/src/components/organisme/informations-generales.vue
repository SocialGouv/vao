<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <DsfrRadioButtonSet
            name="typeOrganisme"
            legend="Type de personne qui organise des séjours"
            :model-value="typeOrganisme"
            :options="organisme.types"
            :is-valid="typeOrganismeMeta"
            :inline="false"
            :error-message="typeOrganismeErrorMessage"
            @update:model-value="onTypeOrganismeChange"
          />
        </div>
      </div>
    </fieldset>
    <div v-if="typeOrganisme === 'personne_morale'">
      <OrganismePersonneMorale
        :init-data="initData.personneMorale ?? {}"
        :is-downloading="props.isDownloading"
        :message="props.message"
        @next="next"
        @update="update"
      ></OrganismePersonneMorale>
    </div>
    <div v-if="typeOrganisme === 'personne_physique'">
      <OrganismePersonnePhysique
        :init-data="initData.personnePhysique ?? {}"
        :is-downloading="props.isDownloading"
        :message="props.message"
        @next="next"
        @update="update"
      ></OrganismePersonnePhysique>
    </div>
  </div>
</template>

<script setup>
import { useField } from "vee-validate";

const emit = defineEmits(["next", "update"]);
const props = defineProps({
  initData: { type: Object, required: true },
  showButtons: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const {
  value: typeOrganisme,
  errorMessage: typeOrganismeErrorMessage,
  handleChange: onTypeOrganismeChange,
  meta: typeOrganismeMeta,
} = useField("typeOrganisme", null, {
  initialValue: props.initData.typeOrganisme,
});

function update(data, type) {
  emit("update", data, type);
}

function next() {
  emit("next");
}
</script>

<style lang="scss" scoped></style>
