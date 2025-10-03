<template>
  <div class="fr-container fr-mt-8v">
    <div class="title-with-badge">
      <h1>{{ eig.raisonSociale }}</h1>
      <EigStatusBadge
        :statut="eig.statut"
        :dreets="{
          isRead: eig.readByDreets,
          territoireCode: eig.agrementRegionObtention,
        }"
        :ddets="{
          isRead: eig.readByDdets,
          territoireCode: eig.departement,
        }"
      />
    </div>

    <TitleWithIcon icon="fr-icon-information-fill" :level="2">
      <template #title>
        <div class="title-with-button">
          <h2 class="title-with-icon">Informations de séjour</h2>
          <DsfrButton
            label="Télécharger le fichier"
            @click.prevent="downloadPDF()"
          />
        </div>
      </template>
    </TitleWithIcon>
    <Summary :eig="eig" env="BO" />
    <hr />
    <TitleWithIcon icon="fr-icon-account-pin-circle-fill" :level="2">
      <template #title>
        <h2 class="title-with-icon">Personnel présent lors des événements</h2>
      </template>
    </TitleWithIcon>
    <UtilsDisplayEncadrementAccompagnement :personnel="eig.personnel ?? []" />
    <hr class="fr-mt-0" />
    <div class="title-with-icon fr-mt-4v fr-mb-6v">
      <!-- todo: a changer après upgrade de la version du dsfr -->
      <span aria-hidden="true" class="custom-svg-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            d="M21 3C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.455L2 22.5V4C2 3.44772 2.44772 3 3 3H21ZM10.5153 7.4116C8.72825 8.18684 7.5 9.75543 7.5 11.5052C7.5 12.5 7.77658 13.1137 8.29171 13.6605C8.61598 14.0048 9.12905 14.25 9.66558 14.25C10.6321 14.25 11.4156 13.4665 11.4156 12.5C11.4156 11.5795 10.7045 10.8389 9.80236 10.7553C9.64107 10.7403 9.47827 10.7431 9.32317 10.7645L9.32344 10.6729C9.32873 10.2322 9.4223 8.9333 10.9616 8.1004L10.5153 7.4116ZM15.5153 7.4116C13.7283 8.18684 12.5 9.75543 12.5 11.5052C12.5 12.5 12.7766 13.1137 13.2917 13.6605C13.616 14.0048 14.1291 14.25 14.6656 14.25C15.6321 14.25 16.4156 13.4665 16.4156 12.5C16.4156 11.5795 15.7045 10.8389 14.8024 10.7553C14.6411 10.7403 14.4783 10.7431 14.3232 10.7645L14.3234 10.6729C14.3287 10.2322 14.4223 8.9333 15.9616 8.1004L15.5153 7.4116Z"
          />
        </svg>
      </span>
      <h2>Les faits</h2>
    </div>
    <div class="faits fr-col-12 fr-col-md-7">
      <div class="card">
        <h3>Déroulement des faits (date, heure, circonstance, etc…)</h3>
        <article>{{ eig.deroulement }}</article>
      </div>

      <div class="card">
        <h3>
          Dispositions pour remédier aux carences, abus, ou faire cesser le
          danger
        </h3>
        <article>{{ eig.dispositionRemediation }}</article>
      </div>

      <div class="card">
        <h3>
          Dispositions prises à l'égard de la victime, et le cas échéant, de
          l’auteur présumé
        </h3>
        <article>{{ eig.dispositionVictimes }}</article>
      </div>

      <div class="card">
        <h3>
          Dispositions prises pour l’information des familles, proches ou
          tuteurs légaux
        </h3>
        <article>{{ eig.dispositionInformations }}</article>
      </div>
    </div>
    <hr />

    <TitleWithIcon icon="fr-icon-article-fill" :level="2">
      <template #title>
        <h2 class="title-with-icon">Fichier(s) téléversé(s)</h2>
      </template>
    </TitleWithIcon>
    <div class="fr-fieldset">
      <FileUpload
        :model-value="localFile"
        :cdn-url="props.cdnUrl"
        :modifiable="false"
        hint="Télécharger le fichier Eig"
        @update:model-value="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Summary,
  FileUpload,
  EigStatusBadge,
  TitleWithIcon,
} from "@vao/shared";

const emit = defineEmits(["update:file"]);

const props = defineProps({
  eig: { type: Object, required: true },
  file: { type: Object, required: true },
  cdnUrl: { type: String, required: false, default: null },
});

const localFile = ref(props.file);

function handleFileChange(newFile) {
  localFile.value = newFile;
  emit("update:file", newFile);
}
async function downloadPDF() {
  const eigStore = useEigStore();

  const eigPdf = await eigStore.getPdf(props.eig.id);

  const byteArray = new Uint8Array(eigPdf.file.data);

  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", `synthese-eig-${props.eig.id}.pdf`);
  a.click();
}
</script>

<style scoped>
h1 {
  font-size: 30px;
  line-height: 40px;
  font-weight: 700;
  margin-bottom: 0;
}
.title-with-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
h2,
.title-with-icon {
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  margin: 0;
}
h3 {
  font-size: 18px;
  line-height: 28px;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.info-sejour {
  max-width: 650px;
}

.info-sejour h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
hr {
  border: none;
  margin-top: 2rem;
}
.card {
  padding: 1.5rem;
  border: 1px solid #cfcfcf;
}
.faits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.title-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}
</style>
