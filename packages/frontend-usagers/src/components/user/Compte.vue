<template>
  <div class="fr-container">
    <form>
      <div class="fr-fieldset fr-grid-row fr-grid-row--center fr-my-5v">
        <h1
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          Compte utilisateur {{ prenom }} {{ nom }}
        </h1>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <DisplayInput :value="email" :input="displayInput.IUser['email']" />
          <DisplayInput :value="nom" :input="displayInput.IUser['nom']" />
          <DisplayInput :value="prenom" :input="displayInput.IUser['prenom']" />
          <DisplayInput :value="statut" :input="displayInput.IUser['statut']" />
          <DisplayInput
            :value="telephone"
            :input="displayInput.IUser['telephone']"
          />
          <DisplayInput
            :value="createdAt"
            :input="displayInput.IUser['createdAt']"
          />

          <DisplayInput
            :value="lastConnectionAt"
            :input="displayInput.IUser['lastConnectionAt']"
          />
          <DsfrRadioButtonSet
            name="competence"
            :disabled="!canUpdateRole"
            legend="Droits sur les EIG"
            :required="true"
            :model-value="roleEig"
            :options="roleOptions"
            :is-valid="roleEigMeta.valid"
            :error-message="roleEigErrorMessage"
            :inline="true"
            @update:model-value="onRoleEigChange"
          />
        </div>
        <div
          class="fr-fieldset__element fr-col-8 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="button-container">
            <div class="crud-button-container">
              <DsfrButton
                v-if="canUpdateRole"
                :disabled="!roleEigMeta.valid"
                @click.prevent="update"
                >Enregistrer
              </DsfrButton>
              <DsfrButton @click.prevent="close">Fermer</DsfrButton>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { DsfrButton } from "@gouvminint/vue-dsfr";
import { DisplayInput } from "@vao/shared";
import { defineProps } from "vue";
import { useField, useForm } from "vee-validate";
import FoUser from "~/utils/fo-user";
import { ROLES as rolesUtil } from "../../helpers/users";
import * as yup from "yup";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

const props = defineProps({ user: { type: Object, default: null } });
const log = logger("pages/comptes/");
const usersStore = useUserStore();
const toaster = useToaster();
const config = useRuntimeConfig();

const canUpdateRole = computed(() =>
  usersStore.user.roles.includes(rolesUtil.EIG_ECRITURE),
);

const roleOptions = [
  {
    label: "Accès en lecture seule",
    value: rolesUtil.EIG_LECTURE,
  },
  {
    label: "Accès en lecture/écriture",
    value: rolesUtil.EIG_ECRITURE,
  },
  {
    label: "Aucun accès",
    value: "",
  },
];

const getInitialRoleEig = (user) => {
  if (!user?.userId) {
    return null;
  }
  return user.roles.find((r) => Object.values(rolesUtil).includes(r));
};

const initialValues = {
  email: props.user?.email ?? "",
  nom: props.user?.nom ?? "",
  prenom: props.user?.prenom ?? "",
  roleEig: getInitialRoleEig(props.user),
  telephone: props.user?.telephone,
  lastConnectionAt: props.user?.lastConnectionAt ?? "",
  createdAt: props.user?.dateCreation ?? "",
  isActive: !props.user?.deleted ?? true,
};

const validationSchema = yup.object(FoUser.FoUserSchema);

const { values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const { value: email } = useField("email");
const { value: nom } = useField("nom");
const { value: prenom } = useField("prenom");
const { value: telephone } = useField("telephone");
const { value: createdAt } = useField("createdAt");
const { value: lastConnectionAt } = useField("lastConnectionAt");
const {
  value: roleEig,
  handleChange: onRoleEigChange,
  errorMessage: roleEigErrorMessage,
  meta: roleEigMeta,
} = useField("roleEig");

const displayInfos = {
  UpdateDoneWithSucces: {
    title: "Le compte a été mis à jour avec succès",
    description:
      "Le compte que vous venez de modifier a été enregistré avec succès.",
    type: "success",
  },
  UnexpectedError: {
    title: "Une erreur est survenue",
    description:
      "Une erreur est survenue lors de la mise à jour du compte utilisateur",
    type: "error",
  },
};

async function close() {
  navigateTo("/utilisateurs/liste");
}

async function update() {
  log.i("update - IN");
  try {
    const response = await $fetch(
      config.public.backendUrl + `/fo-user/roles/${props.user.userId}`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          roles: [values.roleEig],
        },
      },
    );
    toaster.success({
      titleTag: "h2",
      title: displayInfos.UpdateDoneWithSucces.title,
      description: displayInfos.UpdateDoneWithSucces.description,
    });
    close();
    log.d("update", { response });
  } catch (error) {
    log.d("update - error", { error });
    toaster.error({
      titleTag: "h2",
      title: displayInfos.UnexpectedError.title,
      description: displayInfos.UnexpectedError.description,
    });
  }
}
</script>

<style lang="scss" scoped>
.back-button {
  background-image: none;
}

.button-container {
  display: flex;
  align-items: left;
  justify-content: flex-start;
  padding: 0.5rem;
}

.crud-button-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
}
</style>
