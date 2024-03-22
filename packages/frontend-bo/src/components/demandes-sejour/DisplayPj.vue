<template>
  <div>
    <div class="pj-container">
      <h3>Agrément de l'organisme</h3>
      <DsfrFileDownload
        v-if="demandeStore.currentDemande?.organismes?.agrement?.file?.uuid"
        :href="`${config.public.backendUrl}/documents/admin/${demandeStore.currentDemande.organismes.agrement.file.uuid}`"
        :format="
          getExtention(
            demandeStore.currentDemande.organismes.agrement.file.name,
          )
        "
        size=""
        :title="demandeStore.currentDemande.organismes.agrement.file.name"
      />

      <p v-else>Pas d'agrémeent renseigné</p>
    </div>

    <div class="pj-container">
      <h3>Pièces justificatives concernant les protocoles de transport</h3>
      <div
        v-for="file in demandeStore.currentDemande?.transport?.files ?? []"
        :key="file.uuid"
      >
        <DsfrFileDownload
          :href="`${config.public.backendUrl}/documents/admin/${file.uuid}`"
          :format="getExtention(file.name)"
          size=""
          :title="file.name"
        />
      </div>

      <p
        v-if="
          (demandeStore.currentDemande?.transport?.files ?? []).length === 0
        "
      >
        Pas de pièce jointe renseignée
      </p>
    </div>

    <div class="pj-container">
      <h3>Pièces justificatives concernant les protocoles de santé</h3>
      <div
        v-for="file in demandeStore.currentDemande?.sanitaires?.files ?? []"
        :key="file.uuid"
      >
        <DsfrFileDownload
          :href="`${config.public.backendUrl}/documents/admin/${file.uuid}`"
          :format="getExtention(file.name)"
          size=""
          :title="file.name"
        />
      </div>
      <p
        v-if="
          (demandeStore.currentDemande?.sanitaires?.files ?? []).length === 0
        "
      >
        Pas de pièce jointe renseignée
      </p>
    </div>
  </div>
</template>

<script setup>
import { DsfrFileDownload } from "@gouvminint/vue-dsfr";

const demandeStore = useDemandeSejourStore();

const config = useRuntimeConfig();

const getExtention = (filename) => filename.split(".").pop();
</script>

<style scoped>
.pj-container {
  margin-bottom: 3em;
}
</style>
