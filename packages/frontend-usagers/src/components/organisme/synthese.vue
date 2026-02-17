<template>
  <div>
    <div class="fr-grid-row fr-my-5v">
      <DsfrAccordionsGroup v-model="expandeIndex">
        <DsfrAccordion
          :id="tabs.findIndex((t) => t.id === 'info-generales') + 1"
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
            v-if="
              organismeStore.organismeCourant.typeOrganisme ===
              'personne_physique'
            "
            :init-data="organismeStore.organismeCourant.personnePhysique"
            :modifiable="false"
            :show-buttons="false"
            :validate-on-mount="true"
          />
          <OrganismePersonneMorale
            v-if="
              organismeStore.organismeCourant.typeOrganisme ===
              'personne_morale'
            "
            :init-data="organismeStore.organismeCourant.personneMorale"
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          />
        </DsfrAccordion>
        <DsfrAccordion
          v-if="organismeStore.isSiegeSocial"
          :id="tabs.findIndex((t) => t.id === 'etablissement-secondaires') + 1"
        >
          <template #title>
            <span>Etablissements secondaires &nbsp;</span>
            <DsfrBadge
              :label="renseignementsGeneraux.label"
              :small="true"
              :type="renseignementsGeneraux.type"
            />
          </template>
          <OrganismeEtablissementsSecondaires
            :modifiable="false"
            :show-buttons="false"
            :init-organisme="organismeStore.organismeCourant"
          />
        </DsfrAccordion>
        <DsfrAccordion :id="tabs.findIndex((t) => t.id === 'agrement') + 1">
          <template #title>
            <span>Agrément &nbsp;</span>
            <DsfrBadge
              :label="agrement.label"
              :small="true"
              :type="agrement.type"
            />
          </template>
          <OrganismeAgrement
            :init-agrement="organismeStore.organismeCourant.agrement ?? {}"
            :modifiable="false"
            :cdn-url="`${config.public.backendUrl}/documents/`"
            :show-buttons="false"
          />
        </DsfrAccordion>
        <DsfrAccordion
          :id="tabs.findIndex((t) => t.id === 'protocole-transport') + 1"
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
            :init-data="
              organismeStore.organismeCourant.protocoleTransport ?? {}
            "
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          ></ProtocoleTransport>
        </DsfrAccordion>
        <DsfrAccordion
          :id="tabs.findIndex((t) => t.id === 'protocole-sanitaire') + 1"
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
            :init-data="
              organismeStore.organismeCourant.protocoleSanitaire ?? {}
            "
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          ></ProtocoleSanitaire>
        </DsfrAccordion>
      </DsfrAccordionsGroup>
    </div>
    <SyntheseVerificationAlert />
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
import { IsDownloading } from "@vao/shared-ui";
const config = useRuntimeConfig();
const organismeStore = useOrganismeStore();

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  isSiegeSocial: { type: Boolean, required: false, default: false },
});

const regionStore = useRegionStore();
regionStore.fetch();

const emit = defineEmits(["previous", "finalize"]);

const tabs = organismeMenus.menus(organismeStore.isSiegeSocial);
const expandeIndex = ref(-1);

const initialValues = { ...organismeStore.organismeCourant };
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
