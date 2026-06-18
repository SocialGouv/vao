<template>
  <div class="aide-wrapper fr-p-5v">
    <h2 class="fr-h3 fr-mb-4v">Aide et contact</h2>
    <div class="aide-container">
      <div class="aide-image">
        <img
          src="../../assets/undraw_questions_g2px.svg"
          alt="Illustration questions"
        />
      </div>
      <div class="aide-contact-cards">
        <div class="fr-card fr-mb-3v flex-card">
          <div class="fr-card__body">
            <DsfrBadge label="Aide en ligne" type="info" small />
            <h3 class="fr-card__title">Portail d'assistance VAO</h3>
            <p class="fr-card__desc">Retrouvez les réponses à vos questions</p>
          </div>
          <div class="fr-card__footer">
            <a
              class="fr-link fr-link--icon-right"
              href="https://vao-assistance.atlassian.net/servicedesk/customer/portals"
              target="_blank"
            >
              Aide
            </a>
          </div>
        </div>

        <div class="fr-card flex-card">
          <div class="fr-card__body">
            <DsfrBadge label="Contact" type="info" small />
            <h3 class="fr-card__title">Contacter votre DREETS</h3>
            <p class="fr-card__desc">
              Téléphone : {{ territoireStore.territoire?.service_telephone }}
            </p>
            <p class="fr-card__desc">
              E-Mail : {{ territoireStore.territoire?.service_mail }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const territoireStore = useTerritoireStore();

const log = logger("aide-contact/");

onMounted(async () => {
  log.i("Mounted");
  await territoireStore.fetchFicheByAgrementRegionUser();
});
</script>
<style scoped>
.aide-contact-cards {
  flex: 1; /* prend tout le reste de la largeur */
}
.aide-wrapper {
  background-color: #ececfe99;
  border-radius: 8px; /* optionnel */
}
.aide-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.aide-image img {
  max-width: 30em;
  width: 100%;
  height: auto;
}

.fr-card__footer .fr-link {
  padding-left: 0;
  margin-left: 2em;
}

@media (max-width: 768px) {
  .aide-container {
    flex-direction: column;
  }

  .aide-image {
    text-align: center;
  }
}
</style>
