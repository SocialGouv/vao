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
          :disabled="!props.modifiable"
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
          :disabled="!props.modifiable"
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
          :disabled="!props.modifiable"
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
      <h6>Responsable de l'organisation du séjour</h6>
      <Personne
        :modifiable="props.modifiable"
        :personne="initialValues.responsableSejour"
        :show-adresse="true"
        :show-telephone="true"
        :show-email="true"
        :show-button="false"
        @update:personne="onResponsableSejourChange"
      ></Personne>
    </fieldset>
    <div
      v-if="organismeStore.organismeCourant.typeOrganisme === 'personne_morale'"
    >
      <h6>Organisme</h6>
      <OrganismePersonneMoraleReadOnly
        :init-data="organismeStore.organismeCourant.personneMorale"
        :show-responsable-sejour="false"
      ></OrganismePersonneMoraleReadOnly>
    </div>

    <fieldset class="fr-fieldset">
      <DsfrButton
        id="next-step"
        label="Suivant"
        :disabled="!meta.valid || !props.modifiable"
        @click.prevent="next"
      />
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const props = defineProps({
  initData: {
    type: Object,
    required: true,
  },
  modifiable: { type: Boolean, default: true },
});

const emit = defineEmits(["next", "update"]);

const log = logger("components/DS/informations-generales");

const organismeStore = useOrganismeStore();
const userStore = useUserStore();

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

const organismeCourant = computed(() => {
  return organismeStore.organismeCourant;
});

if (
  organismeCourant.value.typeOrganisme === "personne_morale" &&
  !organismeCourant.value.personneMorale.siegeSocial
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
  const responsableSejour = props.initData?.organisme?.responsableSejour
    ? props.initData.organisme.responsableSejour
    : organismeCourant.value.personneMorale.siret
      ? organismeCourant.value.personneMorale.responsableSejour
      : {
          nom: organismeCourant.value.personnePhysique.nomNaissance,
          prenom: organismeCourant.value.personnePhysique.prenom,
          fonction: "organisateur de séjour",
          email: userStore.user.email,
          telephone: organismeCourant.value.personnePhysique.telephone,
          adresse: organismeCourant.value.personnePhysique.adresseSiege,
        };
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
  initialValues: initialValues.value,
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
    const url = `/organisme/siege/${organismeStore.organismeCourant.personneMorale.siret.substring(0, 9)}`;
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    const etablissementPrincipal = data.organisme;
    const nic =
      organismeStore.organismeCourant.personneMorale.siret.substring(9);
    log.d(etablissementPrincipal);
    if (!etablissementPrincipal) {
      toaster.error(
        "L'établissement principal n'a pas encore déclaré son agrément sur la plateforme VAO.",
      );
      return navigateTo("/");
    }
    const e = (
      etablissementPrincipal.personneMorale?.etablissements ?? []
    ).find((e) => e.nic === nic);
    if (!e) {
      toaster.error(
        "Votre établissement n'est pas rattaché à l'établissement principal. Rapprochez-vous de l'établissement principal.",
      );
      return navigateTo("/");
    }
    if (!e.enabled) {
      toaster.error(
        "L'établissement principal n'a pas autorisé votre établissement à saisir des déclarations.",
      );
      return navigateTo("/");
    }
  } catch (error) {
    log.w(error);
    toaster.error("Une erreur est survenue. Veuillez réessayer ultérieurement");
  }
}

function next() {
  if (!meta.value.dirty) {
    return emit("next");
  }
  const organismeData = organismeStore.organismeCourant;
  organismeData.responsableSejour = responsableSejour.value;
  emit(
    "update",
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
