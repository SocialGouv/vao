<template>
  <div>
    <div class="fr-grid-row fr-my-5v">
      <DsfrAccordionsGroup>
        <ul>
          <li v-if="stepToDisplay('info-generales')">
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
              <DSInformationsGenerales
                ref="sectionInformationsGenerales"
                :init-data="props.declarationCourante"
                :validate-on-mount="true"
                :modifiable="false"
                :show-buttons="false"
              ></DSInformationsGenerales>
            </DsfrAccordion>
          </li>
          <li v-if="stepToDisplay('info-vacanciers')">
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
              <DSInformationsVacanciers
                :init-data="
                  props.declarationCourante.informationsVacanciers ?? {}
                "
                :modifiable="false"
                :validate-on-mount="true"
                :show-buttons="false"
              >
              </DSInformationsVacanciers>
            </DsfrAccordion>
          </li>
          <li v-if="stepToDisplay('info-personnel')">
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
              <DSInformationsPersonnel
                :init-data="
                  props.declarationCourante.informationsPersonnel ?? {}
                "
                :modifiable="false"
                :validate-on-mount="true"
                :show-buttons="false"
              ></DSInformationsPersonnel>
            </DsfrAccordion>
          </li>
          <li v-if="stepToDisplay('projet-sejour')">
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
              <DSProjetSejour
                :init-data="props.declarationCourante.projetSejour ?? {}"
                :modifiable="false"
                :validate-on-mount="true"
                :show-buttons="false"
              ></DSProjetSejour>
            </DsfrAccordion>
          </li>
          <li v-if="stepToDisplay('info-transport')">
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
              <ProtocoleTransport
                :init-data="
                  props.declarationCourante.informationsTransport ?? {}
                "
                :modifiable="false"
                :validate-on-mount="true"
                :show-buttons="false"
              ></ProtocoleTransport>
            </DsfrAccordion>
          </li>
          <li v-if="stepToDisplay('info-sanitaires')">
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
              <ProtocoleSanitaire
                :init-data="
                  props.declarationCourante.informationsSanitaires ?? {}
                "
                :modifiable="false"
                :validate-on-mount="true"
                :show-buttons="false"
              ></ProtocoleSanitaire>
            </DsfrAccordion>
          </li>
          <li v-if="stepToDisplay('hebergements')">
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
                    <DSHebergementsSejourDetail
                      :modifiable="false"
                      :hebergement="item"
                      :date-debut-ini="props.declarationCourante.dateDebut"
                      :date-fin-ini="props.declarationCourante.dateFin"
                      :show-buttons="false"
                      :validate-on-mount="true"
                    >
                    </DSHebergementsSejourDetail>
                  </DsfrAccordion>
                </li>
              </DsfrAccordionsGroup>
              <span v-else> Aucun hébergement renseigné </span>
            </DsfrAccordion>
          </li>
        </ul>
      </DsfrAccordionsGroup>
    </div>
    <form>
      <DsfrFieldset v-if="showAttestation" legend="Attestation">
        <div v-if="props.modifiable" class="fr-fieldset__element fr-col-12">
          Vous allez finaliser votre déclaration complémentaire de façon
          définitive. Vous ne pourrez pas revenir dessus et la modifier
        </div>
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
            v-if="props.modifiable"
            :label="libelleBoutonTransmission"
            :disabled="!meta.valid"
            @click.prevent="finalizeDeclaration"
          />
        </DsfrButtonGroup>
        <is-downloading
          :message="props.message"
          :is-downloading="props.isDownloading"
        />
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import dayjs from "dayjs";
import IsDownloading from "~/components/utils/IsDownloading.vue";

const props = defineProps({
  declarationCourante: { type: Object, default: null, required: true },
  modifiable: { type: Boolean, default: true },
  isDownloading: { type: Boolean, required: false, default: false },
  message: { type: String, required: false, default: null },
});

const emit = defineEmits(["previous", "finalize"]);
const expandedId = ref(0);
const subExpandedId = ref(0);

const userStore = useUserStore();
const demandeSejourStore = useDemandeSejourStore();
const declarationStatut = computed(() => {
  return demandeSejourStore.demandeCourante.statut;
});

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
      props.declarationCourante.statut,
    ),
  ),
);
const { meta, errors, values } = useForm({
  initialValues,
  validationSchema: validationSchema.value,
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

const sectionInformationsGenerales = ref(null);

const informationsGenerales = computed(() =>
  sectionInformationsGenerales.value?.meta.valid ? success : failure,
);

const informationsVacanciers = computed(() =>
  !Object.keys(errors.value).find((k) => k.startsWith("informationsVacanciers"))
    ? success
    : failure,
);

const informationsPersonnel = computed(() =>
  !Object.keys(errors.value).find((k) => k.startsWith("informationsPersonnel"))
    ? success
    : failure,
);

const informationsTransport = computed(() =>
  !Object.keys(errors.value).find((k) => k.startsWith("informationsTransport"))
    ? success
    : failure,
);

const informationsSanitaires = computed(() =>
  !Object.keys(errors.value).find((k) => k.startsWith("informationsSanitaires"))
    ? success
    : failure,
);
const projetSejour = computed(() =>
  !Object.keys(errors.value).find((k) => k.startsWith("projetSejour"))
    ? success
    : failure,
);
const hebergement = computed(() =>
  !Object.keys(errors.value).find((k) => k.startsWith("hebergement"))
    ? success
    : failure,
);

const showAttestation = computed(
  () => !Object.keys(errors.value).find((k) => !k.startsWith("attestation")),
);

const libelleBoutonTransmission = computed(() => {
  if (
    declarationStatut.value === DeclarationSejour.statuts.BROUILLON ||
    declarationStatut.value === DeclarationSejour.statuts.A_MODIFIER
  ) {
    return "Transmettre ma déclaration de séjour à 2 mois";
  }
  if (
    declarationStatut.value === DeclarationSejour.statuts.ATTENTE_8_JOUR ||
    declarationStatut.value === DeclarationSejour.statuts.A_MODIFIER_8J
  ) {
    return "Transmettre ma déclaration de séjour à 8 jours";
  }
});

function validateHebergement(index) {
  return !Object.keys(errors.value).find((k) =>
    k.startsWith("hebergement.hebergements[" + index + "]"),
  )
    ? success
    : failure;
}

function stepToDisplay(step) {
  const statutsMasques = demandeSejourMenus.find(
    (menu) => menu.id === step,
  )?.statutsMasques;
  return !(statutsMasques && statutsMasques.includes(declarationStatut.value));
}

function finalizeDeclaration() {
  emit("finalize", values.attestation);
}
</script>

<style lang="scss" scoped></style>
