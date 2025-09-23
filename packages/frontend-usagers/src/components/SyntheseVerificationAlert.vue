<template>
  <DsfrAlert
    role="alert"
    title="Vérification"
    class="fr-my-3v fr-col-12"
    type="info"
    :closeable="true"
    :closed="closed"
    @close="closed = true"
  >
    <ul>
      <li>Vérifiez que toutes les informations renseignées sont exactes.</li>
      <li>Assurez-vous que tous les documents sont lisibles.</li>
      <li>
        Chaque étape du formulaire doit être marquée comme
        <DsfrBadge type="success" label="Complet" /> afin que la demande puisse
        être transmise.
      </li>
      <li>
        Si une étape apparaît comme « Incomplet »
        <DsfrBadge type="warning" label="Incomplet" /> , sélectionnez la
        catégorie correspondante dans le menu de gauche pour renseigner ou
        corriger les informations manquantes.
      </li>
    </ul>
  </DsfrAlert>
</template>

<script setup>
import { ref } from "vue";
const closed = ref(false);
</script>
