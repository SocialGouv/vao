<template>
  <div class="fr-col-10">
    <TitleWithIcon
      icon="fr-icon-account-pin-circle-fill"
      :level="3"
      title-class="fr-text--lead fr-mb-0"
    >
      Personne physique
    </TitleWithIcon>
    <dl>
      <dt>
        <strong>Prénom: </strong>
      </dt>
      <dd>{{ personnePhysique.prenom || "-" }}</dd>
      <dt>
        <strong>Nom de naissance: </strong>
      </dt>
      <dd>{{ personnePhysique.nomNaissance || "-" }}</dd>
      <dt>
        <strong>Nom d'usage: </strong>
      </dt>
      <dd>{{ personnePhysique.nomUsage || "-" }}</dd>
      <dt>
        <strong>Profession: </strong>
      </dt>
      <dd>{{ personnePhysique.profession || "-" }}</dd>

      <template v-if="!isEditingTelephone">
        <dt>
          <strong>Téléphone: </strong>
        </dt>
        <dd>
          {{ personnePhysique.telephone || "-" }}
          <DsfrLinkV2
            v-if="modifiable"
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

      <dt>
        <strong>Adresse du siège de ses activité: </strong>
      </dt>
      <dd>{{ personnePhysique.adresseDomicile.label || "-" }}</dd>
      <dt>
        <strong>Adresse de ses activités: </strong>
      </dt>
      <dd>{{ personnePhysique.adresseSiege.label || "-" }}</dd>
    </dl>
  </div>
  <DsfrAlert
    v-if="warnings.length > 0"
    role="status"
    class="fr-mt-2w"
    type="warning"
    :closeable="false"
  >
    <p>Certaines informations sont manquantes en base de données :</p>
    <ul>
      <li v-for="warning in warnings" :key="warning">
        {{ warning }}
      </li>
    </ul>
  </DsfrAlert>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { TitleWithIcon, DsfrLinkV2 } from "@vao/shared-ui";
import { AGREMENT_STATUT } from "@vao/shared-bridge";
import type { PersonnePhysiqueDto } from "@vao/shared-bridge";
import { telephoneYupNullable } from "@/utils/telephoneValidators";
import { requiredUnlessBrouillon } from "@/helpers/requiredUnlessBrouillon";

const props = defineProps({
  initOrganisme: { type: Object, required: true },
  initAgrement: { type: Object, required: true },
  modifiable: { type: Boolean, default: true },
});

const isEditingTelephone = ref(false);

const personnePhysique = computed<PersonnePhysiqueDto>(() => {
  return props.initOrganisme?.personnePhysique || {};
});

const warnings = computed(() => {
  const msgs = [];
  const personnePhysique = props.initOrganisme?.personnePhysique;

  if (!personnePhysique?.nomNaissance) {
    msgs.push("Le nom de naissance est manquant.");
  }
  if (!personnePhysique?.adresseDomicile?.label) {
    msgs.push("L'adresse du domicile est manquante.");
  }
  if (!personnePhysique?.adresseSiege?.label) {
    msgs.push("L'adresse du siège d'activités est manquante.");
  }
  return msgs;
});

const validationSchema = yup.object({
  telephone: requiredUnlessBrouillon(telephoneYupNullable()),
});

const initialValues = {
  statut: props.initAgrement.statut || AGREMENT_STATUT.BROUILLON,
  telephone: props.initOrganisme?.personnePhysique?.telephone || "",
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
} = useField<string | null>("telephone");

function startEditTelephone() {
  isEditingTelephone.value = true;
  setValues({
    ...initialValues,
    telephone: personnePhysique.value.telephone || "",
  });
}

async function savePersonnePhysique() {
  let result = null;
  await handleSubmit((values) => {
    result = {
      ...personnePhysique.value,
      telephone: values.telephone,
    };
    isEditingTelephone.value = false;
  })();
  return result;
}

defineExpose({ savePersonnePhysique });
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
