<template>
  <div class="fr-container">
    <h1 class="fr-py-3v">
      Liste des organisateurs dont l’agrément VAO n’est plus valide
    </h1>

    <dsfr-highlight
      >Cliquer sur le bouton ci-dessous pour récuperer un fichier regroupant la
      liste des organisateurs VAO ayant fait l’objet d’un retrait, d’une
      suspension ou d’un non renouvellement de leur agrément
    </dsfr-highlight>
    <div class="fr-grid-row fr-p-3v">
      <dsfr-file-download
        :href="file"
        download="organisateurs_avec_un_agrement_non_valide"
        format="pdf"
        size="550 ko"
        title="Récupérer la liste des organisateurs dont l’agrément VAO n’est plus valide"
      />
    </div>
  </div>
</template>

<script setup>
import { DsfrFileDownload, DsfrHighlight } from "@gouvminint/vue-dsfr";

const file = ref(null);

const loadXlsx = async () => {
  try {
    const blob = await $fetchBackend(
      `/documents/admin/static/agrements_VAO_non_actifs_07_08_2024.pdf`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (blob) {
      file.value = URL.createObjectURL(blob);
    }
  } catch (error) {
    log.w("get static", error);
    toaster.error({
      titleTag: "h2",
      description:
        "Erreur lors de la récupération de la liste des organisateurs VAO ayant fait l’objet d’un retrait",
    });
  }
};

onMounted(loadXlsx);

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});
</script>
