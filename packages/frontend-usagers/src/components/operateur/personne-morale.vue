<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrInputGroup
            name="siret"
            label="Numéro SIRET"
            :label-visible="true"
            :model-value="siret"
            :required="true"
            :is-valid="siretMeta.valid"
            :error-message="siretErrorMessage"
            placeholder=""
            hint="14 chiffres consécutifs qui indiquent l'établissement organisateur"
            @update:model-value="onSiretChange"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-4">
          <DsfrButton
            id="chercherSiret"
            :disabled="!siretMeta.valid"
            @click.prevent="searchOperateur"
            >Récupérer informations</DsfrButton
          >
        </div>
      </div>
    </fieldset>
    <div v-if="isEtablissementFound">
      <fieldset class="fr-fieldset">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="raisonSociale"
              label="Raison sociale"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.raisonSociale"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="statut"
              label="Status, forme juridique"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.statut"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="adresse"
              label="adresse"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.adresse"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="pays"
              label="Pays"
              :label-visible="true"
              :model-value="formatedPersonneMorale?.pays"
              :required="false"
              :disabled="true"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="email"
              label="Courriel"
              :label-visible="true"
              :model-value="email"
              :required="true"
              :disabled="false"
              :is-valid="emailMeta.valid"
              :error-message="emailErrorMessage"
              placeholder=""
              hint="L'adresse mail doit être un email valide"
              @update:model-value="onEmailChange"
            />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrInputGroup
              name="telephoneEP"
              label="Téléphone"
              :label-visible="true"
              :model-value="telephoneEP"
              :required="true"
              :disabled="false"
              :is-valid="telephoneEPMeta.valid"
              :valid-message="telephoneEPValidMessage"
              :error-message="telephoneEPErrorMessage"
              placeholder=""
              hint="Au format 0X, +33X ou 0033"
              @update:model-value="onTelephoneEPChange"
            />
          </div>
        </div>
      </fieldset>
      <div v-if="isEtablissementPrincipal">
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrHighlight text="Représentants légaux" :large="true" />
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrAccordionsGroup>
              <div v-for="(item, index) in representantsLegaux" :key="index">
                <li>
                  <DsfrAccordion
                    :id="index + 1"
                    :title="nomPrenomRepresentantLegal[index]"
                    :expanded-id="expandedRepresentantLegalId"
                    @expand="(id) => (expandedRepresentantLegalId = id)"
                  >
                    <Personne
                      :personne="item"
                      :index="index"
                      :show-adresse="true"
                      :show-telephone="true"
                      @valid="validRepresentantLegal"
                    >
                    </Personne>
                  </DsfrAccordion>
                </li>
              </div>
            </DsfrAccordionsGroup>
          </div>
        </div>
        <div class="fr-fieldset__element">
          <div class="fr-input-group fr-col-8">
            <DsfrButton
              :label="`Ajouter un représentant légal n°${
                representantsLegaux?.length + 1
              }`"
              :disabled="expandedRepresentantLegalId !== 0"
              :secondary="true"
              @click="addRepresentantLegal"
            ></DsfrButton>
          </div>
        </div>
      </div>
      <!-- <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrHighlight
            text="Responsables de l'organisation des séjours"
            :large="true"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrAccordionsGroup>
            <div v-for="(item, index) in organisateurs" :key="index">
              <li>
                <DsfrAccordion
                  :id="index + 1"
                  :title="nomPrenomResponsableOrganisation[index]"
                  :expanded-id="expandedOrganisateurId"
                  @expand="(id) => (expandedOrganisateurId = id)"
                >
                  <Personne
                    :personne="item"
                    :index="index"
                    :show-adresse="false"
                    :show-telephone="true"
                    :show-email="true"
                    @valid="validResponsableOrganisation"
                  >
                  </Personne>
                </DsfrAccordion>
              </li>
            </div>
          </DsfrAccordionsGroup>
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-8">
          <DsfrButton
            :label="`Ajouter un organisateur n°${organisateurs?.length + 1}`"
            :disabled="expandedOrganisateurId !== 0"
            :secondary="true"
            @click="addResponsableOrganisation"
          ></DsfrButton>
        </div>
      </div> -->
    </div>

    <DsfrButton label="Suivant" @click="next" />
  </div>
</template>

<script setup>
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const log = logger("components/operateur/personne-morale");

const props = defineProps({
  initData: { type: Object, default: null, required: true },
});

const emit = defineEmits(["valid"]);

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const representantsLegaux = ref([{ nom: "" }]);
// const organisateurs = ref([{}]);
const expandedRepresentantLegalId = ref(1);
// const expandedOrganisateurId = ref(1);
const siretRegex = /^[0-9]{14}$/;
const personneMorale = ref();
const operateurDejaExistant = ref();

// Schéma et données liées à une personne morale
const schema = {
  siret: yup
    .string()
    .test(
      "siret",
      "Le numéro SIRET doit faire exactement 14 chiffres",
      (siret) => siretRegex.test(siret.replace(/ /g, "")),
    )
    .required(),
  email: yup
    .string()
    .email("le format de l'email n'est pas valide")
    .required("L'email de contact est obligatoire"),
  telephoneEP: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (telephoneEP) => numTelephoneRegex.test(telephoneEP),
    )
    .required("Le numéro de téléphone de l'établissement est obligatoire"),
};
const validationSchema = computed(() => {
  return yup.object({ ...schema });
});
const initialValues = computed(() => {
  return {
    siret: props.initData?.siret ?? "",
    email: props.initData?.email ?? "",
    telephoneEP: props.initData?.telephoneEP ?? "",
    representantsLegaux: props.initData?.representantsLegaux ?? [],
    // organisateurs: props.initData?.organisateurs ?? [],
  };
});
const { meta, resetForm } = useForm({
  initialValues,
  validationSchema,
});
const {
  value: siret,
  errorMessage: siretErrorMessage,
  handleChange: onSiretChange,
  meta: siretMeta,
} = useField("siret");
const {
  value: email,
  errorMessage: emailErrorMessage,
  handleChange: onEmailChange,
  meta: emailMeta,
} = useField("email");
const {
  value: telephoneEP,
  errorMessage: telephoneEPErrorMessage,
  validMessage: telephoneEPValidMessage,
  handleChange: onTelephoneEPChange,
  meta: telephoneEPMeta,
} = useField("telephoneEP");

const isEtablissementFound = computed(() => {
  return !!siret.value;
});

const isEtablissementPrincipal = computed(() => {
  return !!formatedPersonneMorale.value.siegeSocial;
});

const formatedPersonneMorale = computed(() => {
  // les infos proviennent de l'API entreprise
  if (personneMorale.value) {
    const adresse = `${personneMorale.value.adresse.numero_voie ?? ""} ${
      personneMorale.value.adresse.type_voie ?? ""
    } ${personneMorale.value.adresse.libelle_voie ?? ""} ${
      personneMorale.value.adresse.code_postal ?? ""
    } ${personneMorale.value.adresse.libelle_commune ?? ""}`;
    return {
      siret: personneMorale.value.siret,
      siren: personneMorale.value.unite_legale.siren,
      siegeSocial: personneMorale.value.siege_social,
      raisonSociale:
        personneMorale.value.unite_legale.personne_morale_attributs
          .raison_sociale,
      statut: personneMorale.value.unite_legale.forme_juridique.libelle,
      adresse: adresse.trim(),
      adresseComplete: personneMorale.value.adresse,
      pays: personneMorale.value.adresse.libelle_pays_etranger ?? "France",
    };
  }
  // les infos proviennent d'un operateur déjà présent en base
  if (operateurDejaExistant.value) {
    representantsLegaux.value =
      operateurDejaExistant.value.personneMorale?.representantsLegaux;
    // organisateurs.value =
    //   operateurDejaExistant.value.personneMorale?.organisateurs;
    email.value = operateurDejaExistant.value.personneMorale?.email;
    telephoneEP.value = operateurDejaExistant.value.personneMorale?.telephoneEP;
    return {
      siret: operateurDejaExistant.value.personneMorale?.siret,
      siren: operateurDejaExistant.value.personneMorale?.siren,
      siegeSocial: operateurDejaExistant.value.personneMorale?.siegeSocial,
      raisonSociale: operateurDejaExistant.value.personneMorale?.raisonSociale,
      statut: operateurDejaExistant.value.personneMorale?.statut,
      adresse: operateurDejaExistant.value.personneMorale?.adresseShort,
      adresseComplete: operateurDejaExistant.value.personneMorale?.adresse,
      pays: operateurDejaExistant.value.personneMorale?.pays,
    };
  }
  if (props.initData) {
    return {
      siret: props.initData.siret,
      siren: props.initData.siren,
      siegeSocial: props.initData.siegeSocial,
      raisonSociale: props.initData.raisonSociale,
      statut: props.initData.statut,
      adresse: props.initData.adresseShort,
      adresseComplete: props.initData.adresse,
      pays: props.initData.pays,
    };
  }
  return {
    siret: null,
    raisonSociale: null,
    statut: null,
    adresse: null,
    adresseComplete: null,
    pays: null,
  };
});

const nomPrenomRepresentantLegal = computed(() => {
  return representantsLegaux?.value.map((r) => {
    return r.nom
      ? `${r.nom.toUpperCase()}  ${r.prenom.toUpperCase()} - ${r.fonction}`
      : "Nouveau représentant légal - A RENSEIGNER";
  });
});

watch(siret, (siretSaisi) => {
  const formatedSiret = siretSaisi.trim();
  siret.value = formatedSiret.replace(
    /(\d{3})(\d{3})(\d{3})(\d{5})/,
    "$1 $2 $3 $4",
  );
});
async function searchApiEntreprise() {
  log.i("searchApiEntreprise - IN");
  const url = `/siret/${siret.value}`;
  try {
    const data = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });

    log.d("Données récupérées");
    toaster.success("Données récupérées");
    personneMorale.value = data.uniteLegale[0];
    log.d(personneMorale.value);
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données à partir du SIRET",
    );
    log.w("searchApiEntreprise - erreur:", { error });
  }
}

async function searchOperateurBySiret() {
  log.i("searchOperateurBySiret - IN");
  const url = `/operateur/siret/${siret.value}`;
  try {
    const { data, error } = await $fetchBackend(url, {
      method: "GET",
      credentials: "include",
    });
    log.d("data.value.operateur");
    log.d(data.value.operateur);
    if (error.value) {
      log.w(error.value);
    }
    if (data.value && data.value.operateur.length > 0) {
      log.d("L'opérateur est déjà présent en base");
      toaster.success("L'opérateur est déjà présent en base");
      operateurDejaExistant.value = data.value.operateur;
      log.d(operateurDejaExistant.value);
    }
  } catch (error) {
    toaster.error(
      "erreur lors de la récupération des données internes à partir du SIRET",
    );
    log.w("searchOperateurBySiret - erreur:", { error });
  }
}

async function searchOperateur() {
  const operateur = await searchOperateurBySiret();
  log.d("operateur", operateur);
  if (!operateur) {
    log.d("appel API entreprise");
    await searchApiEntreprise();
  }
}
function addRepresentantLegal() {
  representantsLegaux.value.push({});
  expandedRepresentantLegalId.value = representantsLegaux.value.length;
}

function validRepresentantLegal(representantLegal, index) {
  log.i("validRepresentantLegal - IN");
  representantsLegaux.value[index] = representantLegal;
  expandedRepresentantLegalId.value = 0;
}

function next() {
  log.i("next - IN");
  emit("valid", {
    siret: siret.value,
    siren: formatedPersonneMorale.value.siren,
    siegeSocial: formatedPersonneMorale.value.siegeSocial,
    raisonSociale: formatedPersonneMorale.value.raisonSociale,
    statut: formatedPersonneMorale.value.statut,
    adresseShort: formatedPersonneMorale.value.adresse,
    adresse: formatedPersonneMorale.value.adresseComplete,
    pays: formatedPersonneMorale.value.pays,
    email: email.value,
    telephoneEP: telephoneEP.value,
    representantsLegaux: representantsLegaux.value,
    // organisateurs: organisateurs.value,
    meta: meta.value.valid,
  });
}

onMounted(() => {
  representantsLegaux.value = props.initData.representantsLegaux ?? [{}];
  // organisateurs.value = props.initData.organisateurs ?? [{}];
  resetForm({ values: initialValues.value });
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
