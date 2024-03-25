<template>
  <div>
    <div class="fr-grid-row fr-my-5v">
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

          <OrganismePersonnePhysiqueReadOnly
            v-if="props.initOrganisme.typeOrganisme === 'personne_physique'"
            :init-data="props.initOrganisme.personnePhysique"
          />
          <OrganismePersonneMoraleReadOnly
            v-if="props.initOrganisme.typeOrganisme === 'personne_morale'"
            :init-data="props.initOrganisme.personneMorale"
          />
        </DsfrAccordion>
        <DsfrAccordion
          v-if="isSiege"
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
          <OrganismeAgrementReadOnly
            :init-agrement="props.initOrganisme.agrement ?? {}"
          />
        </DsfrAccordion>
        <DsfrAccordion
          v-if="isSiege"
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
            :init-data="props.initOrganisme.protocoleTransport ?? {}"
          ></protocole-transport-read-only>
        </DsfrAccordion>
        <DsfrAccordion
          v-if="isSiege"
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
            :init-data="props.initOrganisme.protocoleSanitaire ?? {}"
          ></protocole-sanitaire-read-only>
        </DsfrAccordion>
      </DsfrAccordionsGroup>
    </div>

    <form>
      <fieldset class="fr-fieldset">
        <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
          <DsfrButton
            id="previous-step"
            :secondary="true"
            @click.prevent="
              () => {
                emit('previous');
              }
            "
            >Précédent</DsfrButton
          >

          <DsfrButton
            label="Finaliser la fiche organisateur"
            :disabled="!meta.valid"
            @click.prevent="finalizeOrganisme"
          />
        </DsfrButtonGroup>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useForm } from "vee-validate";

const props = defineProps({
  initOrganisme: { type: Object, default: null, required: true },
});

const regionStore = useRegionStore();
regionStore.fetch();

const emit = defineEmits(["previous", "finalize"]);
const expandedId = ref(0);

const initialValues = { ...props.initOrganisme };
const validationSchema = computed(() =>
  yup.object(organisme.schema(regionStore.regions)),
);
const { meta, errors } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: true,
});

const isSiege = computed(() => {
  return (
    !props.initOrganisme ||
    props.initOrganisme.typeOrganisme === "personne_physique" ||
    props.initOrganisme.personneMorale?.siegeSocial === true
  );
});

const renseignementsGeneraux = computed(() =>
  !Object.keys(errors.value).find(
    (k) => k.includes("personneMorale") || k.includes("personnePhysique"),
  )
    ? {
        label: "complet",
        type: "success",
      }
    : {
        label: "incomplet",
        type: "warning",
      },
);

const agrement = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("agrement"))
    ? {
        label: "complet",
        type: "success",
      }
    : {
        label: "incomplet",
        type: "warning",
      },
);

const protocoleTransport = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("protocoleTransport"))
    ? {
        label: "complet",
        type: "success",
      }
    : {
        label: "incomplet",
        type: "warning",
      },
);

const protocoleSanitaire = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("protocoleSanitaire"))
    ? {
        label: "complet",
        type: "success",
      }
    : {
        label: "incomplet",
        type: "warning",
      },
);

function finalizeOrganisme() {
  emit("finalize");
}
</script>

<style lang="scss" scoped></style>
