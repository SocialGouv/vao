<template>
  <div>
    <div class="fr-grid-row fr-my-5v">
      <DsfrAccordionsGroup v-model="expandeIndex">
        <DsfrAccordion :id="accordionId('info-generales')">
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
              organismeStore?.organismeCourant?.typeOrganisme ===
              'personne_physique'
            "
            :init-data="organismeStore?.organismeCourant?.personnePhysique"
            :modifiable="false"
            :show-buttons="false"
            :validate-on-mount="true"
          />
          <OrganismePersonneMorale
            v-if="
              organismeStore?.organismeCourant?.typeOrganisme ===
              'personne_morale'
            "
            :init-data="organismeStore?.organismeCourant?.personneMorale"
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          />
        </DsfrAccordion>
        <DsfrAccordion
          v-if="organismeStore.isSiegeSocial"
          :id="accordionId('etablissement-secondaires')"
        >
          <template #title>
            <span>Etablissements secondaires &nbsp;</span>
            <DsfrBadge
              :label="etablissementsSecondaires.label"
              :small="true"
              :type="etablissementsSecondaires.type"
            />
          </template>
          <OrganismeEtablissementsSecondaires
            v-if="organismeStore?.organismeCourant"
            :modifiable="false"
            :show-buttons="false"
            :init-organisme="organismeStore.organismeCourant"
          />
        </DsfrAccordion>
        <DsfrAccordion :id="accordionId('agrement')">
          <template #title>
            <span>Agrément &nbsp;</span>
            <DsfrBadge
              :label="agrement.label"
              :small="true"
              :type="agrement.type"
            />
          </template>
          <OrganismeAgrement
            :init-agrement="organismeStore?.organismeCourant?.agrement ?? {}"
            :modifiable="false"
            :cdn-url="`${config.public.backendUrl}/documents/`"
            :show-buttons="false"
          />
        </DsfrAccordion>
        <DsfrAccordion :id="accordionId('protocole-transport')">
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
              (organismeStore?.organismeCourant as any)?.protocoleTransport ??
              {}
            "
            :modifiable="false"
            :validate-on-mount="true"
            :show-buttons="false"
          ></ProtocoleTransport>
        </DsfrAccordion>
        <DsfrAccordion :id="accordionId('protocole-sanitaire')">
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
              (organismeStore?.organismeCourant as any)?.protocoleSanitaire ??
              {}
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

<script setup lang="ts">
import * as yup from "yup";
import { useForm } from "vee-validate";
import { IsDownloading } from "@vao/shared-ui";

type BadgeStatus = {
  label: string;
  type: "success" | "warning";
};

const props = withDefaults(
  defineProps<{
    isDownloading?: boolean;
    message?: string;
    isSiegeSocial?: boolean;
  }>(),
  {
    isDownloading: false,
    message: null as any,
    isSiegeSocial: false,
  },
);

const emit = defineEmits<{
  (event: "previous" | "finalize"): void;
}>();

const config = useRuntimeConfig();
const organismeStore = useOrganismeStore();
const regionStore = useRegionStore();

regionStore.fetch();

const tabs = organismeMenus.menus(organismeStore.isSiegeSocial);
const expandeIndex = ref(-1);

const accordionId = (accordionId: string): string =>
  String(tabs.findIndex((t) => t.id === accordionId) + 1);

const initialValues = { ...(organismeStore.organismeCourant ?? {}) };
const validationSchema = computed(() =>
  yup.object(organisme.schema(regionStore.regions)),
);

const success: BadgeStatus = {
  label: "complet",
  type: "success",
};

const failure: BadgeStatus = {
  label: "incomplet",
  type: "warning",
};

const renseignementsGeneraux = computed<BadgeStatus>(() =>
  !Object.keys(errors.value).find(
    (k) => k.includes("personneMorale") || k.includes("personnePhysique"),
  )
    ? success
    : failure,
);

const { meta, errors } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: true,
});

const etablissementsSecondaires = computed<BadgeStatus>(() =>
  !Object.keys(errors.value).find((k) =>
    k.includes("etablissementsSecondaires"),
  )
    ? success
    : failure,
);

const agrement = computed<BadgeStatus>(() =>
  !Object.keys(errors.value).find((k) => k.includes("agrement"))
    ? success
    : failure,
);

const protocoleTransport = computed<BadgeStatus>(() =>
  !Object.keys(errors.value).find((k) => k.includes("protocoleTransport"))
    ? success
    : failure,
);

const protocoleSanitaire = computed<BadgeStatus>(() =>
  !Object.keys(errors.value).find((k) => k.includes("protocoleSanitaire"))
    ? success
    : failure,
);

function finalizeOrganisme(): void {
  emit("finalize");
}
</script>

<style lang="scss" scoped></style>
