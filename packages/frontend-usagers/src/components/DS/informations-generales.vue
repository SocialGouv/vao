<template>
  <div>
    <div class="fr-col-12">
      <div class="fr-input-group">
        <DsfrInputGroup
          name="libelle"
          label="Titre"
          :label-visible="true"
          :model-value="libelle"
          :required="true"
          :is-valid="libelleMeta.valid"
          :error-message="libelleErrorMessage"
          hint="nom de votre demande de séjour"
          @update:model-value="onLibelleChange"
        />
      </div>
    </div>

    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <DsfrInputGroup
          name="dateDebut"
          type="date"
          label="Date de début"
          :label-visible="true"
          :model-value="dateDebut"
          :required="true"
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
          :required="true"
          :is-valid="dateFinMeta.valid"
          :error-message="dateFinErrorMessage"
          hint="Date de fin du séjour"
          @update:model-value="onDateFinChange"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          name="periode"
          label="Période"
          :label-visible="true"
          :model-value="saison"
          :disabled="true"
        />
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <DsfrInputGroup
          v-if="duree > 0"
          name="duree"
          label="Durée du séjour (en jours)"
          :label-visible="true"
          :model-value="duree"
          :disabled="true"
        />
      </div>
    </fieldset>
    <div
      v-if="
        operateurStore.operateurCourant?.typeOperateur === 'personne_morale'
      "
    >
      <h6>Responsable de l'organisation du séjour</h6>
      <Personne
        :personne="initialValues.responsableSejour"
        :show-adresse="true"
        :show-telephone="true"
        :show-email="true"
        :show-button="false"
        @update:personne="onResponsableSejourChange"
      ></Personne>
      <h6>Organisme</h6>
      <OperateurPersonneMoraleReadOnly
        :init-data="operateurStore.operateurCourant.personneMorale"
      ></OperateurPersonneMoraleReadOnly>
    </div>
    <DsfrButton label="Suivant" :disabled="!meta.valid" @click="next" />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useOperateurStore } from "@/stores/operateur";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const props = defineProps({
  initData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["valid"]);

const log = logger("components/DS/informations-generales");

const operateurStore = useOperateurStore();

const duree = computed(() => {
  const nbjours = dayjs(dateFin.value).diff(dateDebut.value, "day");
  return nbjours.toString();
});

const saison = computed(() => {
  const moisDebut = dayjs(dateDebut.value).month();
  if (moisDebut < 3) return "hiver";
  if (moisDebut < 6) return "printemps";
  if (moisDebut < 9) return "été";
  if (moisDebut < 12) return "automne";
});

if (!operateurStore.operateurCourant) {
  await operateurStore.setMyOperateur();
}
if (
  operateurStore.operateurCourant.typeOperateur === "personne_morale" &&
  !operateurStore.operateurCourant.personneMorale.siegeSocial
) {
  await checkSiege();
}

const validationSchema = yup.object({
  libelle: yup.string().typeError("le libellé est requis").required(),
  dateDebut: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .min(new Date(), "La date doit être supérieure à la date du jour.")
    .required("La saisie de ce champ est obligatoire"),
  dateFin: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .when("dateDebut", (dateDebut, schema) => {
      return schema.test({
        test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
        message: "La date de fin doit être supérieure à la date de début",
      });
    })
    .required("La saisie de ce champ est obligatoire"),
  responsableSejour: yup
    .object({
      nom: yup.string().required(),
      prenom: yup.string().required(),
      fonction: yup.string().required(),
      adresse: yup.object().required(),
      telephone: yup.string().required(),
      email: yup.string().required(),
    })
    .required(),
});

const initialValues = computed(() => {
  const responsableSejour =
    operateurStore.operateurCourant?.personneMorale?.responsableSejour ?? {};
  return {
    libelle: props.initData.libelle,
    dateDebut: props.initData.dateDebut
      ? dayjs(props.initData.dateDebut).format("YYYY-MM-DD")
      : dayjs().add(1, "day").format("YYYY-MM-DD"),
    dateFin: props.initData.dateFin
      ? dayjs(props.initData.dateFin).format("YYYY-MM-DD")
      : dayjs().add(8, "day").format("YYYY-MM-DD"),
    responsableSejour,
  };
});

const { meta, values } = useForm({
  validationSchema,
  initialValues,
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

async function checkSiege() {
  log.i("IN - checkSiege");
  try {
    const url = `/operateur/siege/${operateurStore.operateurCourant.personneMorale.siret.substring(0, 9)}`;
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    const etablissementPrincipal = data.operateur;
    log.d(etablissementPrincipal);
    if (!etablissementPrincipal || etablissementPrincipal.length === 0) {
      toaster.error(
        "L'établissement principal n'a pas encore déclaré son agrément sur la plateforme VAO.",
      );
      return navigateTo("/");
    }
  } catch (error) {
    log.w(error);
  }
}

function next() {
  const organismeData = operateurStore.operateurCourant.personneMorale;
  organismeData.responsableSejour = responsableSejour.value;
  emit(
    "valid",
    {
      ...values,
      duree: duree.value,
      periode: saison.value,
      organisme: organismeData,
    },
    "informationsGenerales",
  );
}
</script>
