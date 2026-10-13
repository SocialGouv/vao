<template>
  <div class="fr-mb-2w">
    <h3 v-if="props.label" class="fr-h3 fr-mt-0 fr-mb-2w">
      <span class="fr-icon-hotel-line fr-mr-1v" aria-hidden="true"></span>
      {{ props.label }}
    </h3>

    <div :class="{ 'hebergement-details--framed fr-p-3w': props.label }">
      <fieldset class="fr-fieldset fr-mb-4w">
        <TitleWithIcon
          icon="ri-road-map-line"
          :level="3"
          title-class="fr-text--lead fr-mb-0"
        >
          {{ sections.localisation }}
        </TitleWithIcon>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            :name="`${namePrefix}-complementLocalisation`"
            :label="inputs.complementLocalisation.label"
            :hint="inputs.complementLocalisation.hint"
            :label-visible="true"
            placeholder=""
            :model-value="model.complementLocalisation"
            @update:model-value="update('complementLocalisation', $event)"
          />
        </div>
      </fieldset>

      <fieldset class="fr-fieldset fr-mb-4w">
        <TitleWithIcon
          icon="ri-accessibility-line"
          :level="3"
          title-class="fr-text--lead fr-mb-0"
        >
          {{ sections.capaciteAccueil }}
        </TitleWithIcon>
        <div class="fr-col-12 fr-fieldset__element">
          <DsfrInputGroup
            :name="`${namePrefix}-nbCouchages`"
            type="number"
            :label="inputs.nombreCouchagesTotal.label"
            :hint="inputs.nombreCouchagesTotal.hint"
            :label-visible="true"
            placeholder=""
            :model-value="model.nombreCouchagesTotal ?? undefined"
            @update:model-value="
              update('nombreCouchagesTotal', $event !== '' ? $event : null)
            "
          />
        </div>
        <div class="fr-col-12 fr-fieldset__element">
          <DsfrInputGroup
            :name="`${namePrefix}-nbChambres`"
            type="number"
            :label="inputs.nombreChambresTotal.label"
            :hint="inputs.nombreChambresTotal.hint"
            :label-visible="true"
            placeholder=""
            :model-value="model.nombreChambresTotal ?? undefined"
            @update:model-value="
              update('nombreChambresTotal', $event !== '' ? $event : null)
            "
          />
        </div>
      </fieldset>

      <div class="fr-fieldset__element fr-col-12 fr-mt-2w">
        <div class="fr-input-group">
          <DsfrRadioButtonSet
            :name="`${namePrefix}-estErp`"
            legend="L’hébergement est-il aux normes ERP (Établissement recevant du public) ?"
            :model-value="model.estErp ?? undefined"
            :options="ouiNonOptions"
            :inline="true"
            @update:model-value="update('estErp', $event)"
          />
        </div>
      </div>
      <DsfrAlert
        title="Normes ERP (Établissement recevant du public) :"
        type="info"
        :closeable="false"
      >
        <p class="fr-mb-3w fr-text--bold">
          Les hébergements de plus de 15 personnes ou 5 chambres sont soumis à
          la réglementation ERP (seuil abaissé à 7 personnes si l'hébergement
          est principalement destiné à des personnes en situation de handicap).
        </p>
        <ul>
          <li>
            <strong>Les ERP</strong> doivent fournir un arrêté d'autorisation du
            maire et une attestation de la commission de sécurité de moins de 5
            ans.
          </li>
          <li>
            <strong>Les NON ERP</strong> doivent disposer d'un détecteur de
            fumée (DAAF) fonctionnel.
          </li>
        </ul>
        <p class="fr-mb-3w">
          Sans justificatifs ou équipements obligatoires, le séjour pourra être
          régularisé ou annulé.
        </p>
        <p>
          Il existe 3 catégories d'hébergement : <strong>ERP</strong> (hôtels et
          grands hébergements,) <strong>BHC</strong> (résidences de tourisme et
          assimilés), <strong>MI</strong> (chambres d'hôtes et petits meublés, ≤
          15 personnes et 5 chambres)
        </p></DsfrAlert
      >
      <div v-if="model.estErp === true" class="fr-fieldset__element fr-col-12">
        <FileUpload
          v-model="model.fileDerniereAttestationSecurite"
          label="Dernière attestation de passage de la commission de sécurité"
          hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
          :modifiable="true"
          :cdn-url="cdnUrl"
          :optional="true"
        />
        <FileUpload
          v-model="model.fileDernierArreteAutorisationMaire"
          label="Dernier arrêté d’autorisation du maire"
          hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
          :modifiable="true"
          :cdn-url="cdnUrl"
          :optional="true"
        />
      </div>

      <div
        v-else-if="model.estErp === false"
        class="fr-fieldset__element fr-col-12"
      >
        <FileUpload
          v-model="model.fileReponseNonAssujettissementErp"
          label="Attestation de non-assujettissement à la réglementation ERP"
          hint="Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf."
          :modifiable="true"
          :cdn-url="cdnUrl"
          :optional="true"
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <DsfrCheckboxSet
          :name="`${namePrefix}-caracteristiques`"
          :model-value="caracteristiquesSelectionnees"
          :options="caracteristiquesOptions"
          :small="true"
          @update:model-value="onCaracteristiquesChange"
        />
      </div>

      <div
        v-if="model.amenagementsSpecifiques === true"
        class="fr-fieldset__element fr-col-12"
      >
        <DsfrInputGroup
          :name="`${namePrefix}-precisionAmenagements`"
          label="Précisez les aménagements spécifiques"
          :label-visible="true"
          :is-textarea="true"
          placeholder=""
          :model-value="model.precisionAmenagementsSpecifiques ?? undefined"
          @update:model-value="
            update('precisionAmenagementsSpecifiques', $event)
          "
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <div class="fr-input-group">
          <TitleWithIcon
            icon="ri-accessibility-line"
            :level="3"
            title-class="fr-text--lead fr-mb-0"
          >
            Accessibilité
          </TitleWithIcon>
          <DsfrCheckbox
            :name="`${namePrefix}-accessibilitePmr`"
            label="Accessible pour personnes à mobilité réduite"
            :value="true"
            :model-value="model.accessibilitePmr === true"
            @update:model-value="update('accessibilitePmr', $event)"
          />
        </div>
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <TitleWithIcon
          icon="ri-restaurant-2-line"
          :level="3"
          title-class="fr-text--lead fr-mb-0"
        >
          Pensions proposées par l'hébergeur
        </TitleWithIcon>
        <DsfrCheckboxSet
          :name="`${namePrefix}-pension`"
          legend="Type de pension (plusieurs options possibles)"
          :model-value="model.pension"
          :options="pensionOptions"
          :small="true"
          @update:model-value="update('pension', $event)"
        />
      </div>

      <div class="fr-fieldset__element fr-col-12">
        <TitleWithIcon
          icon="ri-brush-2-fill"
          :level="3"
          title-class="fr-text--lead fr-mb-0"
        >
          Services proposés par l’hébergeur
        </TitleWithIcon>

        <DsfrCheckboxSet
          :name="`${namePrefix}-services`"
          :model-value="model.prestationsHotelieres"
          :options="hebergementUtils.prestationsHotelieresOptions"
          :small="true"
          @update:model-value="update('prestationsHotelieres', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DsfrCheckbox,
  DsfrCheckboxSet,
  DsfrInputGroup,
  DsfrRadioButtonSet,
} from "@gouvminint/vue-dsfr";
import {
  hebergement as hebergementUtils,
  FileUpload,
  HebergementDetailsDisplayInput,
  TitleWithIcon,
} from "@vao/shared-ui";
import { computed, reactive, watch } from "vue";
import type { HebergementDetailValues } from "./hebergementDetails";

const config = useRuntimeConfig();

const {
  HebergementDetailsInput: inputs,
  HebergementDetailsSections: sections,
} = HebergementDetailsDisplayInput;

const props = withDefaults(
  defineProps<{
    label?: string;
    name: string;
    modelValue?: Partial<HebergementDetailValues>;
  }>(),
  {
    label: "",
    modelValue: () => ({}),
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: HebergementDetailValues): void;
}>();

const ouiNonOptions = [
  { label: "Oui", value: true },
  { label: "Non", value: false },
];

const namePrefix = props.name;

const pensionOptions = hebergementUtils.pensionOptions.map(
  ({ label, value }) => ({
    label,
    value,
    name: `${namePrefix}-pension-${value}`,
    id: `${namePrefix}-pension-${value}`,
  }),
);

const caracteristiquesKeys = [
  "couchageIndividuel",
  "litsSuperposes",
  "rangementIndividuel",
  "chambresUnisexes",
  "chambresDoubles",
  "amenagementsSpecifiques",
] as const;

type CaracteristiqueKey = (typeof caracteristiquesKeys)[number];

const caracteristiquesOptions: Array<{
  value: CaracteristiqueKey;
  label: string;
  hint?: string;
  name: string;
  id: string;
}> = [
  {
    value: "couchageIndividuel",
    name: `${namePrefix}-caracteristique-couchage-individuel`,
    id: `${namePrefix}-caracteristique-couchage-individuel`,
    label: "Couchage individuel pour chaque vacancier",
  },
  {
    value: "litsSuperposes",
    name: `${namePrefix}-caracteristique-lits-superposes`,
    id: `${namePrefix}-caracteristique-lits-superposes`,
    label: "Lits superposés",
  },
  {
    value: "rangementIndividuel",
    name: `${namePrefix}-caracteristique-rangement`,
    id: `${namePrefix}-caracteristique-rangement`,
    label:
      "Espace de rangement des affaires personnelles pour chaque vacancier",
  },
  {
    value: "chambresUnisexes",
    name: `${namePrefix}-caracteristique-separation-hommes-femmes`,
    id: `${namePrefix}-caracteristique-separation-hommes-femmes`,
    label: "Espace de couchage séparé hommes / femmes",
  },
  {
    value: "chambresDoubles",
    name: `${namePrefix}-caracteristique-chambres-doubles`,
    id: `${namePrefix}-caracteristique-chambres-doubles`,
    label: "Chambres doubles pour les couples",
  },
  {
    value: "amenagementsSpecifiques",
    name: `${namePrefix}-caracteristique-amenagements`,
    id: `${namePrefix}-caracteristique-amenagements`,
    label:
      "Aménagements spécifiques des locaux pour accueillir les vacanciers en fonction de leurs besoins",
    hint: "Par exemple : douche accessible, rampe d’accès, pictogrammes, documents en FALC, environnement calme, bandes de guidage, alarmes lumineuses.",
  },
];

const cdnUrl = `${config.public.backendUrl}/documents/`;

function modelValuesFromProps(
  values?: Partial<HebergementDetailValues>,
): HebergementDetailValues {
  return {
    complementLocalisation: values?.complementLocalisation ?? "",
    nombreCouchagesTotal: values?.nombreCouchagesTotal ?? null,
    nombreChambresTotal: values?.nombreChambresTotal ?? null,
    estErp: values?.estErp ?? null,
    fileDerniereAttestationSecurite:
      values?.fileDerniereAttestationSecurite ?? null,
    fileDernierArreteAutorisationMaire:
      values?.fileDernierArreteAutorisationMaire ?? null,
    fileReponseNonAssujettissementErp:
      values?.fileReponseNonAssujettissementErp ?? null,
    couchageIndividuel: values?.couchageIndividuel ?? null,
    litsSuperposes: values?.litsSuperposes ?? null,
    rangementIndividuel: values?.rangementIndividuel ?? null,
    chambresUnisexes: values?.chambresUnisexes ?? null,
    chambresDoubles: values?.chambresDoubles ?? null,
    amenagementsSpecifiques: values?.amenagementsSpecifiques ?? null,
    precisionAmenagementsSpecifiques:
      values?.precisionAmenagementsSpecifiques ?? "",
    accessibilitePmr: values?.accessibilitePmr ?? null,
    pension: values?.pension ?? [],
    prestationsHotelieres: values?.prestationsHotelieres ?? [],
  };
}

const model = reactive<HebergementDetailValues>(
  modelValuesFromProps(props.modelValue),
);

watch(
  () => props.modelValue,
  (values) => {
    Object.assign(model, modelValuesFromProps(values));
  },
  { deep: true },
);

function update<K extends keyof HebergementDetailValues>(
  key: K,
  value:
    | HebergementDetailValues[K]
    | string
    | number
    | boolean
    | null
    | undefined,
) {
  model[key] = value as HebergementDetailValues[K];
}

const caracteristiquesSelectionnees = computed<Array<string>>(() =>
  caracteristiquesKeys.filter((key) => model[key] === true),
);

function onCaracteristiquesChange(keys: Array<unknown>) {
  const selected = new Set(keys.map(String));
  for (const key of caracteristiquesKeys) {
    model[key] = selected.has(key);
  }
}

watch(
  model,
  (v) => {
    emit("update:modelValue", { ...v });
  },
  { deep: true },
);
</script>

<style scoped>
.hebergement-details--framed {
  border: 1px solid var(--border-default-grey, #ddd);
}
</style>
