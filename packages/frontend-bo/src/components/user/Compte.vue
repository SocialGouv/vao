<template>
  <div class="fr-container">
    <div>
      <div>
        <div
          v-if="
            formStatus === formStates.VALIDATED ||
            formStatus === formStates.SUBMITTED
          "
          class="fr-grid-row fr-grid-row--center fr-my-5v fr-col-12"
        >
          <DsfrAlert
            :role="
              displayType === 'CreationDoneWithSucces' ? 'status' : 'alert'
            "
            :title="displayInfos[displayType].title"
            :description="displayInfos[displayType].description"
            :type="displayInfos[displayType].type"
            :closeable="false"
          />
        </div>
        <div v-else>
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
                    :error-message="emailField.errorMessage"
                    :model-value="emailField.modelValue"
                    type="text"
                    label="Adresse courriel"
                    name="email"
                    :disabled="formStatus === formStates.EDITION"
                    :required="true"
                    :label-visible="true"
                    placeholder=""
                    hint="Veuillez saisir votre email. Exemple: nom@domaine.fr"
                    :is-valid="emailField.isValid"
                    @update:model-value="checkValidEmail"
                  />
                </div>
              </div>

              <div
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div class="fr-input-group">
                  <DsfrInputGroup
                    :error-message="nomField.errorMessage"
                    :model-value="nomField.modelValue"
                    type="text"
                    label="Nom"
                    name="nom"
                    :disabled="isFormDisabled && !isSameUser"
                    :required="true"
                    :label-visible="true"
                    placeholder=""
                    hint="Veuillez saisir votre nom d'usage. Exemple Dupont"
                    :is-valid="nomField.isValid"
                    @update:model-value="checkValidNom"
                  />
                </div>
              </div>
              <div
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div class="fr-input-group">
                  <DsfrInputGroup
                    :error-message="prenomField.errorMessage"
                    :model-value="prenomField.modelValue"
                    type="text"
                    label="Prénom"
                    name="prenom"
                    :disabled="isFormDisabled && !isSameUser"
                    :required="true"
                    :label-visible="true"
                    hint="Veuillez saisir votre prénom. Exemple: Martin"
                    placeholder=""
                    :is-valid="prenomField.isValid"
                    @update:model-value="checkValidPrenom"
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
                      :model-value="serviceCompetenceField.modelValue"
                      :options="serviceCompetenceOptions"
                      :is-valid="serviceCompetenceField.isValid"
                      :inline="true"
                      @update:model-value="checkValidServiceCompetence"
                    />
                  </div>
                </div>
              </div>
              <div
                v-if="
                  !serviceCompetenceField.modelValue ||
                  serviceCompetenceField.modelValue != 'FRA'
                "
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div class="fr-fieldset">
                  <div class="fr-fieldset__element">
                    <div class="fr-input-group fr-col-6">
                      <DsfrSelect
                        v-if="serviceCompetenceField.modelValue === 'DEP'"
                        :model-value="territoireField.modelValue"
                        name="departementTerritoire"
                        :disabled="isFormDisabled || isSameUser"
                        label="Département du service"
                        :required="true"
                        :options="userDepartements"
                        :is-valid="territoireField.valid"
                        @update:model-value="checkValidTerritoire"
                      />

                      <DsfrSelect
                        v-if="serviceCompetenceField.modelValue === 'REG'"
                        :model-value="territoireField.modelValue"
                        name="regionTerritoire"
                        :disabled="isFormDisabled || isSameUser"
                        label="Région du service"
                        :required="true"
                        :options="userRegions"
                        :is-valid="territoireField.valid"
                        @update:model-value="checkValidTerritoire"
                      />
                    </div>
                  </div>
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
                  :model-value="roleUtilisateurField.modelValue"
                  :options="roleOptions"
                  :is-valid="roleUtilisateurField.isValid"
                  :inline="false"
                  :error-message="
                    roleUtilisateurField.roleUtilisateurErrorMessage
                  "
                  @update:model-value="checkValidRoleUtilisateur"
                />
              </div>
              <div
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div v-if="formStatus === formStates.CREATION">
                  <DsfrButton :disabled="!canSubmit" @click.prevent="post"
                    >Créer le compte
                  </DsfrButton>
                </div>
                <div v-else>
                  <div class="fr-fieldset__element">
                    <DsfrToggleSwitch
                      id="toggle-valide"
                      :key="modalOpenCounter"
                      :label="actifField.modelValue ? 'Activé' : 'Désactivé'"
                      :model-value="actifField.modelValue"
                      :disabled="
                        !usersStore.user.roles.includes('Desactivation') ||
                        !props.user.editable ||
                        isSameUser
                      "
                      aria-describedby="toggle-valide"
                      @update:model-value="openModal"
                    />
                    <p v-if="!actifField.modelValue && props.user.deleted_date">
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
                    :disabled="!canSubmit"
                    @click.prevent="update"
                    >Enregistrer les modifications
                  </DsfrButton>
                  <DsfrButton
                    v-if="isSameUser"
                    :disabled="!canSubmit"
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
        </div>
      </div>
    </div>
    <ValidationModal
      modal-ref="modal-toggle-bo-user-actif"
      name="modal-toggle-bo-user-actif"
      :opened="popUpParams != null"
      :title="
        actifField.modelValue
          ? 'Désactivation du compte ?'
          : 'Activation du compte'
      "
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

const log = logger("pages/comptes/");
const usersStore = useUserStore();

const props = defineProps({ user: { type: Object, default: null } });

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

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
    .filter(Boolean) // Ignore les champs vides
    .join("\n"); // Ajoute un saut de ligne entre chaque champ non vide
});

/*

{{ dateInscription }}
                {{ dateValidation }}
                {{ dateDerniereConnexion }}
                {{ infoDesactivation }}
                Date d'inscription :
                {{ dayjs(props.user.createdat).format("DD/MM/YYYY") }}<br />
                Date de validation : {{ dateValidation }}
                <br />
                <span v-if="props.user.lastConnectionAt">
                  Date de dernière connexion :
                  {{ dayjs(props.user.lastConnectionAt).format("DD/MM/YYYY") }}
                  <br />
                </span>
                <span v-if="props.user.deleted">
                  Date de désactivation du compte par
                  {{ props.user.deletion_user }} :
                  {{ dayjs(props.user.deleted_date).format("DD/MM/YYYY") }}
                  <br />
                </span>
*/

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
  { label: "Accès à la consultation et création de comptes", name: "Compte" },
  //{ label: "Accès aux contrôles", name: "Controle" },
  //{ label: "Accès aux agréments", name: "Agrement" },
  {
    label: "Accès en lecture aux déclarations de séjour",
    name: "DemandeSejour_Lecture",
  },
  {
    label: "Accès en lecture/écriture aux déclarations de séjour",
    name: "DemandeSejour_Ecriture",
  },
  {
    label: "Autorisé à désactiver les comptes",
    name: "Desactivation",
  },
];

const formStates = {
  CREATION: 1,
  EDITION: 2,
  VALIDATED: 3,
};

let formStatus = ref(formStates.CREATION);

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
  return (props.user?.id && !props.user?.editable) || !actifField.modelValue;
});

const isSameUser = computed(() => {
  return usersStore.user.id == props.user?.id;
});

let serviceCompetenceOptions = [];

const emailField = reactive({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const nomField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const prenomField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const serviceCompetenceField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const territoireField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

const roleUtilisateurField = reactive({
  errorMessage: "",
  modelValue: [],
  isValid: false,
});

const actifField = reactive({
  errorMessage: "",
  modelValue: true,
  isValid: true,
});

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
  UserAlreadyExists: {
    title: "Une erreur est survenue",
    description:
      "Une erreur est survenue. L'utilisateur que vous tentez de créer existe déjà",
    type: "error",
  },
  UserNotFound: {
    title: "Utilisateur inexistant",
    description:
      "Vous tentez de mettre à jour un utilisateur qui semble avoir été supprimé",
    type: "error",
  },
  UnexpectedError: {
    title: "Une erreur est survenue",
    description:
      "Une erreur est survenue. Si vous pensez que cette adresse mail est déjà utilisée, indiquez à l'utilisateur d'utiliser la fonction “Mot de passe oublié”",
    type: "error",
  },
};
const displayType = ref("UnexpectedError");

function checkValidEmail(email) {
  emailField.modelValue = email;
  emailField.isValid = !email || regex.emailRegex.test(email);
  emailField.errorMessage =
    !email || emailField.isValid ? "" : "Cet email semble incorrect";
}

function checkValidNom(n) {
  nomField.modelValue = n;
  nomField.isValid =
    n !== null &&
    regex.acceptedCharsRegex.test(n) &&
    !regex.doubleSpacesRegex.test(n) &&
    !regex.spaceFollowingDashRegex.test(n) &&
    !regex.tripleDashRegex.test(n);
  nomField.errorMessage =
    !n || nomField.isValid ? "" : "Le nom contient des caractères incorrects";
}

function checkValidPrenom(p) {
  prenomField.modelValue = p;
  prenomField.isValid =
    p !== null &&
    regex.acceptedCharsRegex.test(p) &&
    !regex.doubleSpacesRegex.test(p) &&
    !regex.spaceFollowingDashRegex.test(p) &&
    !regex.doubleDashRegex.test(p);
  prenomField.errorMessage =
    !p || prenomField.isValid
      ? ""
      : "Le prénom contient des caractères incorrects";
}

function checkValidServiceCompetence(p) {
  log.d("checkValidServiceCompetence : p = ", p);
  serviceCompetenceField.modelValue = p;
  serviceCompetenceField.isValid = p !== null;
  if (serviceCompetenceField.isValid === true && p === competence.NATIONALE)
    territoireField.isValid = true;
  else territoireField.isValid = false;
  serviceCompetenceField.errorMessage =
    !p || serviceCompetenceField.isValid
      ? ""
      : "La compétence du service doit obligatoirement être sélectionnée";
}

function checkValidTerritoire(p) {
  territoireField.modelValue = p;
  territoireField.isValid = p !== null;
  territoireField.errorMessage =
    !p || serviceCompetenceField.modelValue === competence.NATIONALE
      ? ""
      : serviceCompetenceField.modelValue === competence.DEPARTEMENTALE
        ? "Le département du service doit obligatoirement être renseigné"
        : serviceCompetenceField.modelValue === competence.REGIONALE
          ? "La région du service doit obligatoirement être renseignée"
          : "";
}

function checkValidRoleUtilisateur(p) {
  roleUtilisateurField.modelValue = p;
  roleUtilisateurField.isValid = p.length > 0;
  roleUtilisateurField.errorMessage =
    !p || roleUtilisateurField.isValid
      ? ""
      : "Au moins un rôle doit être affecté à l'utilisateur";
}

function checkValidDeleted(p) {
  actifField.modelValue = p;
  actifField.isValid = true;
  actifField.errorMessage =
    !p || actifField.isValid
      ? ""
      : "L'activation  doit obligatoirement avoir une valeur";
}

watch([() => serviceCompetenceField.modelValue], function () {
  if (serviceCompetenceField.modelValue === competence.NATIONALE)
    territoireField.modelValue = "FRA";
  //    else
  //        territoireField.modelValue = null;
});

onMounted(async () => {
  log.i("Mounted - IN");
  serviceCompetenceOptions = [];
  if (!usersStore.user.serviceCompetent) {
    await usersStore.refreshProfile();
  }
  if (isFormDisabled.value) {
    serviceCompetenceOptions.push(serviceCompetenceNAT);
    serviceCompetenceOptions.push(serviceCompetenceREG);
  } else {
    if (usersStore.user.serviceCompetent === competence.NATIONALE) {
      serviceCompetenceOptions.push(serviceCompetenceNAT);
    }
    if (
      usersStore.user.serviceCompetent === competence.NATIONALE ||
      usersStore.user.serviceCompetent === competence.REGIONALE
    ) {
      serviceCompetenceOptions.push(serviceCompetenceREG);
    }
  }
  serviceCompetenceOptions.push(serviceCompetenceDEP);
  // Mode Edition
  if (props.user?.id) {
    // Chargement des données utilisateur
    formStatus = ref(formStates.EDITION);

    // Chargement des données
    actifField.modelValue = !props.user.deleted;
    actifField.isValid = true;
    emailField.modelValue = props.user.email;
    emailField.isValid = true;
    nomField.modelValue = props.user.nom;
    nomField.isValid = true;
    prenomField.modelValue = props.user.prenom;
    prenomField.isValid = true;
    // Sélection du service de compétence
    if (props.user.territoireCode === "FRA")
      serviceCompetenceField.modelValue = competence.NATIONALE;
    else if (props.user.territoireParent === "FRA") {
      serviceCompetenceField.modelValue = competence.REGIONALE;
    } else {
      serviceCompetenceField.modelValue = competence.DEPARTEMENTALE;
    }
    serviceCompetenceField.isValid = true;
    territoireField.modelValue = props.user.territoireCode;
    territoireField.isValid = true;
    // Chargement des rôles
    props.user.roles.forEach((role) => {
      roleUtilisateurField.modelValue.push(role);
    });
    // Suppression du rôle "Autorisé à désactiver les comptes" si l'a pas le droit lui même de le faire
    if (!usersStore.user.roles.includes("Desactivation")) {
      roleOptions.pop();
    }
    roleUtilisateurField.isValid = true;
  } else {
    // Ecran en mode création
    formStatus = ref(formStates.CREATION);
    actifField.modelValue = true;
  }
});

const canSubmit = computed(() => {
  return (
    emailField.isValid &&
    nomField.isValid &&
    prenomField.isValid &&
    roleUtilisateurField.isValid &&
    serviceCompetenceField.isValid &&
    territoireField.isValid &&
    actifField.isValid
  );
});

async function post() {
  formStatus.value = formStates.CREATION;

  log.i("post - IN");
  try {
    displayType.value = null;
    await $fetch(config.public.backendUrl + "/bo-user", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailField.modelValue,
        nom: nomField.modelValue,
        prenom: prenomField.modelValue,
        roles: roleUtilisateurField.modelValue,
        territoireCode: territoireField.modelValue,
        deleted: actifField.modelValue,
      }),
    })
      .then((response) => {
        displayType.value = "CreationDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        log.d("post", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.name;

        log.w("post", { body, codeError });
        switch (codeError) {
          default:
            displayType.value = codeError;
            formStatus.value = formStates.VALIDATED;
            break;
        }
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("post", { error });
    displayType.value = "UnexpectedError";
    formStatus.value = formStates.SUBMITTED;
  } finally {
    log.i("post - DONE");
  }
}

async function close() {
  navigateTo("/comptes/liste");
}

async function updateMe() {
  formStatus.value = formStates.CREATION;

  log.i("updateMe - IN");
  try {
    displayType.value = null;
    await $fetch(config.public.backendUrl + "/bo-user/me", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: nomField.modelValue,
        prenom: prenomField.modelValue,
      }),
    })
      .then((response) => {
        displayType.value = "UpdateDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        usersStore.refreshProfile();
        log.d("updateMe", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.name;

        log.w("updateMe", { body, codeError });
        switch (codeError) {
          default:
            displayType.value = codeError;
            formStatus.value = formStates.VALIDATED;
            break;
        }
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("updateMe", { error });
    displayType.value = "UnexpectedError";
    formStatus.value = formStates.SUBMITTED;
  } finally {
    log.i("updateMe - DONE");
  }
}

async function update() {
  formStatus.value = formStates.CREATION;

  log.i("update - IN");
  try {
    displayType.value = null;
    await $fetch(config.public.backendUrl + "/bo-user/" + props.user.id, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: nomField.modelValue,
        prenom: prenomField.modelValue,
        roles: roleUtilisateurField.modelValue,
        territoireCode: territoireField.modelValue,
        deleted: !actifField.modelValue,
      }),
    })
      .then((response) => {
        displayType.value = "UpdateDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        log.d("update", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.name;

        log.w("update", { body, codeError });
        switch (codeError) {
          default:
            displayType.value = codeError;
            formStatus.value = formStates.VALIDATED;
            break;
        }
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("update", { error });
    displayType.value = "UnexpectedError";
    formStatus.value = formStates.SUBMITTED;
  } finally {
    log.i("update - DONE");
  }
}

const popUpParams = ref(null);
const closeModal = () => (popUpParams.value = null);
const modalOpenCounter = ref(0);

const openModal = (p) => {
  modalOpenCounter.value++;
  popUpParams.value = {
    cb: () => {
      checkValidDeleted(p);
      closeModal();
    },
    msg: p
      ? "Attention, vous vous apprêtez à réactiver ce compte. Voulez vous confirmer cette action?"
      : "Attention, vous vous apprêtez à désactiver ce compte. Voulez vous confirmer cette action?",
  };
};
</script>
