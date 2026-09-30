<template>
  <form novalidate @submit.prevent="onSubmit">
    <p class="fr-pb-3w fr-col-12">
      Sauf mention contraire, tous les champs sont obligatoires.
    </p>

    <div class="fr-fieldset fr-mb-6w">
      <h2 class="fr-h3 fr-mt-0">Type d’hébergement</h2>
      <div class="fr-fieldset__element fr-col-12">
        <fieldset
          class="fr-fieldset"
          :class="{ 'fr-fieldset--error': !!typeHebergementErrorMessage }"
        >
          <legend class="fr-fieldset__legend fr-text--regular">
            Sélectionnez le type d’hébergement
          </legend>
          <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
            <div
              v-for="option in typeOptions"
              :key="option.value"
              class="fr-col-12 fr-col-sm-6 fr-col-lg-4"
            >
              <HebergementsTypeCard
                name="typeHebergement"
                :value="option.value"
                :label="option.label"
                :icon="getTypeIcon(option.value)"
                :hint="typeHints[option.value]"
                :model-value="typeHebergement"
                @update:model-value="onTypeHebergementChange"
              />
            </div>
          </div>
          <div v-if="typeHebergementErrorMessage" class="fr-messages-group">
            <p class="fr-message fr-message--error">
              {{ typeHebergementErrorMessage }}
            </p>
          </div>
        </fieldset>
      </div>
    </div>

    <div class="fr-fieldset fr-mb-6w">
      <h2 class="fr-h3 fr-mt-0">Descriptif</h2>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="description"
          label="Description des parties communes et des équipements"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="description"
          hint="Exemple : cuisine accessible en fauteuil roulant avec électroménager PMR et table escamotable, buanderie avec espace de lavage, salle de bain aménagée."
          :error-message="descriptionErrorMessage"
          :is-valid="descriptionMeta.valid"
          @update:model-value="onDescriptionChange"
        />
        <p class="fr-hint-text">
          Nombre de caractères maximum : {{ DESCRIPTION_MAX }}.
          <span>{{ remainingCharacters }} caractère(s) restant(s).</span>
        </p>
      </div>
    </div>

    <div class="fr-fieldset fr-mb-6w">
      <h2 class="fr-h3 fr-mt-0">Coordonnées du responsable de l’hébergement</h2>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="nomPrenom"
          label="Nom et prénom"
          :label-visible="true"
          placeholder=""
          hint="Format attendu : DUPONT Nicolas"
          :model-value="responsableNomPrenom"
          :error-message="nomPrenomErrorMessage"
          :is-valid="nomPrenomMeta.valid"
          @update:model-value="onNomPrenomChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="telephone"
          label="Téléphone"
          :label-visible="true"
          placeholder=""
          hint="Format attendu : (+33) 1 22 33 44 55"
          :model-value="responsableTelephone"
          :error-message="telephoneErrorMessage"
          :is-valid="telephoneMeta.valid"
          @update:model-value="onTelephoneChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="email"
          label="E-mail"
          :label-visible="true"
          placeholder=""
          hint="Format attendu : nom@domaine.fr"
          :model-value="responsableEmail"
          :error-message="emailErrorMessage"
          :is-valid="emailMeta.valid"
          @update:model-value="onEmailChange"
        />
      </div>
    </div>

    <div class="site-form-actions fr-mt-2w">
      <DsfrButton secondary type="button" @click="emit('previous')">
        Précédent
      </DsfrButton>
      <DsfrButton type="submit" :disabled="!meta.valid"> Suivant </DsfrButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useForm, useField } from "vee-validate";
import { DsfrInputGroup } from "@gouvminint/vue-dsfr";
import { hebergement } from "@vao/shared-ui";
import {
  buildInformationsSiteFormValidationSchema,
  DESCRIPTION_MAX,
  type InformationsSiteFormValues,
} from "./siteFormValidation";

const typeIcons: Record<string, string> = {
  hotel: "fr-icon-hotel-line",
  meuble_tourisme: "fr-icon-home-4-line",
  residence_tourisme: "fr-icon-store-line",
  camping: "fr-icon-caravan-line",
  autre: "fr-icon-map-pin-2-line",
};

const typeHints: Record<string, string> = {
  autre: "(auberge, centre de vacances, refuge de montagne)",
};

const props = withDefaults(
  defineProps<{
    initValues?: Partial<InformationsSiteFormValues>;
  }>(),
  {
    initValues: () => ({}),
  },
);

const emit = defineEmits<{
  (e: "submit", values: InformationsSiteFormValues): void;
  (e: "previous"): void;
}>();

const typeOptions = hebergement.typeOptions;

const getTypeIcon = (value: string) =>
  typeIcons[value] ?? typeIcons.autre ?? "";

const initialValues: InformationsSiteFormValues = {
  typeHebergement: props.initValues?.typeHebergement ?? "",
  description: props.initValues?.description ?? "",
  responsable: {
    nomPrenom: props.initValues?.responsable?.nomPrenom ?? "",
    telephone: props.initValues?.responsable?.telephone ?? "",
    email: props.initValues?.responsable?.email ?? "",
  },
};

const validationSchema = buildInformationsSiteFormValidationSchema();

const { meta, handleSubmit } = useForm<InformationsSiteFormValues>({
  validationSchema,
  initialValues,
});

const {
  value: typeHebergement,
  errorMessage: typeHebergementErrorMessage,
  handleChange: onTypeHebergementChange,
} = useField<string>("typeHebergement");
const {
  value: description,
  errorMessage: descriptionErrorMessage,
  handleChange: onDescriptionChange,
  meta: descriptionMeta,
} = useField<string>("description");
const {
  value: responsableNomPrenom,
  errorMessage: nomPrenomErrorMessage,
  handleChange: onNomPrenomChange,
  meta: nomPrenomMeta,
} = useField<string>("responsable.nomPrenom");
const {
  value: responsableTelephone,
  errorMessage: telephoneErrorMessage,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField<string>("responsable.telephone");
const {
  value: responsableEmail,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField<string>("responsable.email");

const remainingCharacters = computed(
  () => DESCRIPTION_MAX - (description.value?.length ?? 0),
);

const onSubmit = handleSubmit((values) => {
  emit("submit", values);
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
