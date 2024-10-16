<template>
  <h5>Informations de séjour</h5>
  <EIGError
    :is-error="
      Object.keys(errors ?? {}).some(
        (err) => err.match('precision') || err.match('type'),
      )
    "
    message="Erreur dans la selection des types"
  ></EIGError>
  <Summary :eig="eigStore.currentEig" env="USAGER" />
  <h5>Personnel présent lors des événement</h5>
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
  <h5>Les faits</h5>
  <h6>Déroulement des faits (date, heure, circonstance, etc…)</h6>
  <EIGError
    :is-error="!!errors.deroulement"
    :message="` Erreur dans la description du déroulement des faits: ${errors.deroulement}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.deroulement }}</article>
  <h6>
    Dispositions pour remédier aux carences, abus, ou faire cesser le danger
  </h6>
  <EIGError
    :is-error="!!errors.dispositionRemediation"
    :message="` Erreur dans la description des dispositions pour remédier aux carences, abus, ou faire cesser le danger : ${errors.dispositionRemediation}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.dispositionRemediation }}</article>
  <h6>
    Dispositions prises à l'égard de la victime, et le cas échéant, de l’auteur
    présumé
  </h6>
  <EIGError
    :is-error="!!errors.dispositionVictimes"
    :message="` Erreur dans la description des dispositions prises à l'égard de la victime : ${errors.dispositionVictimes}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.dispositionVictimes }}</article>
  <h6>
    Dispositions prises pour l’information des familles, proches ou tuteurs
    légaux
  </h6>
  <EIGError
    :is-error="!!errors.dispositionInformations"
    :message="` Erreur dans la description des dispositions prises pour l’information : ${errors.dispositionInformations}`"
  ></EIGError>
  <article>{{ eigStore.currentEig.dispositionInformations }}</article>
  <hr />
  <article>
    La déclaration de cet incident sera envoyée à :
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
  <fieldset class="fr-fieldset">
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
  </fieldset>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import { eigSchema, Summary } from "@vao/shared";
import IsDownloading from "~/components/utils/IsDownloading.vue";

const emit = defineEmits(["finalize", "previous"]);

const props = defineProps({
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const eigStore = useEigStore();
const userStore = useUserStore();

const validationSchema = yup.object(eigSchema.syntheseSchema);
const initialValues = {
  ...eigStore.currentEig,
};

const { meta, errors } = useForm({
  initialValues,
  validationSchema: validationSchema,
  validateOnMount: true,
});

const { value: isAtteste, handleChange: onIsAttesteChange } =
  useField("isAtteste");
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
  {
    label: "Nom",
    value: "nom",
  },
  { label: "Prénom", value: "prenom" },
];

function finalizeDeclaration() {
  emit("finalize", {
    emailAutresDestinataires: emailAutresDestinataires.value,
  });
}
</script>

<style scoped lang="scss">
h5 {
  margin-top: 1.5rem;
}

h6 {
  margin-top: 1.5rem;
  margin-bottom: 0;
}

hr {
  border-top: 1px solid black;
  margin: 2rem 0;
}

li {
  list-style: inside;
}
</style>
