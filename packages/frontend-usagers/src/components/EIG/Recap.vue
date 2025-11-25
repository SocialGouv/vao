<template>
  <TitleWithIcon icon="fr-icon-information-fill" :level="2">
    <template #title>
      <h2 class="title-with-icon">Informations de séjour</h2>
    </template>
  </TitleWithIcon>
  <div class="fr-fieldset">
    <FileUpload
      v-model="file"
      :cdn-url="props.cdnUrl"
      :modifiable="eigStore.canModify"
      :label="label"
      hint="Format autorisé : PDF uniquement. Taille maximale : 5 Mo "
    />
  </div>
  <EIGError
    :is-error="
      Object.keys(errors ?? {}).some(
        (err) => err.match('precision') || err.match('type'),
      )
    "
    message="Erreur dans la selection des types"
  ></EIGError>
  <Summary :eig="eigStore.currentEig" env="USAGER" />
  <hr />

  <TitleWithIcon icon="fr-icon-account-pin-circle-fill" :level="2">
    <template #title>
      <h2 class="title-with-icon">Personnel présent lors des événements</h2>
    </template>
  </TitleWithIcon>
  <EIGError
    :is-error="!!errors.personnel"
    :message="` Erreur dans la selection des personnels : ${errors.personnel}`"
  ></EIGError>
  <Personnes
    :personnes="eigStore.currentEig.personnel ?? []"
    :show-adresse="false"
    show-attestation
    show-competence
    show-date-naissance
    :show-email="false"
    :show-fonction="false"
    show-liste-fonction
    show-telephone
    show-button
    validate-on-mount
    :headers="headers"
    :modifiable="false"
    label-bouton-ajouter="Ajouter un personnel"
  />
  <hr class="fr-m-0" />
  <div class="title-with-icon fr-mt-4v fr-mb-6v">
    <!-- todo: a changer après upgrade de la version du dsfr -->
    <span aria-hidden="true" class="custom-svg-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
      >
        <path
          d="M21 3C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.455L2 22.5V4C2 3.44772 2.44772 3 3 3H21ZM10.5153 7.4116C8.72825 8.18684 7.5 9.75543 7.5 11.5052C7.5 12.5 7.77658 13.1137 8.29171 13.6605C8.61598 14.0048 9.12905 14.25 9.66558 14.25C10.6321 14.25 11.4156 13.4665 11.4156 12.5C11.4156 11.5795 10.7045 10.8389 9.80236 10.7553C9.64107 10.7403 9.47827 10.7431 9.32317 10.7645L9.32344 10.6729C9.32873 10.2322 9.4223 8.9333 10.9616 8.1004L10.5153 7.4116ZM15.5153 7.4116C13.7283 8.18684 12.5 9.75543 12.5 11.5052C12.5 12.5 12.7766 13.1137 13.2917 13.6605C13.616 14.0048 14.1291 14.25 14.6656 14.25C15.6321 14.25 16.4156 13.4665 16.4156 12.5C16.4156 11.5795 15.7045 10.8389 14.8024 10.7553C14.6411 10.7403 14.4783 10.7431 14.3232 10.7645L14.3234 10.6729C14.3287 10.2322 14.4223 8.9333 15.9616 8.1004L15.5153 7.4116Z"
        />
      </svg>
    </span>
    <h2>Les faits</h2>
  </div>
  <div class="faits fr-col-12">
    <div class="card">
      <h6>Déroulement des faits (date, heure, circonstance, etc…)</h6>
      <EIGError
        :is-error="!!errors.deroulement"
        :message="` Erreur dans la description du déroulement des faits: ${errors.deroulement}`"
      ></EIGError>
      <article>{{ eigStore.currentEig.deroulement }}</article>
    </div>
    <div class="card">
      <h6>
        Dispositions pour remédier aux carences, abus, ou faire cesser le danger
      </h6>
      <EIGError
        :is-error="!!errors.dispositionRemediation"
        :message="` Erreur dans la description des dispositions pour remédier aux carences, abus, ou faire cesser le danger : ${errors.dispositionRemediation}`"
      ></EIGError>
      <article>{{ eigStore.currentEig.dispositionRemediation }}</article>
    </div>
    <div class="card">
      <h6>
        Dispositions prises à l'égard de la victime, et le cas échéant, de
        l’auteur présumé
      </h6>
      <EIGError
        :is-error="!!errors.dispositionVictimes"
        :message="` Erreur dans la description des dispositions prises à l'égard de la victime : ${errors.dispositionVictimes}`"
      ></EIGError>
      <article>{{ eigStore.currentEig.dispositionVictimes }}</article>
    </div>
    <div class="card">
      <h6>
        Dispositions prises pour l’information des familles, proches ou tuteurs
        légaux
      </h6>
      <EIGError
        :is-error="!!errors.dispositionInformations"
        :message="` Erreur dans la description des dispositions prises pour l’information : ${errors.dispositionInformations}`"
      ></EIGError>
      <article>{{ eigStore.currentEig.dispositionInformations }}</article>
    </div>
  </div>

  <hr class="fr-mb-0" />
  <article>
    <strong>La déclaration de cet incident sera envoyée à:</strong>
    <h6 class="fr-mb-0">DDETS</h6>
    <ul class="fr-mt-0 fr-mb-4w">
      <li v-for="email in eigStore.currentEig.emailsDDETS" :key="email">
        {{ email }}
      </li>
    </ul>
    <h6 class="fr-mb-0">DREETS</h6>
    <ul class="fr-mt-0 fr-mb-4w">
      <li v-for="email in eigStore.currentEig.emailsDREETS" :key="email">
        {{ email }}
      </li>
    </ul>
    <h6 class="fr-mb-0">L'organisme</h6>
    <ul class="fr-mt-0 fr-mb-4w">
      <li v-for="email in eigStore.currentEig.emailsOrganisateur" :key="email">
        {{ email }}
      </li>
    </ul>
    <h6
      v-if="eigStore.currentEig?.emailsOrganisateurSiegeSocial.length > 0"
      class="fr-mb-0"
    >
      L'organisme principal titulaire de l'agrément
    </h6>
    <ul class="fr-mt-0 fr-mb-4w">
      <li
        v-for="email in eigStore.currentEig.emailsOrganisateurSiegeSocial"
        :key="email"
      >
        {{ email }}
      </li>
    </ul>
  </article>
  <!--  TODO: hise in a first time. We keep the logic for later
  <div class="fr-fieldset__element">
      <div class="fr-input-group">
        <DsfrInputGroup
          autocomplete="off"
          type="text"
          name="email-autres-destinataires"
          label="Envoyer la déclaration à d'autres destinataires (optionnel)"
          :label-visible="true"
          hint="Renseigner les adresses mail séparées par des virgules"
          required
          :is-valid="emailAutresDestinatairesMeta.valid"
          :error-message="emailAutresDestinatairesMessage"
          :disabled="!eigStore.canModify"
          :model-value="displayEmailAutresDestinataires"
          @update:model-value="setEmailAutresDestinataires"
        />
      </div>
    </div>
  -->
  <hr />
  <div class="fr-fieldset__element fr-col-12">
    <DsfrCheckbox
      v-model="isAtteste"
      name="attestation.aCertifie"
      :label="`Je soussigné ${userStore.user.nom} ${userStore.user.prenom}, certifie sur l'honneur que les renseignements portés sur cette déclaration sont exacts`"
      :small="true"
      :disabled="!eigStore.canModify"
      @update:model-value="onIsAttesteChange"
    />
  </div>
  <div class="fr-fieldset">
    <DsfrButtonGroup
      v-if="!props.isDownloading"
      :inline-layout-when="true"
      :reverse="true"
    >
      <DsfrButton
        id="previous-step"
        :secondary="true"
        @click.prevent="
          () => {
            emit('previous');
          }
        "
        >Précédent
      </DsfrButton>
      <DsfrButton
        v-if="eigStore.canModify"
        label="Valider"
        :disabled="!meta.valid"
        @click.prevent="finalizeDeclaration"
      />
    </DsfrButtonGroup>
    <is-downloading
      :message="props.message"
      :is-downloading="props.isDownloading"
    />
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { eigSchema, Summary, FileUpload, TitleWithIcon } from "@vao/shared-ui";
import IsDownloading from "~/components/utils/IsDownloading.vue";

const emit = defineEmits(["finalize", "previous"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
  cdnUrl: { type: String, required: false, default: null },
});

const eigStore = useEigStore();
const userStore = useUserStore();

const validationSchema = yup.object(eigSchema.syntheseSchema);
const initialValues = {
  ...eigStore.currentEig,
  file:
    Object.keys(eigStore.currentEig.file).length === 0
      ? null
      : eigStore.currentEig.file,
};

const { meta, errors } = useForm({
  initialValues,
  validationSchema: validationSchema,
  validateOnMount: true,
});

const { value: isAtteste, handleChange: onIsAttesteChange } =
  useField("isAtteste");
const { value: file } = useField("file");
const {
  value: emailAutresDestinataires,
  /*handleChange: onEmailAutresDestinatairesChange,
    errorMessage: emailAutresDestinatairesMessage,
  meta: emailAutresDestinatairesMeta,*/
} = useField("emailAutresDestinataires");

/*const displayEmailAutresDestinataires = computed(() =>
  (emailAutresDestinataires.value ?? []).join(","),
);*/
/*const setEmailAutresDestinataires = (emailsInString) => {
  onEmailAutresDestinatairesChange(
    emailsInString
      .split(",")
      .map((email) => email.trim())
      .filter((e) => e.length > 0),
  );
};*/

const headers = [
  { label: "Nom", value: "nom" },
  { label: "Prénom", value: "prenom" },
  { label: "Date de naissance", value: "dateNaissance" },
  { label: "Téléphone", value: "telephone" },
  { label: "Fonctions", value: "listeFonction" },
];

function finalizeDeclaration() {
  emit("finalize", {
    emailAutresDestinataires: emailAutresDestinataires.value,
    file: file.value,
  });
}
</script>

<style scoped lang="scss">
.stepper-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h6 {
  margin-top: 1.5rem;
  margin-bottom: 0;
}

hr {
  margin: 2rem 0;
}
.card {
  padding: 1.5rem;
  border: 1px solid #cfcfcf;
}

li {
  list-style: inside;
}
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
h2,
.title-with-icon {
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  margin: 0;
}
.faits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
