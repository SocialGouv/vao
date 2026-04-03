<template>
  <TitleWithIcon
    icon="fr-icon-award-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Motivations
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="props.initAgrement?.motivations"
        :input="AgrementDisplayInput.IAgrement['motivations']"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <MultiFilesUpload
      v-model="filesMotivation"
      :modifiable="false"
      label="Vous avez la possibilité de joindre des documents relatifs aux informations d’ordre sanitaire (optionnel)"
    />
  </div>

  <TitleWithIcon
    icon="fr-icon-briefcase-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Immatriculation
  </TitleWithIcon>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <FileUpload
        v-model="fileImmatriculation"
        :cdn-url="props.cdnUrl"
        label="Certificat d’immatriculation au registre des opérateurs de voyages et de séjours (code du tourisme)"
        :modifiable="false"
      />
    </div>
  </div>

  <div class="fr-fieldset__element">
    <div class="fr-col-12">
      <DisplayInputCommon
        :value="formatFR(props.initAgrement?.dateObtentionCertificat)"
        :input="AgrementDisplayInput.IAgrement['dateObtentionCertificat']"
      />
    </div>
  </div>

  <TitleWithIcon
    icon="fr-icon-file-text-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Attestations
  </TitleWithIcon>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="fileAttestationsRespCivile"
      :cdn-url="props.cdnUrl"
      label="Attestation d’assurance responsabilité civile"
      hint="Cette assurance prouve que vous êtes couvert(e) pour tout dommage (matériel, immatériel) causé involontairement à autrui pendant les activités du séjour."
      :modifiable="false"
    />
  </div>
  <div class="fr-fieldset__element">
    <FileUpload
      v-model="fileAttestationsRapatriement"
      :cdn-url="props.cdnUrl"
      label="Attestation d’assurance en cas de rapatriement"
      hint="Cette assurance garantit la prise en charge des frais de retour ou d’assistance en cas de maladie, d’accident ou d’urgence pendant le séjour."
      :modifiable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  FileUpload,
  TitleWithIcon,
  DisplayInputCommon,
  AgrementDisplayInput,
  MultiFilesUpload,
} from "@vao/shared-ui";

import { FILE_CATEGORY, formatFR } from "@vao/shared-bridge";

// --- Props et événements ---
const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
});

const getFileByCategory = (category: string) => {
  return (
    props.initAgrement?.agrementFiles?.find(
      (file: { category: string }) => file.category === category,
    ) || null
  );
};
const filesMotivation = ref(
  props.initAgrement?.agrementFiles?.filter(
    (file: { category: string }) => file.category === FILE_CATEGORY.MOTIVATION,
  ) || [],
);
const fileImmatriculation = ref(getFileByCategory(FILE_CATEGORY.IMMATRICUL));

const fileAttestationsRespCivile = ref(
  getFileByCategory(FILE_CATEGORY.ASSURRESP),
);

const fileAttestationsRapatriement = ref(
  getFileByCategory(FILE_CATEGORY.ASSURRAPAT),
);
</script>

<style scoped>
.default-success {
  color: var(--text-default-success);
}
</style>
