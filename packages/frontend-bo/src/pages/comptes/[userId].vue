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
              <div v-else>
                Modification d'un utilisateur 
              </div>
              </h1>
              <div
                class="fr-fieldset__element fr-col-12 fr-col-sm-8 fr-col-md-8 fr-col-lg-8 fr-col-xl-8"
              >
                <div class="fr-input-group" >
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
                <div v-if="formStatus === formStates.CREATION">
                  <DsfrButton :disabled="!canRegister" @click.prevent="register"
                    >Créer le compte
                  </DsfrButton>
                </div>
                <div v-else>
                  <DsfrButton :disabled="!canRegister" @click.prevent="updater"
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
import { ref } from "vue";
import "@vueform/multiselect/themes/default.css";
//import { useRoute } from 'vue-router'
import { useUserStore } from "~/stores/user";

const route = useRoute();
const log = logger("pages/comptes/creation");
const usersStore = useUserStore();
const searchState = reactive({
  id: null,
  nom: null,
  prenom: null,
  territoire: null,
  valide: true,
  email: null,
});

//const userId = ref(route.params.userId);
const userId = ref(route.params.userId);

// Récupération du paramètre email 
//const email = route.query.email


const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/comptes",
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
  { label: "Accès aux contrôles", name: "Controle" },
  { label: "Accès aux agréments", name: "Agrement" },
  { label: "Accès aux demandes de séjour", name: "DemandeSejour" },
];

const formStates = {
  CREATION: 1,
  EDITION: 2,
  VALIDATED: 3,
};






var formStatus = ref(formStates.CREATION);

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
      "Un courriel a été envoyé à l'utilisarteur afin qu'il procède à la validation de son compte Administration VAO.",
    type: "success",
  },
  UpdateDoneWithSucces: {
    title: "Le compte a été mis à jour avec succès",
    description:
      "Le compte que vous venez de modifier a été enregistré avec succès.",
    type: "success",
  },
  UserAlreadyExistsWithFC: {
    title: "Une erreur est survenue",
    description:
      "Une erreur est survenue. L'utilisateur que vous tentez de crééer existre déjà",
    type: "error",
  },
  UserNotExist: {
    title: "Utilisateur inexistant",
    description:
      "Vous tentez de mettre à jour un utilisateur qui semble avoir été supprimé",
    type: "error",
  },
  DefaultError: {
    title: "Une erreur est survenue",
    description:
      "Une erreur est survenue. Si vous pensez que cette adresse mail est déjà utilisée, indiquez à l'utilisateur d'utiliser la fonction “Mot de passe oublié”",
    type: "error",
  },
};
const displayType = ref("DefaultError");

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
  if (serviceCompetenceField.isValid === true && p === "NAT")
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
    !p || serviceCompetenceField.modelValue === "NAT"
      ? ""
      : serviceCompetenceField.modelValue === "DEP"
        ? "Le département du service doit obligatoirement être renseigné"
        : serviceCompetenceField.modelValue === "REG"
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
    if (serviceCompetenceField.modelValue === "NAT")
      territoireField.modelValue = "FRA";
//    else 
//        territoireField.modelValue = null;
});

onMounted(async () => {
  log.i("Mounted - IN")
  // Mode Edition
  if (userId && userId.value > 0) {
    // Chargement des données utilisateur
    formStatus = ref(formStates.EDITION);

    searchState.id = userId.value
    // Chargement des données à partir du store
    await usersStore.getUser({search: searchState})
    // Chargement des données
    emailField.modelValue = usersStore.userSelected.email
    emailField.isValid = true
    nomField.modelValue = usersStore.userSelected.nom;
    nomField.isValid = true
    prenomField.modelValue = usersStore.userSelected.prenom;
    prenomField.isValid = true
    // Sélection du service de compétence
    if (usersStore.userSelected.territoire === 'FRA')
      serviceCompetenceField.modelValue  = 'NAT'
    else if (usersStore.userSelected.territoireparent === 'FRA') {
      serviceCompetenceField.modelValue  = 'REG';
    }
    else {
      serviceCompetenceField.modelValue  = 'DEP';
    }
    serviceCompetenceField.isValid = true
    territoireField.modelValue = usersStore.userSelected.territoire;
    territoireField.isValid = true
    // Chargement des rôles
    usersStore.userSelected.roles.forEach(role => {
      roleUtilisateurField.modelValue.push(role.role);
    }); 
    roleUtilisateurField.isValid = true
  }
  else 
  {
    // Ecran en mode création
    formStatus = ref(formStates.CREATION);
  }
});



const canRegister = computed(() => {
  return (
    emailField.isValid &&
    nomField.isValid &&
    prenomField.isValid &&
    roleUtilisateurField.isValid &&
    serviceCompetenceField.isValid &&
    territoireField.isValid
  );
});

async function register() {
  formStatus.value = formStates.CREATION;

  log.i("register - IN");
  try {
    displayType.value = null;
    await $fetch(
      config.public.backendUrl + "/bo-authentication/email/register",
      {
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
          territoire: territoireField.modelValue,
        }),
      },
    )
      .then((response) => {
        displayType.value = "CreationDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        log.d("register", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.code;

        log.w("register", { body, codeError });
        switch (codeError) {
          default:
            displayType.value = codeError;
            formStatus.value = formStates.VALIDATED;
            break;
        }
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("register", { error });
    displayType.value = "DefaultError";
    formStatus.value = formStates.SUBMITTED;
  } finally {
    log.i("register - DONE");
  }
}




async function updater() {
  formStatus.value = formStates.CREATION;

  log.i("register - IN");
  try {
    displayType.value = null;
    await $fetch(
      config.public.backendUrl + "/bo-user/update/",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: usersStore.userSelected.id,
          nom: nomField.modelValue,
          prenom: prenomField.modelValue,
          roles: roleUtilisateurField.modelValue,
          territoire: territoireField.modelValue,
        }),
      },
    )
      .then((response) => {
        displayType.value = "UpdateDoneWithSucces";
        formStatus.value = formStates.VALIDATED;
        log.d("register", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.code;

        log.w("register", { body, codeError });
        switch (codeError) {
          default:
            displayType.value = codeError;
            formStatus.value = formStates.VALIDATED;
            break;
        }
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("register", { error });
    displayType.value = "DefaultError";
    formStatus.value = formStates.SUBMITTED;
  } finally {
    log.i("register - DONE");
  }
}
</script>

<style lang="scss" scoped></style>
