<template>
  <h2 class="fr-h4">
    <span
      class="fr-icon-check-line fr-icon--lg fr-mr-1w icon-success"
      aria-hidden="true"
      style="color: var(--text-default-success)"
    ></span>
    Votre déclaration a bien été transmise
  </h2>

  <section class="fr-container fr-my-4w">
    <p>Votre demande est en cours de traitement</p>

    <div class="avis-box" role="region" aria-labelledby="avis-title">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
        <div class="fr-col-12 fr-col-md-6">
          <h3 id="avis-title" class="fr-h4">
            Comment s’est passée votre démarche ?
          </h3>

          <p class="fr-text--sm">
            Aidez-nous à améliorer cette démarche en donnant votre avis, cela ne
            prend que 2 minutes.
          </p>
        </div>
        <div class="fr-col-12 fr-col-md-6 fr-text--right">
          <a
            href="https://jedonnemonavis.numerique.gouv.fr/Demarches/4077?button=4503"
            target="_blank"
            rel="noopener noreferrer"
            title="Je donne mon avis - nouvelle fenêtre"
          >
            <img
              target="_blank"
              src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-clair.svg"
              alt="Je donne mon avis"
            />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.icon-success {
  color: var(--text-default-success);
}
.avis-box {
  background-color: #ececfe;
  padding: 1rem;
  margin: 1rem;
}
a img {
  width: 90%;
}
</style>
