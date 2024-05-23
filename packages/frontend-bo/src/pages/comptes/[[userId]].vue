<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
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
            :title="displayInfos[displayType].title"
            :description="displayInfos[displayType].description"
            :type="displayInfos[displayType].type"
            :closeable="false"
          />
        </div>
        <div v-else>
          <form>
            <fieldset
              class="fr-fieldset fr-grid-row fr-grid-row--center fr-my-5v"
            >
              <h1
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div v-if="formStatus === formStates.CREATION">
                  Création d'un nouvel utilisateur
                </div>
                <div v-else>Modification d'un utilisateur</div>
              </h1>
              <div
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div class="fr-input-group">
                  <DsfrInputGroup
                    :error-message="emailField.errorMessage"
                    :model-value="emailField.modelValue"
                    type="text"
                    label="Email"
                    name="email"
                    :disabled="formStatus === formStates.EDITION"
                    :required="true"
                    :label-visible="true"
                    placeholder="Veuillez saisir votre email"
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
                    :required="true"
                    :label-visible="true"
                    placeholder=""
                    hint="Veuillez saisir votre nom d'usage"
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
                    :required="true"
                    :label-visible="true"
                    hint="Veuillez saisir votre prénom"
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
                <fieldset class="fr-fieldset">
                  <div class="fr-fieldset__element">
                    <div class="fr-input-group fr-col-6">
                      <DsfrSelect
                        v-if="serviceCompetenceField.modelValue === 'DEP'"
                        :model-value="territoireField.modelValue"
                        name="departementTerritoire"
                        label="Département du service"
                        :required="true"
                        :options="departementStore.departements"
                        :is-valid="territoireField.valid"
                        @update:model-value="checkValidTerritoire"
                      />

                      <DsfrSelect
                        v-if="serviceCompetenceField.modelValue === 'REG'"
                        :model-value="territoireField.modelValue"
                        name="regionTerritoire"
                        label="Région du service"
                        :required="true"
                        :options="regionStore.regions"
                        :is-valid="territoireField.valid"
                        @update:model-value="checkValidTerritoire"
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
              <div
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <DsfrCheckboxSet
                  name="roleUtilisateurField"
                  legend="Rôle(s) associé(s) à l'utilisateur ?"
                  :required="true"
                  :model-value="roleUtilisateurField.modelValue"
                  :options="roleOptions"
                  :is-valid="roleUtilisateurField.isValid"
                  :inline="true"
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
                  <DsfrButton :disabled="!canSubmit" @click.prevent="update"
                    >Enregistrer les modifications
                  </DsfrButton>
                </div>
              </div>
              <div class="fr-messages-group" aria-live="assertive"></div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import "@vueform/multiselect/themes/default.css";

const route = useRoute();
const log = logger("pages/comptes/[[userId]]");
const usersStore = useUserStore();
const searchState = reactive({
  id: null,
  nom: null,
  prenom: null,
  territoireCode: null,
  valide: true,
  email: null,
});

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});

const userId = route.params.userId;

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/comptes/liste",
    text: "Comptes",
  },
  {
    text: "Création",
  },
];

const config = useRuntimeConfig();

const regionStore = useRegionStore();
regionStore.fetch();

const departementStore = useDepartementStore();
departementStore.fetch();

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
];

const formStates = {
  CREATION: 1,
  EDITION: 2,
  VALIDATED: 3,
};

let formStatus = ref(formStates.CREATION);
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

watch([() => serviceCompetenceField.modelValue], function () {
  if (serviceCompetenceField.modelValue === competence.NATIONALE)
    territoireField.modelValue = "FRA";
  //    else
  //        territoireField.modelValue = null;
});

onMounted(async () => {
  log.i("Mounted - IN");
  serviceCompetenceOptions = [];
  if (usersStore.user.serviceCompetent === competence.NATIONALE ) 
    serviceCompetenceOptions.push(serviceCompetenceNAT);
  if (usersStore.user.serviceCompetent === competence.NATIONALE || usersStore.user.serviceCompetent === competence.REGIONALE) 
    serviceCompetenceOptions.push(serviceCompetenceREG);
  serviceCompetenceOptions.push(serviceCompetenceDEP);

  // Mode Edition
  if (userId) {
    // Chargement des données utilisateur
    formStatus = ref(formStates.EDITION);

    searchState.id = userId;
    // Chargement des données à partir du store
    await usersStore.getUser(userId);
    // Chargement des données
    emailField.modelValue = usersStore.userSelected.email;
    emailField.isValid = true;
    nomField.modelValue = usersStore.userSelected.nom;
    nomField.isValid = true;
    prenomField.modelValue = usersStore.userSelected.prenom;
    prenomField.isValid = true;
    // Sélection du service de compétence
    if (usersStore.userSelected.territoireCode === "FRA")
      serviceCompetenceField.modelValue = competence.NATIONALE;
    else if (usersStore.userSelected.territoireParent === "FRA") {
      serviceCompetenceField.modelValue = competence.REGIONALE;
    } else {
      serviceCompetenceField.modelValue = competence.DEPARTEMENTALE;
    }
    serviceCompetenceField.isValid = true;
    territoireField.modelValue = usersStore.userSelected.territoireCode;
    territoireField.isValid = true;
    // Chargement des rôles
    usersStore.userSelected.roles.forEach((role) => {
      roleUtilisateurField.modelValue.push(role);
    });
    roleUtilisateurField.isValid = true;
  } else {
    // Ecran en mode création
    formStatus = ref(formStates.CREATION);
  }
});

const canSubmit = computed(() => {
  return (
    emailField.isValid &&
    nomField.isValid &&
    prenomField.isValid &&
    roleUtilisateurField.isValid &&
    serviceCompetenceField.isValid &&
    territoireField.isValid
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

async function update() {
  formStatus.value = formStates.CREATION;

  log.i("update - IN");
  try {
    displayType.value = null;
    await $fetch(
      config.public.backendUrl + "/bo-user/" + usersStore.userSelected.id,
      {
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
        }),
      },
    )
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
</script>

<style lang="scss" scoped></style>
