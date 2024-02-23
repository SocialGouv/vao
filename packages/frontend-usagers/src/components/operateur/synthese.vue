<template>
  <div>
    <!-- <protocole-transport-read-only
      :init-data="props.initData.protocoleTransport"
    > -->
    <fieldset class="fr-fieldset"></fieldset>
    <div class="fr-fieldset__element">
      <div class="fr-input-group fr-col-12">
        <DsfrAccordionsGroup>
          <DsfrAccordion
            :id="1"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Renseignements généraux &nbsp;</span>
              <DsfrBadge
                :label="renseignementsGeneraux.label"
                :small="true"
                :type="renseignementsGeneraux.type"
              />
            </template>
          </DsfrAccordion>
          <DsfrAccordion
            :id="2"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Agrément &nbsp;</span>
              <DsfrBadge
                :label="agrement.label"
                :small="true"
                :type="agrement.type"
              />
            </template>
            <OperateurAgrementReadOnly :init-data="props.initData.agrement">
            </OperateurAgrementReadOnly>
          </DsfrAccordion>
          <DsfrAccordion
            :id="3"
            title="Protocole de transport"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Protocole de transport &nbsp;</span>
              <DsfrBadge
                :label="protocoleTransport.label"
                :small="true"
                :type="protocoleTransport.type"
              />
            </template>
            <protocole-transport-read-only
              :init-data="props.initData.protocoleTransport"
            ></protocole-transport-read-only>
          </DsfrAccordion>
          <DsfrAccordion
            :id="4"
            title="Protocole sanitaire"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Protocole sanitaire &nbsp;</span>
              <DsfrBadge
                :label="protocoleSanitaire.label"
                :small="true"
                :type="protocoleSanitaire.type"
              />
            </template>
            <protocole-sanitaire-read-only
              :init-data="props.initData.protocoleSanitaire"
            ></protocole-sanitaire-read-only>
          </DsfrAccordion>
          <DsfrAccordion
            :id="5"
            title="Organisateurs"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Organisateurs du séjour &nbsp;</span>
              <DsfrBadge
                :label="organisateur.label"
                :small="true"
                :type="organisateur.type"
              />
            </template>
            <personnes-read-only
              :personnes="props.initData.organisateurs"
            ></personnes-read-only>
          </DsfrAccordion>
        </DsfrAccordionsGroup>
      </div>
    </div>

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
const expandedId = ref(0);

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
const organisateur = ref({
  label: "complet",
  type: "success",
});

function finalizeOrganisme() {
  log.i("finalizeOrganisme - IN");
  emit("valid", {});
}

onMounted(() => {
  if (props.initData.typeOperateur === "personne_morale") {
    if (props.initData.personneMorale?.meta) {
      renseignementsGeneraux.value.label = "complet";
      renseignementsGeneraux.value.type = "success";
    } else {
      renseignementsGeneraux.value.label = "incomplet";
      renseignementsGeneraux.value.type = "warning";
    }
  }
  if (props.initData.typeOperateur === "personne_physique") {
    if (props.initData.personnePhysique?.meta) {
      renseignementsGeneraux.value.label = "complet";
      renseignementsGeneraux.value.type = "success";
    } else {
      renseignementsGeneraux.value.label = "incomplet";
      renseignementsGeneraux.value.type = "warning";
    }
  }
  if (props.initData.agrement) {
    agrement.value.label = "complet";
    agrement.value.type = "success";
  } else {
    agrement.value.label = "incomplet";
    agrement.value.type = "warning";
  }
  if (props.initData.protocoleTransport?.meta) {
    protocoleTransport.value.label = "complet";
    protocoleTransport.value.type = "success";
  } else {
    protocoleTransport.value.label = "incomplet";
    protocoleTransport.value.type = "warning";
  }
  if (props.initData.protocoleSanitaire?.meta) {
    protocoleSanitaire.value.label = "complet";
    protocoleSanitaire.value.type = "success";
  } else {
    protocoleSanitaire.value.label = "incomplet";
    protocoleSanitaire.value.type = "warning";
  }
});
</script>

<style lang="scss" scoped></style>
