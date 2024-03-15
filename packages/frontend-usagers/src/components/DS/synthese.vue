<template>
  <div>
    <fieldset class="fr-fieldset"></fieldset>
    <div class="fr-fieldset__element">
      <div class="fr-input-group fr-col-12">
        <DsfrAccordionsGroup>
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
            <informationsGeneralesReadOnly
              :declaration-courante="props.declarationCourante"
            ></informationsGeneralesReadOnly>
          </DsfrAccordion>
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
            <informationsVacanciersReadOnly
              :info-vacanciers="
                props.declarationCourante.informationsVacanciers ?? {}
              "
            >
            </informationsVacanciersReadOnly>
          </DsfrAccordion>
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
            <informationsPersonnelReadOnly
              :info-personnel="
                props.declarationCourante.informationsPersonnel ?? {}
              "
            ></informationsPersonnelReadOnly>
          </DsfrAccordion>
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
            <projetSejourReadOnly
              :projet="props.declarationCourante.informationsProjetSejour ?? {}"
            ></projetSejourReadOnly>
          </DsfrAccordion>
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
            <protocole-transport-read-only
              :init-data="props.declarationCourante.informationsTransport ?? {}"
            ></protocole-transport-read-only>
          </DsfrAccordion>
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
            <protocole-sanitaire-read-only
              :init-data="
                props.declarationCourante.informationsSanitaires ?? {}
              "
            ></protocole-sanitaire-read-only>
          </DsfrAccordion>
          <div
            v-for="(item, index) in props.declarationCourante.hebergement
              ?.hebergements ?? []"
            :key="index"
          >
            <DsfrAccordion
              :id="index + 7"
              :title="`Fiche annexe n°${index + 1}`"
              :expanded-id="expandedId"
              @expand="(id) => (expandedId = id)"
            >
              <template #title> </template>
              <DSFicheAnnexe
                :hebergement="item"
                :date-debut="props.declarationCourante.dateDebut"
                :date-fin="props.declarationCourante.dateFin"
              ></DSFicheAnnexe>
            </DsfrAccordion>
          </div>
        </DsfrAccordionsGroup>
      </div>
    </div>

    <fieldset class="fr-fieldset">
      <DsfrButtonGroup :inline-layout-when="true" :reverse="true">
        <DsfrButton
          id="previous-step"
          :secondary="true"
          :disabled="!props.modifiable"
          @click.prevent="
            () => {
              emit('previous');
            }
          "
          >Précédent</DsfrButton
        >

        <DsfrButton
          label="Transmettre ma déclaration de séjour à 2 mois"
          :disabled="incompleteDeclaration || !props.modifiable"
          @click.prevent="finalizeDeclaration"
        />
      </DsfrButtonGroup>
    </fieldset>
  </div>
</template>

<script setup>
import informationsGeneralesReadOnly from "./informations-generales-read-only.vue";
import informationsPersonnelReadOnly from "./informations-personnel-read-only.vue";
import informationsVacanciersReadOnly from "./informations-vacanciers-read-only.vue";
import projetSejourReadOnly from "./projet-sejour-read-only.vue";

const log = logger("components/organisme/synthese");

const props = defineProps({
  declarationCourante: { type: Object, default: null, required: true },
  modifiable: { type: Boolean, default: true },
});

const emit = defineEmits(["previous", "finalize"]);
const expandedId = ref(0);

const informationsGenerales = {
  label: "complet",
  type: "success",
};

const informationsVacanciers = computed(() => {
  if (props.declarationCourante.informationsVacanciers?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const informationsPersonnel = computed(() => {
  if (props.declarationCourante.informationsPersonnel?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const projetSejour = computed(() => {
  if (props.declarationCourante.informationsProjetSejour?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const informationsTransport = computed(() => {
  if (props.declarationCourante.informationsTransport?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const informationsSanitaires = computed(() => {
  if (props.declarationCourante.informationsSanitaires?.meta) {
    return {
      label: "complet",
      type: "success",
    };
  } else {
    return {
      label: "incomplet",
      type: "warning",
    };
  }
});

const incompleteDeclaration = computed(() => {
  return (
    informationsPersonnel.value.type === "warning" ||
    informationsVacanciers.value.type === "warning" ||
    projetSejour.value.type === "warning" ||
    informationsSanitaires.value.type === "warning" ||
    informationsTransport.value.type === "warning"
  );
});

function finalizeDeclaration() {
  log.i("finalizeDeclaration - IN");
  emit("finalize");
}
</script>

<style lang="scss" scoped></style>
