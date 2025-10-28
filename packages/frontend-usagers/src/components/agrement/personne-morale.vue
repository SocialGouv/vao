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
      <dd>{{ personneMorale.denominationSociale }}</dd>
      <dt><strong>Forme juridique:</strong></dt>
      <dd>{{ personneMorale.formeJuridique }}</dd>
      <dt><strong>Statut de l'organisme:</strong></dt>
      <dd>{{ personneMorale.statutOrganisme }}</dd>

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

      <template v-if="!isEditingAdresseSiege">
        <dt><strong>Adresse du siège social:</strong></dt>
        <dd>
          {{ personneMorale.adresseSiege }}
          <DsfrLinkV2
            as="button"
            icon-name="icon-edit-line"
            @click="startEditAdresseSiege"
            >modifier</DsfrLinkV2
          >
        </dd>
      </template>
      <template v-else>
        <dd class="full-width">
          <DsfrInputGroup
            name="adresseSiege"
            label="Adresse du siège social"
            :label-visible="true"
            :model-value="formValues.adresseSiege"
            :is-valid="!errors.adresseSiege"
            :error-message="errors.adresseSiege"
            @update:model-value="(val) => (formValues.adresseSiege = val)"
          />
        </dd>
      </template>
    </dl>

    <AgrementRepresentants ref="representantsRef" />
  </div>
</template>

<script setup>
const representantsRef = ref();

import { ref } from "vue";
import { TitleWithIcon, DsfrLinkV2 } from "@vao/shared";

const isEditingTelephone = ref(false);
const isEditingEmail = ref(false);
const isEditingAdresseSiege = ref(false);

function startEditTelephone() {
  isEditingTelephone.value = true;
}
function startEditEmail() {
  isEditingEmail.value = true;
}
function startEditAdresseSiege() {
  isEditingAdresseSiege.value = true;
}
async function validateAndSave() {
  errors.telephone = "";
  errors.email = "";
  errors.adresseSiege = "";
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

  // Validation des nouveaux représentants via la ref
  let representantsValid = true;
  let newRepresentantsForms = [];
  if (representantsRef.value?.validateAndSave) {
    // Vérifie la structure de chaque adresse avant validation
    newRepresentantsForms = representantsRef.value.addRepresentantForms;
    for (const form of newRepresentantsForms) {
      // Vérifie la structure transformée par le composant enfant
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

  // Fusionne les représentants existants et nouveaux
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

  // Vide les formulaires d'ajout dans le composant enfant
  if (representantsRef.value) {
    representantsRef.value.addRepresentantForms = [];
  }

  // Met à jour le store via l'action du store
  await agrementStore.updatePersonneMorale(personneMorale.value.id, {
    ...personneMorale.value,
    ...formValues,
    representants: newRepresentants,
  });
  return true;
}

// Expose la méthode au parent
defineExpose({ validateAndSave });
import * as yup from "yup";

const schema = yup.object({
  telephone: yup
    .string()
    .required("Le téléphone est requis")
    .matches(
      /^(\+33|0|0033)[1-9][0-9]{8}$/i, //todo: recup la regex du back ?
      "Format de téléphone invalide (ex: +33122334455 ou 0612345678)",
    ),
  email: yup
    .string()
    .required("L'email est requis")
    .email("Format d'email invalide"),
  adresseSiege: yup.string().required("L'adresse du siège social est requise"),
  prenom: yup.string().required("Le prénom est requis"),
  nom: yup.string().required("Le nom est requis"),
});
const agrementStore = useAgrementStore();
const { personneMorale, representants } = storeToRefs(agrementStore);

// Compute the next representative number (assuming personneMorale.representants is an array)
// Removed unused nextRepresentantNumber

import { reactive } from "vue";

const formValues = reactive({
  telephone: personneMorale.value.telephone || "",
  email: personneMorale.value.email || "",
  adresseSiege: personneMorale.value.adresseSiege || "",
  prenom: personneMorale.value.prenom || "",
  nom: personneMorale.value.nom || "",
  telephoneRepresentant: personneMorale.value.telephoneRepresentant || "",
  emailRepresentant: personneMorale.value.emailRepresentant || "",
  adresseDomicile: personneMorale.value.adresseDomicile || "",
});

const errors = reactive({
  telephone: "",
  email: "",
  adresseSiege: "",
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
