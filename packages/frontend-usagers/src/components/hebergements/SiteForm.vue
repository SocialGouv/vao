<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="fr-fieldset fr-mb-6w">
      <h2 class="fr-h3 fr-mt-0">Coordonnées du site</h2>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nomSiteOfficiel"
          label="Nom du site"
          :label-visible="true"
          placeholder=""
          hint="Nom qui permet d’identifier ce lieu d’hébergement. Exemple : Résidence Les Pins."
          :model-value="nomSiteOfficiel"
          :error-message="nomSiteOfficielErrorMessage"
          :is-valid="nomSiteOfficielMeta.valid"
          required
          :disabled="!props.modifiable"
          @update:model-value="onNomSiteOfficielChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <AddressSearchAddress
          name="adresse"
          :value="(adresse as unknown as Record<string, unknown>) ?? undefined"
          label="Adresse du site"
          :initial-adress="initialAdresse"
          :error-message="adresseErrorMessage"
          :modifiable="props.modifiable"
          @select="onAdresseChange"
        />
      </div>
    </div>

    <div class="site-form-actions fr-mt-2w">
      <NuxtLink :to="defaultBackRoute" class="no-background-image">
        <DsfrButton type="button" secondary>Retour</DsfrButton>
      </NuxtLink>
      <DsfrButton v-if="props.modifiable" type="submit" :disabled="!meta.valid">
        Continuer
      </DsfrButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { DsfrButton, DsfrInputGroup } from "@gouvminint/vue-dsfr";
import type { AdresseDto } from "@vao/shared-bridge";

interface SiteFormValues {
  nomSiteOfficiel: string;
  adresse: AdresseDto | null;
}

const props = withDefaults(
  defineProps<{
    initSite?: Partial<SiteFormValues>;
    modifiable?: boolean;
    defaultBackRoute: string;
  }>(),
  {
    initSite: () => ({}),
    modifiable: true,
  },
);

const emit = defineEmits<{
  (e: "submit", site: SiteFormValues): void;
}>();

const validationSchema = yup.object({
  nomSiteOfficiel: yup.string().required("Le nom du site est obligatoire"),
  adresse: yup
    .object()
    .nullable()
    .required("L’adresse du site est obligatoire"),
});

const initialValues = {
  nomSiteOfficiel: props.initSite?.nomSiteOfficiel ?? "",
  adresse: props.initSite?.adresse ?? null,
};

const { meta, handleSubmit } = useForm<SiteFormValues>({
  validationSchema,
  initialValues,
});

const {
  value: nomSiteOfficiel,
  errorMessage: nomSiteOfficielErrorMessage,
  handleChange: onNomSiteOfficielChange,
  meta: nomSiteOfficielMeta,
} = useField<string>("nomSiteOfficiel");
const {
  value: adresse,
  errorMessage: adresseErrorMessage,
  handleChange: onAdresseChange,
} = useField<AdresseDto | null>("adresse");

const initialAdresse = computed<string | undefined>(
  () => props.initSite?.adresse?.label ?? undefined,
);

const onSubmit = handleSubmit((values) => {
  emit("submit", { ...values });
});
</script>

<style scoped>
.site-form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
</style>
