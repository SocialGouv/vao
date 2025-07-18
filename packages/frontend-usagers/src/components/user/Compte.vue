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
          <DisplayInput
            :value="statutLabel"
            :input="displayInput.IUser['statutLabel']"
          />
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
          <div class="fr-fieldset__element">
            <DsfrToggleSwitch
              id="toggle-valide"
              :label="!isActive ? 'Activer le compte' : 'Désactiver le compte'"
              :model-value="isActive"
              aria-describedby="toggle-valide"
              @update:model-value="openModal"
            />
            <p v-if="true" id="toggle-valide" class="fr-hint-text">
              {{
                statut === statusUser.status.BLOCKED
                  ? "Compte désactivé"
                  : "Compte actif"
              }}
            </p>
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-8 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div>
            <div class="buttons-group">
              <DsfrButton
                v-if="canUpdate"
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
    <ValidationModal
      modal-ref="modal-toggle-bo-user-actif"
      name="modal-toggle-bo-user-actif"
      :opened="popUpParams != null"
      :title="isActive ? 'Désactivation du compte ?' : 'Activation du compte'"
      :on-close="closeModal"
      :on-validate="popUpParams?.cb ?? (() => {})"
      validation-label="Confirmer"
    >
      <p>{{ popUpParams?.msg }}</p>
      <p>Souhaitez vous poursuivre?</p>
    </ValidationModal>
  </div>
</template>

<script setup>
import { DsfrButton } from "@gouvminint/vue-dsfr";
import { DisplayInput, statusUser, ValidationModal } from "@vao/shared";
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

const canUpdate = computed(() =>
  usersStore.user.roles.includes(rolesUtil.EIG_ECRITURE),
);

const canUpdateRole = computed(() => canUpdate && isActive.value);

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

const getStatutLabel = (statutCode) => {
  return statusUser.label.find((item) => item.value === (statutCode ?? ""))
    ?.text;
};

const initialValues = {
  email: props.user?.email ?? "",
  nom: props.user?.nom ?? "",
  prenom: props.user?.prenom ?? "",
  organisme: props.user?.siegeSocial ? "Principal" : "Secondaire",
  statutLabel: getStatutLabel(props.user?.statut),
  statut: props.user?.statut ?? "",
  roleEig: getInitialRoleEig(props.user),
  telephone: props.user?.telephone,
  lastConnectionAt: props.user?.lastConnectionAt ?? "",
  createdAt: props.user?.dateCreation ?? "",
};

const isActive = ref(props.user?.statut !== statusUser.status.BLOCKED);

const validationSchema = yup.object(FoUser.FoUserSchema);

useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
});

const { value: email } = useField("email");
const { value: nom } = useField("nom");
const { value: prenom } = useField("prenom");
const { value: statutLabel } = useField("statutLabel");
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
  LastUserOrgansimeError: {
    title: "Dernier compte actif",
    description:
      "Ce compte est unique au sein de cet organisme. Il n’est pas possible de supprimer ce compte en l’état.",
    type: "error",
  },
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
  try {
    if (props.user.statut !== statut.value) {
      log.d("update : update statut");
      const params = { status: statut.value };
      await usersStore.changeUserStatus(props.user.userId, params);
    }
    if (statut.value === statusUser.status.VALIDATED) {
      log.d("update : update roles");
      await usersStore.updateRole({
        roles: roleEig.value,
        userId: props.user.userId,
      });
    }
    toaster.success({
      titleTag: "h2",
      title: displayInfos.UpdateDoneWithSucces.title,
      description: displayInfos.UpdateDoneWithSucces.description,
    });
    close();
  } catch (error) {
    log.d("update - error", { error });
    if (error?.data?.name === "LastUserOrganisme") {
      toaster.error({
        titleTag: "h2",
        title: displayInfos.LastUserOrgansimeError.title,
        description: displayInfos.LastUserOrgansimeError.description,
      });
    } else {
      toaster.error({
        titleTag: "h2",
        title: displayInfos.UnexpectedError.title,
        description: displayInfos.UnexpectedError.description,
      });
      throw error;
    }
  }
}

const popUpParams = ref(null);
const closeModal = () => (popUpParams.value = null);

const openModal = (p) => {
  popUpParams.value = {
    cb: () => {
      isActive.value = p;
      statutLabel.value = p
        ? getStatutLabel(statusUser.status.VALIDATED)
        : getStatutLabel(statusUser.status.BLOCKED);

      statut.value = p
        ? statusUser.status.VALIDATED
        : statusUser.status.BLOCKED;

      closeModal();
    },
    msg: p
      ? "Attention, vous vous apprêtez à réactiver ce compte. Voulez-vous confirmer cette action ?"
      : "Attention, vous vous apprêtez à désactiver ce compte. Voulez-vous confirmer cette action ?",
  };
};
</script>

<style lang="scss" scoped>
.buttons-group {
  display: flex;
  gap: 1rem;
}
</style>
