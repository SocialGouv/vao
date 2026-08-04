<template>
  <div class="fr-container agrement-bienvenue fr-pb-5w">
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row fr-pt-5w">
      <h1 ref="pageHeadingRef">
        Bienvenue {{ userStore.user?.prenom }} {{ userStore.user?.nom }}
      </h1>
    </div>
    <p class="fr-mb-0">
      Cette plateforme vous permet de gérer vos agréments, organiser et déclarer
      des vacances adaptées.
    </p>
    <p class="fr-text--bold">Pour commencer vous devez avoir votre agrément.</p>

    <div class="image-links">
      <div class="travellers-image">
        <img src="../../assets/illustration-travellers.svg" alt="" />
      </div>
      <div class="fr-grid-col fr-grid-row--gutters">
        <div class="fr-col-12">
          <DsfrTile
            :title="'Faire une première demande d’agrément'"
            titleTag="h2"
            :description="'Vous n’avez pas encore d’agrément et souhaitez en faire la demande pour organiser des vacances adaptées.'"
            :details="'Durée estimée 30 minutes'"
            :imgSrc="DocumentAdd"
            :horizontal="true"
            :button-label="'Faire une première demande d’agrément'"
            to="/agrement/new"
          />
          <!-- //todo: renseigner le lien quand la destination de page est connue -->
          <DsfrTile
            class="fr-mt-4w"
            :title="'J’ai déjà un agrément'"
            titleTag="h2"
            :description="'Vous possédez déjà un agrément valide et souhaitez l\'enregistrer pour accéder  immédiatement aux services.'"
            :details="'Durée estimée 30 minutes'"
            :imgSrc="DocumentSignature"
            :horizontal="true"
            :button-label="'J’ai déjà un agrément'"
            to="#"
          />
        </div>
      </div>
    </div>
    <section class="pourquoi-agrement fr-mt-6w">
      <h2 id="pourquoi-agrement-titre">Pourquoi un agrément ?</h2>
      <ul class="fr-grid-row fr-grid-row--gutters fr-list-reset">
        <li class="fr-col-12 fr-col-md-4">
          <h3 class="fr-mb-1v fr-text--lg">
            <img src="../../assets/icones/file-shield-2-line.svg" alt="" />
            L'agrément est obligatoire
          </h3>
          <p>
            pour organiser des séjours avec hébergement pour personnes en
            situation de handicap.
          </p>
        </li>
        <li class="fr-col-12 fr-col-md-4">
          <h3 class="fr-mb-1v fr-text--lg">
            <img src="../../assets/icones/history-line.svg" alt="" />Il est
            valable 5 ans
          </h3>
          <p>et doit être renouvelé avant expiration.</p>
        </li>
        <li class="fr-col-12 fr-col-md-4">
          <h3 class="fr-mb-1v fr-text--lg">
            <img
              src="../../assets/icones/calendar-check-fill.svg"
              alt=""
            />Compter 4 mois minimum
          </h3>
          <p>avant la date du premier séjour.</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import DocumentAdd from "@gouvfr/dsfr/dist/artwork/pictograms/document/document-add.svg";
import DocumentSignature from "@gouvfr/dsfr/dist/artwork/pictograms/document/document-signature.svg";

const userStore = useUserStore();

const pageHeadingRef = ref<HTMLHeadingElement | null>(null);

definePageMeta({
  middleware: [
    "is-connected",
    "check-organisme-is-complet",
    "check-no-agrement-existing",
  ],
});

useHead({
  title: "Demande d'agrément | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Choix du parcours de demande d'agrément.",
    },
  ],
});

const links = [{ to: "/", text: "Accueil" }, { text: "Demande d'agrément" }];

onMounted(() => {
  pageHeadingRef.value?.focus();
});
</script>

<style scoped>
.image-links {
  display: flex;
  align-items: center;
  margin-top: 2rem;
}
.image-links img {
  max-width: 100%;
}
@media (max-width: 768px) {
  .image-links {
    flex-flow: column nowrap;
    row-gap: 1rem;
  }
}
.image-links > div {
  flex: 1;
}
.travellers-image {
  width: 100%;
  height: auto;
}
.pourquoi-agrement {
  border-radius: 4px;
  background: rgba(236, 236, 254, 0.4);
  padding: 2rem;
}
.pourquoi-agrement ul {
  list-style: none;
}
.pourquoi-agrement h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
