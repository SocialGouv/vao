<template>
  <div>
    <div class="fr-grid-row fr-my-5v">
      <DsfrAccordionsGroup>
        <li>
          <DsfrAccordion
            :id="1"
            title="Informations générales"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Informations générales&nbsp;</span>
              <DsfrBadge
                :label="informationsGenerales.label"
                :small="true"
                :type="informationsGenerales.type"
              />
            </template>
            <DSInformationsGeneralesReadOnly
              :declaration-courante="props.declarationCourante"
            ></DSInformationsGeneralesReadOnly>
          </DsfrAccordion>
        </li>
        <li>
          <DsfrAccordion
            :id="2"
            title="Informations sur les vacanciers"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Informations sur les vacanciers&nbsp;</span>
              <DsfrBadge
                :label="informationsVacanciers.label"
                :small="true"
                :type="informationsVacanciers.type"
              />
            </template>
            <DSInformationsVacanciersReadOnly
              :info-vacanciers="
                props.declarationCourante.informationsVacanciers ?? {}
              "
            >
            </DSInformationsVacanciersReadOnly>
          </DsfrAccordion>
        </li>
        <li>
          <DsfrAccordion
            :id="3"
            title="Informations sur le personnel"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Informations sur le personnel&nbsp;</span>
              <DsfrBadge
                :label="informationsPersonnel.label"
                :small="true"
                :type="informationsPersonnel.type"
              />
            </template>
            <DSInformationsPersonnelReadOnly
              :info-personnel="
                props.declarationCourante.informationsPersonnel ?? {}
              "
            ></DSInformationsPersonnelReadOnly>
          </DsfrAccordion>
        </li>
        <li>
          <DsfrAccordion
            :id="4"
            title="Projet de séjour"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Projet de séjour &nbsp;</span>
              <DsfrBadge
                :label="projetSejour.label"
                :small="true"
                :type="projetSejour.type"
              />
            </template>
            <DSProjetSejourReadOnly
              :projet="props.declarationCourante.informationsProjetSejour ?? {}"
            ></DSProjetSejourReadOnly>
          </DsfrAccordion>
        </li>
        <li>
          <DsfrAccordion
            :id="5"
            title="Informations sur le transport"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Informations sur le transport &nbsp;</span>
              <DsfrBadge
                :label="informationsTransport.label"
                :small="true"
                :type="informationsTransport.type"
              />
            </template>
            <ProtocoleTransportReadOnly
              :init-data="props.declarationCourante.informationsTransport ?? {}"
            ></ProtocoleTransportReadOnly>
          </DsfrAccordion>
        </li>
        <li>
          <DsfrAccordion
            :id="6"
            title="Informations sanitaires"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Informations sanitaires &nbsp;</span>
              <DsfrBadge
                :label="informationsSanitaires.label"
                :small="true"
                :type="informationsSanitaires.type"
              />
            </template>
            <ProtocoleSanitaireReadOnly
              :init-data="
                props.declarationCourante.informationsSanitaires ?? {}
              "
            ></ProtocoleSanitaireReadOnly>
          </DsfrAccordion>
        </li>
        <li>
          <DsfrAccordion
            id="synthese-hebergement"
            title="Hébergements"
            :expanded-id="expandedId"
            @expand="(id) => (expandedId = id)"
          >
            <template #title>
              <span>Hébergements &nbsp;</span>
              <DsfrBadge
                :label="hebergement.label"
                :small="true"
                :type="hebergement.type"
              />
            </template>
            <DsfrAccordionsGroup
              v-if="props.declarationCourante.hebergement?.hebergements"
            >
              <li
                v-for="(item, index) in props.declarationCourante.hebergement
                  .hebergements"
                :key="index"
              >
                <DsfrAccordion
                  :id="'synthese-hebergement-' + index"
                  :title="`Fiche annexe n°${index + 1}`"
                  :expanded-id="subExpandedId"
                  @expand="(id) => (subExpandedId = id)"
                >
                  <template #title>
                    <span>Fiche annexe n°{{ index + 1 }} &nbsp;</span>
                    <DsfrBadge
                      :label="validateHebergement(index).label"
                      :small="true"
                      :type="validateHebergement(index).type"
                    />
                  </template>
                  <DSFicheAnnexe
                    :hebergement="item"
                    :date-debut="props.declarationCourante.dateDebut"
                    :date-fin="props.declarationCourante.dateFin"
                  ></DSFicheAnnexe>
                </DsfrAccordion>
              </li>
            </DsfrAccordionsGroup>
            <span v-else> Aucun hébergement renseigné </span>
          </DsfrAccordion>
        </li>
      </DsfrAccordionsGroup>
    </div>
    <form>
      <DsfrFieldset v-if="showAttestation" legend="Attestation">
        <div class="fr-fieldset__element fr-col-12">
          <DsfrCheckbox
            v-model="aCertifie"
            name="attestation.aCertifie"
            label="Je certifie sur l'honneur que les renseignements portés sur cette déclaration sont exacts."
            :small="true"
            :disabled="!props.modifiable"
            @update:model-value="onACertifieChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="attestation.nom"
            label="Nom"
            readonly
            :label-visible="true"
            placeholder=""
            :model-value="nom"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="attestation.prenom"
            label="Prénom"
            readonly
            :label-visible="true"
            placeholder=""
            :model-value="prenom"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="attestation.qualite"
            label="Qualité"
            :readonly="!props.modifiable"
            :label-visible="true"
            placeholder=""
            :model-value="qualite"
            :error-message="qualiteErrorMessage && qualiteMeta.touched"
            :is-valid="qualiteMeta"
            @update:model-value="onQualiteChange"
          />
        </div>

        <div class="fr-fieldset__element fr-col-12">
          <DsfrInputGroup
            name="attestation.at"
            label="Date"
            type="date"
            readonly
            :label-visible="true"
            placeholder=""
            :model-value="at"
          />
        </div>
      </DsfrFieldset>
      <fieldset class="fr-fieldset">
        <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
          <DsfrButton
            id="previous-step"
            :secondary="true"
            @click.prevent="
              () => {
                emit('previous');
              }
            "
            >Précédent</DsfrButton
          >
          <DsfrButton
            v-if="props.modifiable"
            label="Transmettre ma déclaration de séjour à 2 mois"
            :disabled="!meta.valid"
            @click.prevent="finalizeDeclaration"
          />
        </DsfrButtonGroup>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import dayjs from "dayjs";

const props = defineProps({
  declarationCourante: { type: Object, default: null, required: true },
  modifiable: { type: Boolean, default: true },
});

const emit = defineEmits(["previous", "finalize"]);
const expandedId = ref(0);
const subExpandedId = ref(0);

const userStore = useUserStore();

const initialValues = {
  ...props.declarationCourante,
  attestation: {
    ...(props.declarationCourante.attestation ?? {}),
    ...(props.modifiable && {
      nom: userStore.user.nom,
      prenom: userStore.user.prenom,
      aCertifie: false,
      at: dayjs(new Date()).format("YYYY-MM-DD"),
    }),
  },
};
const validationSchema = computed(() =>
  yup.object(
    DeclarationSejour.schema(
      props.declarationCourante.dateDebut,
      props.declarationCourante.dateFin,
    ),
  ),
);
const { meta, errors, values } = useForm({
  initialValues,
  validationSchema,
  validateOnMount: true,
});

const { value: aCertifie, handleChange: onACertifieChange } = useField(
  "attestation.aCertifie",
);
const { value: nom } = useField("attestation.nom");
const { value: prenom } = useField("attestation.prenom");
const {
  value: qualite,
  handleChange: onQualiteChange,
  meta: qualiteMeta,
  errorMessage: qualiteErrorMessage,
} = useField("attestation.qualite");
const { value: at } = useField("attestation.at");

const success = {
  label: "complet",
  type: "success",
};

const failure = {
  label: "incomplet",
  type: "warning",
};

const informationsGenerales = success;

const informationsVacanciers = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("informationsVacanciers"))
    ? success
    : failure,
);

const informationsPersonnel = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("informationsPersonnel"))
    ? success
    : failure,
);

const informationsTransport = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("informationsTransport"))
    ? success
    : failure,
);

const informationsSanitaires = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("informationsSanitaires"))
    ? success
    : failure,
);
const projetSejour = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("projetSejour"))
    ? success
    : failure,
);
const hebergement = computed(() =>
  !Object.keys(errors.value).find((k) => k.includes("hebergement"))
    ? success
    : failure,
);

const showAttestation = computed(
  () => !Object.keys(errors.value).find((k) => !k.includes("attestation")),
);

function validateHebergement(index) {
  return !Object.keys(errors.value).find((k) =>
    k.includes("hebergement.hebergements[" + index + "]"),
  )
    ? success
    : failure;
}

function finalizeDeclaration() {
  emit("finalize", values.attestation);
}
</script>

<style lang="scss" scoped></style>
