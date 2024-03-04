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

            <OperateurPersonnePhysiqueReadOnly
              v-if="props.initData.typeOperateur === 'personne_physique'"
              :init-data="props.initData.personnePhysique"
            />
            <OperateurPersonneMoraleReadOnly
              v-if="props.initData.typeOperateur === 'personne_morale'"
              :init-data="props.initData.personneMorale"
            />
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
            <OperateurAgrementReadOnly
              v-if="props.initData.typeOperateur === 'personne_morale'"
              :init-data="props.initData.agrement ?? {}"
            />
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
              :init-data="props.initData.protocoleTransport ?? {}"
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
              :init-data="props.initData.protocoleSanitaire ?? {}"
            ></protocole-sanitaire-read-only>
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

const renseignementsGeneraux = computed(() => {
  if (props.initData.typeOperateur === "personne_morale") {
    if (props.initData.personneMorale?.meta) {
      return {
        label: "complet",
        type: "success",
      };
    } else {
      return {
        label: "incomplet",
        type: "warning",
      };
    }
  }
  if (props.initData.typeOperateur === "personne_physique") {
    if (props.initData.personnePhysique?.meta) {
      return {
        label: "complet",
        type: "success",
      };
    } else {
      return {
        label: "incomplet",
        type: "warning",
      };
    }
  }
  return {
    label: "incomplet",
    type: "warning",
  };
});

const agrement = computed(() => {
  if (props.initData.agrement) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const protocoleTransport = computed(() => {
  if (props.initData.protocoleTransport?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const protocoleSanitaire = computed(() => {
  if (props.initData.protocoleSanitaire?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

function finalizeOrganisme() {
  log.i("finalizeOrganisme - IN");
  emit("valid", {});
}
</script>

<style lang="scss" scoped></style>
