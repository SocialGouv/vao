<template>
  <div>
    <h1>
      Fiche territoire
      {{ titleTerritoire }}
    </h1>
    <div class="fr-fieldset__element fr-col-sm-8">
      <h3>Référent VAO du territoire</h3>
      <div class="fr-input-group">
        <DsfrInputGroup
          :error-message="nomErrorMessage"
          :model-value="nom"
          type="text"
          label="Nom"
          name="nom"
          :disabled="!isModifiable"
          :required="true"
          :label-visible="true"
          placeholder=""
          hint="Veuillez saisir le nom du correspondant VAO. Exemple Dupont"
          :is-valid="nomMeta.valid"
          @update:model-value="onNomChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element fr-col-sm-8">
      <div class="fr-input-group">
        <DsfrInputGroup
          :error-message="prenomErrorMessage"
          :model-value="prenom"
          type="text"
          label="Prénom"
          name="prenom"
          :disabled="!isModifiable"
          :required="true"
          :label-visible="true"
          hint="Veuillez saisir le prénom du correspondant VAO. Exemple Céline"
          placeholder=""
          :is-valid="prenomMeta.valid"
          @update:model-value="onPrenomChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element fr-col-sm-8">
      <div class="fr-input-group">
        <DsfrInputGroup
          :error-message="emailErrorMessage"
          :model-value="email"
          type="text"
          label="Boite fonctionnelle du service VAO"
          name="email"
          :disabled="!isModifiable"
          :required="true"
          :label-visible="true"
          placeholder=""
          hint="Veuillez saisir l’adresse email du service VAO. Exemple: nom@domaine.fr"
          :is-valid="emailMeta.valid"
          @update:model-value="onEmailChange"
        />
      </div>
    </div>
    <div class="fr-fieldset__element fr-col-sm-8">
      <div class="fr-input-group">
        <DsfrInputGroup
          :error-message="telephoneErrorMessage"
          :model-value="telephone"
          type="text"
          label="Numéro de téléphone"
          name="telephone"
          :disabled="!isModifiable"
          :required="true"
          :label-visible="true"
          hint="Veuillez saisir le numéro de téléphone du service VAO. Exemple: 0612345678"
          placeholder=""
          :is-valid="telephoneMeta.valid"
          @update:model-value="onTelephoneChange"
        />
      </div>
      <DsfrButton
        v-if="isModifiable"
        :disabled="!canSubmit"
        @click.prevent="update"
        >Enregistrer
      </DsfrButton>
      <TableFull
        :title="titleUser"
        :headers="headers"
        :data="userStore.users ?? []"
      />
      <DsfrButton @click.prevent="close">Retour</DsfrButton>
    </div>
  </div>
</template>
<script setup>
import { TableFull } from "@vao/shared";
import { useField, useForm } from "vee-validate";
import Territoires from "~/utils/territoires";
import * as yup from "yup";

const validationSchema = yup.object(Territoires.FicheTerritoireSchema);

const toaster = useToaster();

const TerritoireStore = useTerritoireStore();
const route = useRoute();
const log = logger("pages/territoires/[[territoireId]]");
const userStore = useUserStore();
const titleUser = computed(() =>
  !TerritoireStore.territoire
    ? null
    : `Liste des comptes ${TerritoireStore.territoire.type === "DEP" ? "du département" : "de la région et de ses départements"}`,
);
const titleTerritoire = computed(() => {
  if (!TerritoireStore.territoire) {
    return null;
  } else {
    const territoireType =
      TerritoireStore.territoire.type === "DEP"
        ? "du département"
        : "de la région";
    const territoireValue = TerritoireStore.territoire.value;
    const territoireText = TerritoireStore.territoire.text;
    return `${territoireType} ${territoireValue} - ${territoireText}`;
  }
});

const headers = [
  {
    column: "nom",
    text: "Nom",
    sort: true,
  },
  {
    column: "prenom",
    text: "Prénom",
    sort: true,
  },
  {
    column: "email",
    text: "Adresse courriel",
    sort: true,
  },
  {
    column: "territoireCode",
    text: "Territoire",
    sort: true,
  },
];

definePageMeta({
  middleware: ["is-connected"],
});

await chargeTerritoiresAndUsers();

const isModifiable = computed(() => {
  return [
    "FRA",
    TerritoireStore.territoire.value,
    TerritoireStore.territoire.parent,
  ].includes(userStore.user.territoireCode);
});

const initialValues = {
  email: TerritoireStore.territoire?.service_mail ?? "",
  nom: TerritoireStore.territoire?.corresp_vao_nom ?? "",
  prenom: TerritoireStore.territoire?.corresp_vao_prenom ?? "",
  telephone: TerritoireStore.territoire?.service_telephone ?? "",
};

useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const {
  value: email,
  handleChange: onEmailChange,
  errorMessage: emailErrorMessage,
  meta: emailMeta,
} = useField("email");

const {
  value: nom,
  handleChange: onNomChange,
  errorMessage: nomErrorMessage,
  meta: nomMeta,
} = useField("nom");

const {
  value: prenom,
  handleChange: onPrenomChange,
  errorMessage: prenomErrorMessage,
  meta: prenomMeta,
} = useField("prenom");

const {
  value: telephone,
  handleChange: onTelephoneChange,
  errorMessage: telephoneErrorMessage,
  meta: telephoneMeta,
} = useField("telephone");

const canSubmit = computed(() => {
  return (
    emailMeta.valid && nomMeta.valid && prenomMeta.valid && telephoneMeta.valid
  );
});

async function chargeTerritoiresAndUsers() {
  log.i("chargeTerritoiresAndUsers - IN");
  try {
    await TerritoireStore.get(route.params.territoireId);
  } catch (error) {
    log.w("chargeTerritoiresAndUsers: ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la récupération des informations du territoire'`,
    );
  }

  try {
    await userStore.fetchUsersTerritoire(TerritoireStore.territoire.value);
  } catch (error) {
    log.w("chargeTerritoiresAndUsers: ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la récupération de l'utilisateur territoire'`,
    );
  }
}

async function update() {
  log.i("update - IN");
  try {
    const params = JSON.stringify({
      nom: nom.value,
      prenom: prenom.value,
      email: email.value,
      telephone: telephone.value,
      territoire: TerritoireStore.territoire.value,
      parent: TerritoireStore.territoire.parent,
    });
    const response = await TerritoireStore.update(
      route.params.territoireId,
      params,
    );
    toaster.success({
      titleTag: "h2",
      description: `Territoire mis à jour avec succès`,
    });
    log.d("update", { response });
    navigateTo("/territoires/liste");
  } catch (error) {
    log.w("update", { error });
    toaster.error({
      titleTag: "h2",
      description: `Erreur lors de la mise à jour du territoire`,
    });
    throw error;
  } finally {
    log.i("update - DONE");
  }
}

const close = () => {
  navigateTo(`/territoires/liste`);
};
</script>
