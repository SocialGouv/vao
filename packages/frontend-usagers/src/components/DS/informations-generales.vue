<template>
  <div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <div class="fr-col-12">
      <div class="fr-input-group">
        <DsfrInputGroup
          name="libelle"
          label="Titre"
          :label-visible="true"
          :model-value="libelle"
          :readonly="!props.modifiable"
          :is-valid="libelleMeta.valid"
          :error-message="libelleErrorMessage"
          hint="Nom de votre demande de séjour"
          @update:model-value="onLibelleChange"
        />
      </div>
    </div>

    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <DsfrInputGroup
          name="dateDebut"
          type="date"
          label="Date de début"
          :label-visible="true"
          :model-value="dateDebut"
          :readonly="!props.modifiable"
          :is-valid="dateDebutMeta.valid"
          :error-message="dateDebutErrorMessage"
          hint="Date du premier jour du séjour"
          @update:model-value="onDateDebutChange"
        />
      </div>
      <div class="fr-fieldset__element fr-col-6">
        <DsfrInputGroup
          name="dateFin"
          type="date"
          label="Date de fin"
          :label-visible="true"
          :model-value="dateFin"
          :readonly="!props.modifiable"
          :is-valid="dateFinMeta.valid"
          :error-message="dateFinErrorMessage"
          hint="Date de fin du séjour"
          @update:model-value="onDateFinChange"
        />
      </div>
    </div>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="periode"
          label="Période"
          :label-visible="true"
          :model-value="periode"
          :readonly="true"
        />
      </div>
    </div>
    <div class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          v-if="duree > 0"
          name="duree"
          label="Durée du séjour (en jours)"
          :label-visible="true"
          :model-value="duree"
          :readonly="true"
        />
      </div>

      <h3>Responsable de l'organisation du séjour</h3>
      <Personne
        :modifiable="props.modifiable"
        :personne="responsableSejour"
        :show-adresse="true"
        :show-attestation="false"
        :show-competence="false"
        :show-date-naissance="false"
        :show-email="true"
        :show-fonction="true"
        :show-liste-fonction="false"
        :show-telephone="true"
        :show-button="false"
        @update:personne="onResponsableSejourChange"
      ></Personne>
    </div>
    <div
      v-if="organismeStore.organismeCourant.typeOrganisme === 'personne_morale'"
    >
      <h3>Organisme</h3>
      <OrganismePersonneMorale
        :init-data="organismeStore.organismeCourant.personneMorale"
        :show-responsable-sejour="false"
        :show-buttons="false"
        :modifiable="false"
      ></OrganismePersonneMorale>
      <OrganismeEtablissementsSecondaires
        v-if="organismeStore.isSiegeSocial"
        :modifiable="false"
        :show-buttons="false"
      />
    </div>

    <div v-if="props.showButtons" class="fr-fieldset">
      <DsfrButton
        v-if="!props.isDownloading"
        id="next-step"
        label="Suivant"
        :disabled="!meta.valid && props.modifiable"
        @click.prevent="next"
      />
      <is-downloading
        :message="props.message"
        :is-downloading="props.isDownloading"
      />
    </div>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { IsDownloading } from "@vao/shared";

const props = defineProps({
  initData: {
    type: Object,
    required: true,
  },
  modifiable: { type: Boolean, default: true },
  validateOnMount: { type: Boolean, default: false },
  showButtons: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["next", "update"]);

const organismeStore = useOrganismeStore();
const userStore = useUserStore();

const duree = computed(() => {
  const nbjours = dayjs(dateFin.value).diff(dateDebut.value, "day") + 1;
  return nbjours.toString();
});

const periode = computed(() => {
  const moisDebut = dayjs(dateDebut.value).month();
  if (moisDebut < 3) return "hiver";
  if (moisDebut < 6) return "printemps";
  if (moisDebut < 9) return "été";
  if (moisDebut < 12) return "automne";
});

const validationSchema = yup.object(DeclarationSejour.baseSchema);

const initialValues = (() => {
  const responsableSejour =
    props.initData.responsableSejour ??
    (organismeStore.organismeCourant.typeOrganisme === "personne_morale"
      ? organismeStore.organismeCourant.personneMorale.responsableSejour
      : {
          nom: organismeStore.organismeCourant.personnePhysique.nomNaissance,
          prenom: organismeStore.organismeCourant.personnePhysique.prenom,
          fonction: "organisateur de séjour",
          email: userStore.user.email,
          telephone: organismeStore.organismeCourant.personnePhysique.telephone,
          adresse:
            organismeStore.organismeCourant.personnePhysique.adresseSiege,
        });
  return {
    libelle: props.initData.libelle,
    dateDebut: props.initData.dateDebut
      ? dayjs(props.initData.dateDebut).format("YYYY-MM-DD")
      : dayjs().add(2, "month").format("YYYY-MM-DD"),
    dateFin: props.initData.dateFin
      ? dayjs(props.initData.dateFin).format("YYYY-MM-DD")
      : dayjs().add(2, "month").add(7, "day").format("YYYY-MM-DD"),
    responsableSejour,
  };
})();

const { meta, values } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: props.validateOnMount,
});

const {
  value: libelle,
  errorMessage: libelleErrorMessage,
  handleChange: onLibelleChange,
  meta: libelleMeta,
} = useField("libelle");
const {
  value: dateDebut,
  errorMessage: dateDebutErrorMessage,
  handleChange: onDateDebutChange,
  meta: dateDebutMeta,
} = useField("dateDebut");
const {
  value: dateFin,
  errorMessage: dateFinErrorMessage,
  handleChange: onDateFinChange,
  meta: dateFinMeta,
} = useField("dateFin");
const { value: responsableSejour, handleChange: onResponsableSejourChange } =
  useField("responsableSejour");

defineExpose({
  meta,
});

function next() {
  if (!props.modifiable) {
    return emit("next");
  }

  if (!meta.value.dirty) {
    return emit("next");
  }
  emit(
    "update",
    {
      ...values,
    },
    "informationsGenerales",
  );
}
</script>
