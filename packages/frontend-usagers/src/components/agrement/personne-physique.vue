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
        <strong>Nom: </strong>
      </dt>
      <dd>{{ personnePhysique.nom || "-" }}</dd>
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

      <!-- Email -->
      <template v-if="!isEditingEmail">
        <dt>
          <strong>Email: </strong>
        </dt>
        <dd>
          {{ personnePhysique.email }}
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

      <dt>
        <strong>Adresse du siège de ses activité: </strong>
      </dt>
      <dd>{{ personnePhysique.adresseDomicileLabel || "-" }}</dd>
      <dt>
        <strong>Adresse de ses activités: </strong>
      </dt>
      <dd>{{ personnePhysique.adresseSiegeLabel || "-" }}</dd>
    </dl>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { TitleWithIcon, DsfrLinkV2 } from "@vao/shared";
import { useOrganismeStore } from "../../stores/organisme";
import * as yup from "yup";

const organismeStore = useOrganismeStore();

const isEditingEmail = ref(false);
const isEditingTelephone = ref(false);

const personnePhysique = computed(
  () => organismeStore.organismeCourant?.personnePhysique || {},
);

const formValues = reactive({
  telephone: personnePhysique.value.telephone || "",
  email: personnePhysique.value.email || "",
});

const errors = reactive({
  telephone: "",
  email: "",
});

function startEditTelephone() {
  isEditingTelephone.value = true;
}
function startEditEmail() {
  isEditingEmail.value = true;
}

const schema = yup.object({
  telephone: yup.string().matches(
    /^(\+33|0|0033)[1-9][0-9]{8}$/i, //todo: recup la regex du back ?
    "Format de téléphone invalide (ex: +33122334455 ou 0612345678)",
  ),
  email: yup.string().email("Format d'email invalide"),
});

async function validateAndSave() {
  errors.telephone = "";
  errors.email = "";

  try {
    await schema.validate(formValues, { abortEarly: false });
    await organismeStore.updatePersonnePhysique({
      ...personnePhysique.value,
      ...formValues,
    });
    return true;
  } catch (err) {
    if (err.inner) {
      err.inner.forEach((e) => {
        if (errors[e.path] !== undefined) errors[e.path] = e.message;
      });
    }
    return false;
  }
}

defineExpose({ validateAndSave });
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
