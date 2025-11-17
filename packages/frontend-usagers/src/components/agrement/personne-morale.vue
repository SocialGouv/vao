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
      <dt><strong>Forme juridique:</strong></dt>
      <dd>{{ personneMorale.statut || "-" }}</dd>
      <dt><strong>Statut de l'association:</strong></dt>
      <dd>{{ personneMorale.statut || "-" }}</dd>

      <template v-if="!isEditingTelephone">
        <dt><strong>Téléphone:</strong></dt>
        <dd>
          {{ personneMorale.telephone }}
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
            :model-value="formValues.telephone"
            :is-valid="!errors.telephone"
            :error-message="errors.telephone"
            hint="Au format 0X, +33X ou 0033. Exemple : 0612345678"
            @update:model-value="(val) => (formValues.telephone = val)"
          />
        </dd>
      </template>

      <template v-if="!isEditingEmail">
        <dt><strong>Email:</strong></dt>
        <dd>
          {{ personneMorale.email }}
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
            :model-value="formValues.email"
            :is-valid="!errors.email"
            :error-message="errors.email"
            hint="Adresse courriel de la personne. Exemple: nom@domaine.fr"
            @update:model-value="(val) => (formValues.email = val)"
          />
        </dd>
      </template>
      <dt><strong>Adresse du siège social:</strong></dt>
      <dd>{{ personneMorale.adresse || "-" }}</dd>
    </dl>

    <AgrementRepresentants ref="representantsRef" />
    <h4 class="fr-text--lg fr-mt-4w">Procès verbal</h4>
    <DsfrFileUpload
      v-model="file"
      label="Dernier procès verbal d'assemblée générale "
      :modifiable="true"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { TitleWithIcon, DsfrLinkV2 } from "@vao/shared-ui";
import { useOrganismeStore } from "../../stores/organisme";

import * as yup from "yup";

const representantsRef = ref();

const isEditingTelephone = ref(false);
const isEditingEmail = ref(false);
const file = ref(null);

const organismeStore = useOrganismeStore();

const personneMorale = computed(
  () => organismeStore.organismeCourant?.personneMorale || {},
);

const representants = computed(
  () =>
    organismeStore.organismeCourant?.personneMorale?.representantsLegaux || [],
);

function startEditTelephone() {
  isEditingTelephone.value = true;
}
function startEditEmail() {
  isEditingEmail.value = true;
}

async function validateAndSave() {
  errors.telephone = "";
  errors.email = "";
  errors.adresse = "";
  errors.prenom = "";
  errors.nom = "";

  let valid = true;

  try {
    await schema.validate(formValues, { abortEarly: false });
  } catch (err) {
    valid = false;
    if (err.inner) {
      err.inner.forEach((e) => {
        if (errors[e.path] !== undefined) errors[e.path] = e.message;
      });
    }
  }

  let representantsValid = true;
  let newRepresentantsForms = [];
  if (representantsRef.value?.validateAndSave) {
    newRepresentantsForms = representantsRef.value.addRepresentantForms;
    for (const form of newRepresentantsForms) {
      if (
        typeof form.adresseDomicile !== "object" ||
        !form.adresseDomicile.label ||
        !form.adresseDomicile.code_insee ||
        !form.adresseDomicile.code_postal ||
        !form.adresseDomicile.long ||
        !form.adresseDomicile.lat ||
        !form.adresseDomicile.departement
      ) {
        valid = false;
        form.errors.adresseDomicile = "L'adresse du domicile est incomplète.";
      }
    }
    representantsValid = await representantsRef.value.validateAndSave();
    if (!representantsValid) valid = false;
  }

  if (!valid) return false;

  const newRepresentants = [
    ...representants.value,
    ...newRepresentantsForms.map((form) => ({
      prenom: form.prenom,
      nom: form.nom,
      telephoneRepresentant: form.telephoneRepresentant,
      emailRepresentant: form.emailRepresentant,
      adresseDomicile: form.adresseDomicile,
    })),
  ];

  if (representantsRef.value) {
    representantsRef.value.addRepresentantForms = [];
  }

  await organismeStore.updatePersonneMorale({
    ...personneMorale.value,
    ...formValues,
    representantsLegaux: newRepresentants,
    procesVerbal: file.value,
  });
  return true;
}

defineExpose({ validateAndSave });

const schema = yup.object({
  telephone: yup.string().matches(
    /^(\+33|0|0033)[1-9][0-9]{8}$/i, //todo: recup la regex du back ?
    "Format de téléphone invalide (ex: +33122334455 ou 0612345678)",
  ),
  email: yup.string().email("Format d'email invalide"),
  adresse: yup.string(),
  prenom: yup.string(),
  nom: yup.string(),
});

const formValues = reactive({
  telephone: personneMorale.value.telephone || "",
  email: personneMorale.value.email || "",
  adresse: personneMorale.value.adresse || "",
  prenom: personneMorale.value.prenom || "",
  nom: personneMorale.value.nom || "",
  telephoneRepresentant: personneMorale.value.telephoneRepresentant || "",
  emailRepresentant: personneMorale.value.emailRepresentant || "",
  adresseDomicile: personneMorale.value.adresseDomicile || "",
});

const errors = reactive({
  telephone: "",
  email: "",
  adresse: "",
  prenom: "",
  nom: "",
  telephoneRepresentant: "",
  emailRepresentant: "",
  adresseDomicile: "",
});
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
