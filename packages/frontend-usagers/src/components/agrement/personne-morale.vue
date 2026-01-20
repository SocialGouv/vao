<template>
  <div class="fr-col-10">
    <TitleWithIcon
      icon="fr-icon-building-line"
      :level="3"
      title-class="fr-text--lead fr-mb-0"
    >
      Personne morale
    </TitleWithIcon>
    <dl class="fr-text--sm fr-pl-0">
      <dt><strong>Dénomination sociale:</strong></dt>
      <dd>{{ personneMorale.raisonSociale || "-" }}</dd>
      <dt><strong>Statut, forme juridique:</strong></dt>
      <dd>{{ personneMorale.statut || "-" }}</dd>

      <template v-if="!isEditingTelephone">
        <dt><strong>Téléphone:</strong></dt>
        <dd>
          {{ personneMorale.telephone || "-" }}
          <DsfrLinkV2
            as="button"
            icon-name="icon-edit-line"
            @click="startEditTelephone"
            >modifier</DsfrLinkV2
          >
        </dd>
      </template>
      <template v-else>
        <dd class="full-width">
          <DsfrInputGroup
            name="telephone"
            label="Téléphone"
            :label-visible="true"
            :model-value="telephone"
            :is-valid="telephoneMeta.valid"
            :error-message="telephoneError"
            hint="Au format 0X, +33X ou 0033. Exemple : 0612345678"
            @update:model-value="onTelephoneChange"
          />
        </dd>
      </template>

      <template v-if="!isEditingEmail">
        <dt><strong>Email:</strong></dt>
        <dd>
          {{ personneMorale.email || "-" }}
          <DsfrLinkV2
            as="button"
            icon-name="icon-edit-line"
            @click="startEditEmail"
            >modifier</DsfrLinkV2
          >
        </dd>
      </template>
      <template v-else>
        <dd class="full-width">
          <DsfrInputGroup
            name="email"
            label="Adresse courriel"
            :label-visible="true"
            :model-value="email"
            :is-valid="emailMeta.valid"
            :error-message="emailError"
            hint="Adresse courriel de la personne. Exemple: nom@domaine.fr"
            @update:model-value="onEmailChange"
          />
        </dd>
      </template>
      <dt><strong>Adresse du siège social:</strong></dt>
      <dd>{{ personneMorale.adresse || "-" }}</dd>
    </dl>

    <AgrementRepresentants ref="representantsRef" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { TitleWithIcon, DsfrLinkV2 } from "@vao/shared-ui";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { telephoneYupNullable } from "@/utils/telephoneValidators";

const props = defineProps({
  initOrganisme: { type: Object, required: true },
  initAgrement: { type: Object, required: true },
});

const representantsRef = ref();
const isEditingTelephone = ref(false);
const isEditingEmail = ref(false);

const toaster = useToaster();

const personneMorale = computed(() => {
  return props.initOrganisme?.personneMorale || {};
});

const requiredUnlessBrouillon = (schema) =>
  schema.when("statut", {
    is: (val) => val !== AGREMENT_STATUT.BROUILLON,
    then: (schema) => schema.required("Champ obligatoire"),
    otherwise: (schema) => schema.nullable().notRequired(),
  });

const validationSchema = yup.object({
  telephone: requiredUnlessBrouillon(telephoneYupNullable()),
  email: requiredUnlessBrouillon(
    yup.string().email("Format d'email invalide").nullable(),
  ),
  adresse: requiredUnlessBrouillon(yup.string().nullable()),
  prenom: requiredUnlessBrouillon(yup.string().nullable()),
  nom: requiredUnlessBrouillon(yup.string().nullable()),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  telephone: props.initOrganisme?.personneMorale?.telephone || "",
  email: props.initOrganisme?.personneMorale?.email || "",
  adresse: props.initOrganisme?.personneMorale?.adresse || "",
  prenom: props.initOrganisme?.personneMorale?.prenom || "",
  nom: props.initOrganisme?.personneMorale?.nom || "",
};

const { handleSubmit, setValues } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: telephone,
  errorMessage: telephoneError,
  handleChange: onTelephoneChange,
  meta: telephoneMeta,
} = useField("telephone");

const {
  value: email,
  errorMessage: emailError,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");

function startEditTelephone() {
  isEditingTelephone.value = true;
  setValues({
    ...initialValues,
    telephone: personneMorale.value.telephone || "",
  });
}
function startEditEmail() {
  isEditingEmail.value = true;
  setValues({
    ...initialValues,
    email: personneMorale.value.email || "",
  });
}

async function savePersonneMorale() {
  let result = null;
  const representantsLegaux = await representantsRef.value?.validateAndSave();

  if (!representantsLegaux) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur de validation des représentants légaux",
    });
    return null;
  }
  await handleSubmit((values) => {
    result = {
      ...personneMorale.value,
      ...values,
      representantsLegaux,
    };
    isEditingTelephone.value = false;
    isEditingEmail.value = false;
  })();
  return result;
}

defineExpose({ savePersonneMorale });
</script>

<style scoped>
dl {
  display: grid;
  grid-template-columns: 220px 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;
  margin: 0;
}
dd {
  padding-left: 0;
}
.full-width {
  grid-column: 1 / span 2;
}
</style>
