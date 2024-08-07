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

          <OrganismePersonnePhysique
            v-if="props.initOrganisme.typeOrganisme === 'personne_physique'"
            :init-data="props.initOrganisme.personnePhysique"
            :modifiable="false"
            :show-buttons="false"
            :validate-on-mount="true"
          />
          <OrganismePersonneMorale
            v-if="props.initOrganisme.typeOrganisme === 'personne_morale'"
            :init-data="props.initOrganisme.personneMorale"
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
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
          <OrganismeAgrement
            :init-agrement="props.initOrganisme.agrement ?? {}"
            :modifiable="false"
            :show-buttons="false"
          />
        </DsfrAccordion>
        <DsfrAccordion
          :id="3"
          title="Protocole de transport"
          :expanded-id="expandedId"
          @expand="(id) => (expandedId = id)"
        >
          <template #title>
            <span>Informations sur le transport &nbsp;</span>
            <DsfrBadge
              :label="protocoleTransport.label"
              :small="true"
              :type="protocoleTransport.type"
            />
          </template>
          <ProtocoleTransport
            :init-data="props.initOrganisme.protocoleTransport ?? {}"
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          ></ProtocoleTransport>
        </DsfrAccordion>
        <DsfrAccordion
          :id="4"
          title="Protocole sanitaire"
          :expanded-id="expandedId"
          @expand="(id) => (expandedId = id)"
        >
          <template #title>
            <span>Informations sanitaires &nbsp;</span>
            <DsfrBadge
              :label="protocoleSanitaire.label"
              :small="true"
              :type="protocoleSanitaire.type"
            />
          </template>
          <ProtocoleSanitaire
            :init-data="props.initOrganisme.protocoleSanitaire ?? {}"
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          ></ProtocoleSanitaire>
        </DsfrAccordion>
      </DsfrAccordionsGroup>
    </div>

    <form>
      <DsfrFieldset>
        <DsfrButtonGroup
          v-if="!props.isDownloading"
          :inline-layout-when="true"
          :reverse="true"
        >
          <DsfrButton
            id="previous-step"
            :secondary="true"
            @click.prevent="
              () => {
                emit('previous');
              }
            "
            >Précédent
          </DsfrButton>

          <DsfrButton
            label="Finaliser la fiche organisateur"
            :disabled="!meta.valid"
            @click.prevent="finalizeOrganisme"
          />
        </DsfrButtonGroup>
        <is-downloading
          :message="props.message"
          :is-downloading="props.isDownloading"
        />
      </DsfrFieldset>
    </form>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useForm } from "vee-validate";
import { IsDownloading } from "@vao/shared";

const props = defineProps({
  initOrganisme: { type: Object, default: null, required: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const regionStore = useRegionStore();
regionStore.fetch();

const emit = defineEmits(["previous", "finalize"]);
const expandedId = ref(0);

const initialValues = { ...props.initOrganisme };
const validationSchema = computed(() =>
  yup.object(organisme.schema(regionStore.regions)),
);
const renseignementsGeneraux = computed(() => {
  return !Object.keys(errors.value).find(
    (k) => k.includes("personneMorale") || k.includes("personnePhysique"),
  )
    ? {
        label: "complet",
        type: "success",
      }
    : {
        label: "incomplet",
        type: "warning",
      };
});

const { meta, errors } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: true,
});

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
