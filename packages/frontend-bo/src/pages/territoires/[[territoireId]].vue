<template>
  <div>
    <h4>
      Fiche territoire
      {{
        TerritoireStore.territoire.type === "DEP"
          ? "du département"
          : "de la région"
      }}
      {{ TerritoireStore.territoire.value }} -
      {{ TerritoireStore.territoire.text }}
    </h4>
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
          :disabled="!isModifiable"
          :required="true"
          :label-visible="true"
          placeholder=""
          hint="Veuillez saisir le nom du correspondant VAO. Exemple Dupont"
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
          :disabled="!isModifiable"
          :required="true"
          :label-visible="true"
          placeholder=""
          hint="Veuillez saisir le prénom du correspondant VAO. Exemple Céline"
          :is-valid="prenomField.isValid"
          @update:model-value="checkValidPrenom"
        />
      </div>
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
          :disabled="!isModifiable"
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
          :error-message="telephoneField.errorMessage"
          :model-value="telephoneField.modelValue"
          type="text"
          label="Numéro de téléphone"
          name="telephone"
          :disabled="!isModifiable"
          :label-visible="true"
          hint="Veuillez saisir votre numéro de téléphone. Exemple: 0612345678"
          :is-valid="telephoneField.isValid"
          @update:model-value="checkValidTelephone"
        />
      </div>
      <DsfrButton :disabled="!canSubmit && isModifiable" @click.prevent="update"
        >Enregistrer
      </DsfrButton>
    </div>
  </div>
</template>
<script setup>
import dayjs from "dayjs";

const TerritoireStore = useTerritoireStore();
const route = useRoute();
const log = logger("pages/territoires/[[territoireId]]");
const userStore = useUserStore();

const displayType = ref(null);

definePageMeta({
  middleware: ["is-connected"],
});

await TerritoireStore.get(route.params.territoireId);

const isModifiable =
  userStore.user.territoireCode === TerritoireStore.territoire.value;

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

const emailField = reactive({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});

const telephoneField = reactive({
  errorMessage: "",
  modelValue: null,
  isValid: false,
});

function checkValidEmail(email) {
  emailField.modelValue = email;
  emailField.isValid = !email || regex.emailRegex.test(email);
  emailField.errorMessage =
    !email || emailField.isValid ? "" : "Cet email semble incorrect";

  console.log("emailField.isValid : ", emailField.isValid);
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
  console.log("nomField.isValid : ", nomField.isValid);
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

  console.log("prenomField.isValid : ", prenomField.isValid);
}

function checkValidTelephone(p) {
  telephoneField.modelValue = p;
  telephoneField.isValid = p !== null && regex.numTelephoneRegex.test(p);
  telephoneField.errorMessage =
    !p || telephoneField.isValid
      ? ""
      : "Le numéro de téléphone n'est pas au format attendu";
  console.log("telephoneField.isValid : ", telephoneField.isValid);
}

const canSubmit = computed(() => {
  console.log("canSubmit");
  return (
    emailField.isValid &&
    nomField.isValid &&
    prenomField.isValid &&
    telephoneField.isValid
  );
});

async function update() {
  log.i("update - IN");
  try {
    console.log(
      "update : route.params.territoireId : ",
      route.params.territoireId,
    );
    await $fetchBackend("/territoire/" + route.params.territoireId, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom: nomField.modelValue,
        prenom: prenomField.modelValue,
        email: emailField.modelValue,
        telephone: telephoneField.modelValue,
        territoire: TerritoireStore.territoire.value,
      }),
    })
      .then((response) => {
        displayType.value = "UpdateDoneWithSucces";
        log.d("update", { response });
      })
      .catch((error) => {
        const body = error.data;
        const codeError = body.name;

        log.w("update", { body, codeError });
        displayType.value = codeError;
        formStatus.value = formStates.SUBMITTED;
      });
  } catch (error) {
    log.w("update", { error });
    displayType.value = "UnexpectedError";
  } finally {
    log.i("update - DONE");
  }
}
onMounted(async () => {
  log.i("Mounted - IN");
  if (TerritoireStore.territoire) {
    checkValidNom(TerritoireStore.territoire.corresp_vao_nom);
    checkValidPrenom(TerritoireStore.territoire.corresp_vao_prenom);
    checkValidEmail(TerritoireStore.territoire.service_mail);
    checkValidTelephone(TerritoireStore.territoire.service_telephone);
  }
  log.i("Mounted - DONE");
});
</script>
