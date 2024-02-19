<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Renseignements généraux :</span>
          <DsfrBadge
            :label="renseignementsGeneraux.label"
            :small="true"
            :type="renseignementsGeneraux.type"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Agrément :</span>
          <DsfrBadge
            :label="agrement.label"
            :small="true"
            :type="agrement.type"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Protocole transport :</span>
          <DsfrBadge
            :label="protocoleTransport.label"
            :small="true"
            :type="protocoleTransport.type"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Protocole sanitaire :</span>
          <DsfrBadge
            :label="protocoleSanitaire.label"
            :small="true"
            :type="protocoleSanitaire.type"
          />
        </div>
      </div>
    </fieldset>
    <div class="fr-fieldset__element">
      <div class="fr-input-group fr-col-12">
        <DsfrButton
          label="Finaliser la fiche opérateur"
          :disabled="
            renseignementsGeneraux.type === 'warning' ||
            protocoleSanitaire.type === 'warning' ||
            protocoleTransport.type === 'warning' ||
            agrement.type === 'warning'
          "
          @click="finalizeOrganisme"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const log = logger("components/operateur/synthese");

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

const renseignementsGeneraux = ref({
  label: "",
  type: "",
});
const agrement = ref({
  label: "",
  type: "",
});
const protocoleTransport = ref({
  label: "",
  type: "",
});
const protocoleSanitaire = ref({
  label: "",
  type: "",
});

function finalizeOrganisme() {
  log.i("finalizeOrganisme - IN");
  emit("valid", {});
}

onMounted(() => {
  if (props.initData.typeOperateur === "personne_morale") {
    if (props.initData.personneMorale.meta) {
      renseignementsGeneraux.value.label = "complet";
      renseignementsGeneraux.value.type = "success";
    } else {
      renseignementsGeneraux.value.label = "à compléter";
      renseignementsGeneraux.value.type = "warning";
    }
  }
  if (props.initData.typeOperateur === "personne_physique") {
    if (props.initData.personnePhysique.meta) {
      renseignementsGeneraux.value.label = "complet";
      renseignementsGeneraux.value.type = "success";
    } else {
      renseignementsGeneraux.value.label = "à compléter";
      renseignementsGeneraux.value.type = "warning";
    }
  }
  if (props.initData.agrement) {
    agrement.value.label = "complet";
    agrement.value.type = "success";
  } else {
    agrement.value.label = "à compléter";
    agrement.value.type = "warning";
  }
  if (props.initData.protocoleTransport.meta) {
    protocoleTransport.value.label = "complet";
    protocoleTransport.value.type = "success";
  } else {
    protocoleTransport.value.label = "à compléter";
    protocoleTransport.value.type = "warning";
  }
  if (props.initData.protocoleSanitaire.meta) {
    protocoleSanitaire.value.label = "complet";
    protocoleSanitaire.value.type = "success";
  } else {
    protocoleSanitaire.value.label = "à compléter";
    protocoleSanitaire.value.type = "warning";
  }
});
</script>

<style lang="scss" scoped></style>
