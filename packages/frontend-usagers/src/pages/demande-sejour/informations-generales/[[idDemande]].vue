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
          placeholder="nom de votre demande de séjour"
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
          placeholder="Date de début"
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
          placeholder="Date de fin"
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
    <fieldset class="fr-fieldset">
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="retour" :secondary="true" @click="back"
            >Retour</DsfrButton
          >
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="precedent" :secondary="true" @click="previous"
            >Précédent</DsfrButton
          >
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrButton id="Suivant" :disabled="!meta.valid" @click.prevent="next"
            >Suivant</DsfrButton
          >
        </div>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import dayjs from "dayjs";
import { useDemandeSejourStore } from "@/stores/demande-sejour";
import { useOperateurStore } from "@/stores/operateur";
import { useLayoutStore } from "@/stores/layout";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected", "has-id-demande-sejour"],
  layout: "demande-sejour",
});

const log = logger("demande-sejour/informations-generales");

const demandeSejourStore = useDemandeSejourStore();
const operateurStore = useOperateurStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const isUpdate = computed(() => {
  return !!route.params.idDemande;
});

const duree = computed(() => {
  const nbjours = dayjs(dateFin.value).diff(dateDebut.value, "day");
  return nbjours.toString();
});
const schemaInfosGenerales = {
  libelle: yup.string().typeError("le libellé est requis").required(),
  dateDebut: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .min(new Date(), "La date doit être supérieure à la date du jour.")
    .required("La saisie de ce champ est obligatoire"),
  dateFin: yup
    .date()
    .typeError("date invalide")
    .when("dateDebut", (dateDebut, schema) => {
      return schema.test({
        test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
        message: "La date de fin doit être supérieure à la date de début",
      });
    })
    .required("La saisie de ce champ est obligatoire"),
};

const saison = computed(() => {
  const moisDebut = dayjs(dateDebut.value).month();
  if (moisDebut < 3) return "hiver";
  if (moisDebut < 6) return "printemps";
  if (moisDebut < 9) return "été";
  if (moisDebut < 12) return "automne";
});

const validationSchema = computed(() =>
  yup.object({
    ...schemaInfosGenerales,
  }),
);

const initialValues = computed(() => ({
  libelle: demandeCourante.value.libelle ?? "premier séjour",
  dateDebut:
    dayjs(demandeCourante.value.dateDebut).format("YYYY-MM-DD") ?? null,
  dateFin: dayjs(demandeCourante.value?.dateFin).format("YYYY-MM-DD") ?? null,
}));

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

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/operateur/${isUpdate.value ? route.params.idDemande : ""}`,
  );
}

async function checkSiege() {
  log.i("IN - checkSiege");
  try {
    const url = `/operateur/siege/${operateurStore.operateurCourant.personneMorale.siren}`;
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
async function next() {
  log.d("next - IN");
  try {
    if (isUpdate.value) {
      const url = `/sejour/${route.params.idDemande}`;
      await $fetchBackend(url, {
        method: "POST",
        credentials: "include",
        body: {
          parametre: { ...values, duree: duree.value, periode: saison.value },
          type: "informationsGenerales",
        },
        async onResponse({ response }) {
          if (!response.ok) {
            toaster.error(
              response._data.message ?? "Erreur lors de la sauvegarde",
            );
          } else {
            log.d("demande de sejour mise à jour");
            toaster.success("informations générales sauvegardées");
            await navigateTo(
              `/demande-sejour/organisateurs/${route.params.idDemande}`,
            );
          }
        },
      });
    } else {
      const url = `/sejour`;
      await $fetchBackend(url, {
        method: "POST",
        credentials: "include",
        body: {
          ...values,
          duree: duree.value,
          periode: saison.value,
        },
        async onResponse({ response }) {
          if (!response.ok) {
            toaster.show(
              response._data.message ?? `Erreur lors de la sauvegarde`,
              {
                type: "error",
              },
            );
          } else {
            log.d("demande de sejour créée");
            const idDemande = response._data.id;
            toaster.success("Demande de séjour enregistrée");
            await navigateTo(`/demande-sejour/organisateurs/${idDemande}`);
          }
        },
      });
    }
  } catch (error) {
    log.w("submitCompte - erreur", { error });
  }
}

onMounted(async () => {
  layoutStore.breadCrumb = "informations générales";
  layoutStore.stepperIndex = 1;
  await operateurStore.setMyOperateur();
  if (
    operateurStore.operateurCourant.personneMorale &&
    !operateurStore.operateurCourant.personneMorale.siegeSocial
  ) {
    await checkSiege();
  }
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
