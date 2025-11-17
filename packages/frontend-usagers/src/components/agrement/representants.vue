<template>
  <h4 class="fr-text--lg fr-mt-4w">Représentant legal</h4>

  <div v-for="(rep, idx) in representants" :key="idx" class="fr-mb-4w">
    <template v-if="idx > 0">
      <h5 class="fr-text--md fr-mb-1w">Représentant n°{{ idx + 1 }}</h5>
    </template>
    <dl class="fr-text--sm fr-pl-0">
      <dt><strong>Prénom:</strong></dt>
      <dd>{{ rep.prenom || "-" }}</dd>
      <dt><strong>Nom:</strong></dt>
      <dd>{{ rep.nom || "-" }}</dd>
      <dt><strong>Téléphone:</strong></dt>
      <dd>{{ rep.telephoneRepresentant || "-" }}</dd>
      <dt><strong>Email:</strong></dt>
      <dd>{{ rep.emailRepresentant || "-" }}</dd>
      <dt><strong>Adresse du domicile:</strong></dt>
      <dd>
        {{
          rep.adresseDomicile && rep.adresseDomicile.label
            ? rep.adresseDomicile.label
            : rep.adresseDomicile
              ? rep.adresseDomicile
              : "-"
        }}
      </dd>
    </dl>
  </div>

  <div v-for="(form, idx) in addRepresentantForms" :key="idx" class="fr-mt-4w">
    <div class="fr-mb-2w">
      <div class="container-flex-between">
        <h5 class="fr-text--md fr-mb-0">
          Représentant n°
          {{
            representants && Array.isArray(representants)
              ? representants.length + idx + 1
              : idx + 2
          }}
        </h5>
        <DsfrLinkV2 as="button" @click="removeNewRepresentant(idx)">
          Supprimer ce représentant
        </DsfrLinkV2>
      </div>
    </div>
    <form>
      <DsfrInputGroup
        name="prenom"
        label="Prénom"
        :label-visible="true"
        :model-value="form.prenom"
        :is-valid="!form.errors.prenom"
        :error-message="form.errors.prenom"
        hint="Saisissez le premier prénom. Exemple: Pierre"
        @update:model-value="(val) => (form.prenom = val)"
      />
      <DsfrInputGroup
        name="nom"
        label="Nom"
        :label-visible="true"
        :model-value="form.nom"
        :is-valid="!form.errors.nom"
        :error-message="form.errors.nom"
        hint="Saisissez le nom d'usage. Exemple: Dupont"
        @update:model-value="(val) => (form.nom = val)"
      />
      <DsfrInputGroup
        name="telephoneRepresentant"
        label="Téléphone"
        :label-visible="true"
        :model-value="form.telephoneRepresentant"
        :is-valid="!form.errors.telephoneRepresentant"
        :error-message="form.errors.telephoneRepresentant"
        hint="Au format 0X, +33X ou 0033. Exemple : 0612345678"
        @update:model-value="(val) => (form.telephoneRepresentant = val)"
      />
      <DsfrInputGroup
        name="emailRepresentant"
        label="Email"
        :label-visible="true"
        :model-value="form.emailRepresentant"
        :is-valid="!form.errors.emailRepresentant"
        :error-message="form.errors.emailRepresentant"
        hint="Adresse courriel de la personne. Exemple: nom@domaine.fr"
        @update:model-value="(val) => (form.emailRepresentant = val)"
      />
      <SearchAddress
        label="Adresse du domicile"
        :model-value="form.adresseDomicile"
        :error-message="form.errors.adresseDomicile"
        @select="(selected) => onAdresseSelect(form, selected)"
      />
    </form>
  </div>

  <div class="fr-mt-2w">
    <DsfrLinkV2
      as="button"
      class-names="fr-ml-0"
      @click="addNewRepresentantForm()"
    >
      + Ajouter un représentant légal
    </DsfrLinkV2>
  </div>
</template>

<script setup>
import { ref } from "vue";
import * as yup from "yup";
import { DsfrLinkV2 } from "@vao/shared-ui";
import SearchAddress from "@/components/address/search-address.vue";
import { useOrganismeStore } from "@/stores/organisme";

const organismeStore = useOrganismeStore();

const addRepresentantForms = ref([]);

const representants = computed(
  () =>
    organismeStore.organismeCourant?.personneMorale?.representantsLegaux || [],
);

function onAdresseSelect(form, selected) {
  form.adresseDomicile = {
    label: selected.label || "",
    code_insee: selected.codeInsee || "",
    code_postal: selected.codePostal || "",
    long: selected.coordinates ? String(selected.coordinates[0]) : "",
    lat: selected.coordinates ? String(selected.coordinates[1]) : "",
    departement: selected.departement || "",
  };
}

function addNewRepresentantForm() {
  addRepresentantForms.value.push({
    prenom: "",
    nom: "",
    telephoneRepresentant: "",
    emailRepresentant: "",
    adresseDomicile: "",
    errors: {
      prenom: "",
      nom: "",
      telephoneRepresentant: "",
      emailRepresentant: "",
      adresseDomicile: "",
    },
  });
}

function removeNewRepresentant(idx) {
  addRepresentantForms.value.splice(idx, 1);
}

const representantSchema = yup.object({
  prenom: yup.string().required("Le prénom est requis"),
  nom: yup.string().required("Le nom est requis"),
  telephoneRepresentant: yup
    .string()
    .required("Le téléphone est requis")
    .matches(
      /^(\+33|0|0033)[1-9][0-9]{8}$/i, //todo: recup la regex du back ?
      "Format de téléphone invalide (ex: +33122334455 ou 0612345678)",
    ),
  emailRepresentant: yup
    .string()
    .required("L'email est requis")
    .email("Format d'email invalide"),
  adresseDomicile: yup
    .object({
      label: yup.string().required("Le label de l'adresse est requis"),
      code_insee: yup.string().required("Le code INSEE est requis"),
      code_postal: yup.string().required("Le code postal est requis"),
      long: yup.string().required("La longitude est requise"),
      lat: yup.string().required("La latitude est requise"),
      departement: yup.string().required("Le département est requis"),
    })
    .typeError("Veuillez renseigner une adresse valide")
    .required("L'adresse du domicile est requise"),
});

async function validateAndSave() {
  let valid = true;
  for (const form of addRepresentantForms.value) {
    Object.keys(form.errors).forEach((key) => (form.errors[key] = ""));
    try {
      await representantSchema.validate(form, { abortEarly: false });
    } catch (err) {
      valid = false;
      if (err.inner) {
        err.inner.forEach((e) => {
          if (form.errors[e.path] !== undefined) {
            form.errors[e.path] = e.message;
          }
        });
      }
    }
  }
  if (!valid) return false;

  addRepresentantForms.value = [];
  return true;
}

defineExpose({ validateAndSave, addRepresentantForms });
</script>

<style scoped>
.container-flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
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
</style>
