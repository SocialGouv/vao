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
            :value="organisme"
            :input="displayInput.IUser['organisme']"
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
          <div>
            <div class="buttons-group">
              <DsfrButton
                v-if="canUpdateRole"
                :disabled="!roleEigMeta.valid"
                label="Enregistrer"
                @click.prevent="update"
              />
              <DsfrButton label="Fermer" @click.prevent="close" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { DsfrButton } from "@gouvminint/vue-dsfr";
import { DisplayInput, statusUser } from "@vao/shared";
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
  organisme: props.user?.siegeSocial ? "Principal" : "Secondaire",
  statut: statusUser.label.find(
    (item) => item.value === (props.user?.statut ?? ""),
  )?.text,
  roleEig: getInitialRoleEig(props.user),
  telephone: props.user?.telephone,
  lastConnectionAt: props.user?.lastConnectionAt ?? "",
  createdAt: props.user?.dateCreation ?? "",
  isActive: !props.user?.deleted ?? true,
};

const validationSchema = yup.object(FoUser.FoUserSchema);

useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const { value: email } = useField("email");
const { value: nom } = useField("nom");
const { value: prenom } = useField("prenom");
const { value: statut } = useField("statut");
const { value: organisme } = useField("organisme");
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
    const response = usersStore.updateRole({
      roles: roleEig.value,
      userId: props.user.userId,
    });
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
.buttons-group {
  display: flex;
  gap: 1rem;
}
</style>
