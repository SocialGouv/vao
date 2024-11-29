<template>
  <div class="fr-container">
    <form>
      <div class="fr-fieldset fr-grid-row fr-grid-row--center fr-my-5v">
        <h1
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          {{ titreForm }}
        </h1>
        <div
          v-if="
            usersStore.user.serviceCompetent === competence.NATIONALE &&
            props.user.id
          "
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div
            v-for="(userInfo, index) in userInfos.split('\n')"
            :key="index"
            style="margin-bottom: 8px"
            v-text="userInfo"
          ></div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="emailErrorMessage"
              :model-value="email"
              type="text"
              label="Adresse courriel"
              name="email"
              :disabled="props.user?.id"
              :required="true"
              :label-visible="true"
              placeholder=""
              hint="Veuillez saisir votre email. Exemple: nom@domaine.fr"
              :is-valid="emailMeta.valid"
              @update:model-value="onEmailChange"
            />
          </div>
        </div>

        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="nomErrorMessage"
              :model-value="nom"
              type="text"
              label="Nom"
              name="nom"
              :disabled="isFormDisabled && !isSameUser"
              :required="true"
              :label-visible="true"
              placeholder=""
              hint="Veuillez saisir votre nom d'usage. Exemple Dupont"
              :is-valid="nomMeta.valid"
              @update:model-value="onNomChange"
            />
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrInputGroup
              :error-message="prenomErrorMessage"
              :model-value="prenom"
              type="text"
              label="Prénom"
              name="prenom"
              :disabled="isFormDisabled && !isSameUser"
              :required="true"
              :label-visible="true"
              hint="Veuillez saisir votre prénom. Exemple: Martin"
              placeholder=""
              :is-valid="prenomMeta.valid"
              @update:model-value="onPrenomChange"
            />
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-fieldset__element">
            <div class="fr-input-group fr-col-12">
              <DsfrRadioButtonSet
                name="competence"
                :disabled="isFormDisabled || isSameUser"
                legend="Type de compétence du service"
                :required="true"
                :model-value="serviceCompetence"
                :options="serviceCompetenceOptions"
                :is-valid="serviceCompetenceMeta.valid"
                :error-message="serviceCompetenceErrorMessage"
                :inline="true"
                @update:model-value="
                  (e) => {
                    onServiceCompetenceChange(e);
                    if (e === competence.NATIONALE) {
                      onTerritoireCodeChange('FRA');
                    }
                  }
                "
              />
            </div>
          </div>
        </div>
        <div
          v-if="serviceCompetence !== competence.NATIONALE"
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-fieldset">
            <div class="fr-fieldset__element">
              <div class="fr-input-group fr-col-6">
                <DsfrSelect
                  v-if="serviceCompetence === competence.DEPARTEMENTALE"
                  :model-value="territoireCode"
                  name="departementTerritoire"
                  :disabled="isFormDisabled || isSameUser"
                  label="Département du service"
                  :required="true"
                  :options="userDepartements"
                  :is-valid="territoireCodeMeta.valid"
                  :error-message="territoireCodeErrorMessage"
                  @update:model-value="onTerritoireCodeChange"
                />
                <DsfrSelect
                  v-if="serviceCompetence === competence.REGIONALE"
                  :model-value="territoireCode"
                  name="regionTerritoire"
                  :disabled="isFormDisabled || isSameUser"
                  label="Région du service"
                  :required="true"
                  :options="userRegions"
                  :is-valid="territoireCodeMeta.valid"
                  :error-message="territoireCodeErrorMessage"
                  @update:model-value="onTerritoireCodeChange"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="serviceCompetence !== competence.NATIONALE"
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div class="fr-input-group">
            <DsfrButton
              :disabled="!territoireCode"
              type="button"
              label="Accéder à la fiche d’informations du territoire"
              primary
              @click="navigateFicheTerritoire"
            />
          </div>
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <DsfrCheckboxSet
            name="roleUtilisateurField"
            :disabled="isFormDisabled || isSameUser"
            legend="Rôle(s) associé(s) à l'utilisateur ?"
            :required="true"
            :model-value="roles"
            :options="roleOptions"
            :is-valid="rolesMeta.valid"
            :inline="false"
            :error-message="rolesErrorMessage"
            @update:model-value="onRolesChange"
          />
        </div>
        <div
          class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
        >
          <div v-if="!props.user?.id">
            <DsfrButton
              :disabled="!meta.dirty || !meta.valid"
              @click.prevent="post"
              >Créer le compte
            </DsfrButton>
          </div>
          <div v-else>
            <div class="fr-fieldset__element">
              <DsfrToggleSwitch
                id="toggle-valide"
                :key="modalOpenCounter"
                :label="isActive ? 'Désactivé' : 'Activé'"
                :model-value="isActive"
                :disabled="
                  !usersStore.user.roles.includes('Desactivation') ||
                  !props.user.editable ||
                  isSameUser
                "
                aria-describedby="toggle-valide"
                @update:model-value="openModal"
              />
              <p v-if="!isActive && props.user.deleted_date">
                Désactivé le
                {{ dayjs(props.user.deleted_date).format("DD/MM/YYYY") }}
              </p>
              <p
                v-if="usersStore.user.roles.includes('Desactivation')"
                id="toggle-valide"
                class="fr-hint-text"
              >
                Compte actif
              </p>
            </div>
            <DsfrButton
              v-if="props.user.editable && !isSameUser"
              :disabled="!meta.dirty || !meta.valid"
              @click.prevent="update"
              >Enregistrer les modifications
            </DsfrButton>
            <DsfrButton
              v-if="isSameUser"
              :disabled="!meta.dirty || !meta.valid"
              @click.prevent="updateMe"
              >Mettre à jour mes informations
            </DsfrButton>
            <DsfrButton
              v-if="!(props.user.editable || isSameUser)"
              @click.prevent="close"
              >Fermer
            </DsfrButton>
          </div>
        </div>
        <div class="fr-messages-group" aria-live="assertive"></div>
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
      <p>{{ popUpParams.msg }}</p>
      <p>Souhaitez vous poursuivre?</p>
    </ValidationModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { DsfrButton, DsfrToggleSwitch } from "@gouvminint/vue-dsfr";
import { ValidationModal } from "@vao/shared";
import { defineProps } from "vue";
import { useField, useForm } from "vee-validate";
import BoUser from "~/utils/bo-user";
import * as yup from "yup";
import { competence } from "~/utils/serviceCompetenceOptions";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

const props = defineProps({ user: { type: Object, default: null } });

onMounted(async () => {
  log.i("Mounted - IN");
  if (!usersStore.user.serviceCompetent) {
    await usersStore.refreshProfile();
  }

  if (props.user?.id) {
    if (!usersStore.user.roles.includes("Desactivation")) {
      roleOptions.pop();
    }
  }
});

const log = logger("pages/comptes/");
const usersStore = useUserStore();
const territoireStore = useTerritoireStore();
const toaster = useToaster();
const config = useRuntimeConfig();
const regionStore = useRegionStore();
regionStore.fetch();
const departementStore = useDepartementStore();
departementStore.fetch();

const dateInscription = computed(() => {
  return `Date d'inscription : ${
    props.user?.createdat
      ? dayjs(props.user.createdat).format("DD/MM/YYYY")
      : ""
  }`;
});

const dateValidation = computed(() => {
  return `Date de validation : ${
    props.user?.validatedat
      ? dayjs(props.user.validatedat).format("DD/MM/YYYY")
      : "Compte non validé"
  }`;
});

const dateDerniereConnexion = computed(() => {
  return props.user?.lastConnectionAt
    ? `Date de dernière connexion : ${dayjs(props.user.lastConnectionAt).format("DD/MM/YYYY")}`
    : ``;
});

const infoDesactivation = computed(() => {
  return props.user?.deleted
    ? `Date de désactivation du compte par ${props.user.deletion_user} : ${dayjs(props.user.deleted_date).format("DD/MM/YYYY")}`
    : ``;
});

const userInfos = computed(() => {
  return [
    dateInscription.value,
    dateValidation.value,
    dateDerniereConnexion.value,
    infoDesactivation.value,
  ]
    .filter(Boolean)
    .join("\n");
});

const userDepartements = computed(() => {
  if (usersStore.user.territoireCode === "FRA" || isFormDisabled.value) {
    return departementStore.departements;
  }

  const departementsByRegion = departementStore.departements.filter(
    (d) => d.region === usersStore.user.territoireCode,
  );
  if (departementsByRegion?.length) {
    return departementsByRegion;
  }
  return (
    departementStore.departements.filter(
      (d) => d.value === usersStore.user.territoireCode,
    ) ?? []
  );
});

const userRegions = computed(() => {
  if (usersStore.user.territoireCode === "FRA" || isFormDisabled.value) {
    return regionStore.regions;
  }
  return (
    regionStore.regions.filter(
      (r) => r.value === usersStore.user.territoireCode,
    ) ?? []
  );
});

const roleOptions = [
  {
    label: "Accès à la consultation et création de comptes",
    name: "Compte",
    value: "Compte",
  },
  {
    label: "Accès en lecture aux déclarations de séjour",
    name: "DemandeSejour_Lecture",
    value: "DemandeSejour_Lecture",
  },
  {
    label: "Accès en lecture/écriture aux déclarations de séjour",
    name: "DemandeSejour_Ecriture",
    value: "DemandeSejour_Ecriture",
  },
  {
    label: "Autorisé à désactiver les comptes",
    name: "Desactivation",
    value: "Desactivation",
  },
];

const titreForm = computed(() => {
  return !props.user?.id
    ? "Création d'un nouvel utilisateur"
    : isSameUser.value
      ? isFormDisabled.value
        ? "Consultation de mon compte"
        : "Modification de mon compte"
      : isFormDisabled.value
        ? "Consultation d'un utilisateur"
        : "Modification d'un utilisateur";
});

const isFormDisabled = computed(() => {
  return (props.user?.id && !props.user?.editable) || !isActive.value;
});

const isSameUser = computed(() => {
  return usersStore.user.id === props.user?.id;
});

const serviceCompetenceOptions = computed(() => {
  if (isFormDisabled.value) {
    return [serviceCompetenceNAT, serviceCompetenceREG, serviceCompetenceDEP];
  }
  if (usersStore.user.serviceCompetent === competence.NATIONALE) {
    return [serviceCompetenceNAT, serviceCompetenceREG, serviceCompetenceDEP];
  }
  if (usersStore.user.serviceCompetent === competence.REGIONALE) {
    return [serviceCompetenceREG, serviceCompetenceDEP];
  }
  return [serviceCompetenceDEP];
});

const getInitialTerritoireCode = (user) => {
  if (!user?.id) {
    return null;
  }

  return user.territoireCode === "FRA"
    ? competence.NATIONALE
    : user.territoireParent === "FRA"
      ? competence.REGIONALE
      : competence.DEPARTEMENTALE;
};

const initialValues = {
  email: props.user?.email ?? "",
  nom: props.user?.nom ?? "",
  prenom: props.user?.prenom ?? "",
  serviceCompetence: getInitialTerritoireCode(props.user),
  territoireCode: props.user?.territoireCode ?? null,
  roles: [...(props.user?.roles ?? [])],
  isActive: !props.user?.deleted ?? true,
};

const validationSchema = yup.object(BoUser.BoUserSchema);

const { meta, values } = useForm({
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
  value: serviceCompetence,
  handleChange: onServiceCompetenceChange,
  errorMessage: serviceCompetenceErrorMessage,
  meta: serviceCompetenceMeta,
} = useField("serviceCompetence");

const {
  value: territoireCode,
  handleChange: onTerritoireCodeChange,
  errorMessage: territoireCodeErrorMessage,
  meta: territoireCodeMeta,
} = useField("territoireCode");

const {
  value: roles,
  handleChange: onRolesChange,
  errorMessage: rolesErrorMessage,
  meta: rolesMeta,
} = useField("roles");

const { value: isActive, handleChange: onIsActiveChange } =
  useField("isActive");

const displayInfos = {
  CreationDoneWithSucces: {
    title: "Le compte a été créé avec succès",
    description:
      "Un courriel a été envoyé à l'utilisateur afin qu'il procède à la validation de son compte Administration VAO.",
    type: "success",
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
      "Une erreur est survenue. Si vous pensez que cette adresse mail est déjà utilisée, indiquez à l'utilisateur d'utiliser la fonction “Mot de passe oublié”",
    type: "error",
  },
};
const displayType = ref("UnexpectedError");

async function navigateFicheTerritoire() {
  const idTerritoire = await territoireStore.getFicheIdByTerritoireCode(
    territoireCode.value,
  );
  navigateTo(`/territoires/${idTerritoire}`);
}

async function close() {
  navigateTo("/comptes/liste");
}

async function post() {
  log.i("post - IN");
  try {
    displayType.value = null;
    const response = await $fetch(config.public.backendUrl + "/bo-user", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        ...values,
        deleted: !values.isActive,
      },
    });
    toaster.success({
      titleTag: "h2",
      title: displayInfos.CreationDoneWithSucces.title,
      description: displayInfos.CreationDoneWithSucces.description,
    });
    log.d("post", { response });
    close();
  } catch (error) {
    log.w("post", { error });
    toaster.error({
      titleTag: "h2",
      title: displayInfos.UnexpectedError.title,
      description: displayInfos.UnexpectedError.description,
    });
  } finally {
    log.i("post - DONE");
  }
}

async function updateMe() {
  log.i("updateMe - IN");
  try {
    displayType.value = null;
    const response = await $fetch(config.public.backendUrl + "/bo-user/me", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: values.nom,
        prenom: values.prenom,
      }),
    });
    await usersStore.refreshProfile();
    toaster.success({
      titleTag: "h2",
      title: displayInfos.UpdateDoneWithSucces.title,
      description: displayInfos.UpdateDoneWithSucces.description,
    });
    close();
    log.d("update", { response });
  } catch (error) {
    log.w("updateME", { error });
    toaster.error({
      titleTag: "h2",
      title: displayInfos.UnexpectedError.title,
      description: displayInfos.UnexpectedError.description,
    });
  } finally {
    log.i("updateMe - DONE");
  }
}

async function update() {
  log.i("update - IN");
  try {
    const response = await $fetch(
      config.public.backendUrl + "/bo-user/" + props.user.id,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          nom: values.nom,
          prenom: values.prenom,
          roles: values.roles,
          territoireCode: values.territoireCode,
          deleted: !values.isActive,
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

const popUpParams = ref(null);
const closeModal = () => (popUpParams.value = null);
const modalOpenCounter = ref(0);

const openModal = (p) => {
  modalOpenCounter.value++;
  popUpParams.value = {
    cb: () => {
      onIsActiveChange(p);
      closeModal();
    },
    msg: p
      ? "Attention, vous vous apprêtez à réactiver ce compte. Voulez vous confirmer cette action?"
      : "Attention, vous vous apprêtez à désactiver ce compte. Voulez vous confirmer cette action?",
  };
};
</script>
