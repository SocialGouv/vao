<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Mentions légales</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h4>Editeur</h4>
        <p>Le suivi éditorial, graphique et technique est assuré par :</p>
        <em>
          <dl>
            <dt>Direction Générale de la Cohésion Sociale</dt>
            <dt>Ministère des solidarités et de la santé</dt>
            <dt>78-84 rue Olivier de Serres</dt>
            <dt>75015 PARIS</dt>
            <dt>Téléphone du standard : 01 40 56 60 00</dt>
          </dl>
        </em>
        <p></p>
      </div>
      <div class="fr-col-12">
        <h4>Directeur de la publication</h4>
        <p>
          Monsieur Jean-Benoît DUJOL - Directeur général de la cohésion sociale
        </p>
      </div>
      <div class="fr-col-12">
        <h4>Prestataires</h4>
        <strong>Hébergement</strong>
        <p></p>
        <em>
          <dl>
            <dt>OVH SAS</dt>
            <dt>2 rue Kellermann</dt>
            <dt>59100 Roubaix</dt>
            <dt>France</dt>
          </dl>
        </em>
        <p></p>
        <strong>Développement et maintenance</strong>
        <p>
          Le développement et la maintenance sont assurés par la Direction du
          Numérique des ministères sociaux.
        </p>
        <p></p>
        <strong>Prestataire Statistiques</strong>
        <p>
          Les statistiques de consultation du site sont assurées par la société
          <a
            title="Site Internet MATOMO"
            href="https://matomo.org/"
            target="_blank"
            rel="noopener external"
            >MATOMO</a
          >
        </p>
      </div>
      <div class="fr-col-12">
        <h4>Droits de reproduction</h4>
        <p>
          Les contenus des services numériques vao.social.gouv.fr et
          admin-vao.social.gouv.fr, à l’exception des marques et logos et des
          contenus grevés de droits de propriété intellectuelle de tiers ou
          contenant des données à caractère personnel, sont des informations
          publiques librement et gratuitement réutilisables dans les conditions
          fixées par la loi n°78-753 du 17 juillet 1978, formalisées dans les
          conditions générales de réutilisation des informations publiques ou
          dans le respect des conditions générales de réutilisation des
          informations publiques. Si vous souhaitez réutiliser des contenus
          présents sur ce site, merci de bien vouloir nous contacter via le
          formulaire “Contactez-nous” présent sur le site.
        </p>
      </div>
      <div class="fr-col-12">
        <h4>Liens vers d'autres sites</h4>
        <p>
          Des liens vers d’autres sites sont proposés. Leur présence ne saurait
          engager la Direction Générale de la Cohésion Sociale quant à leur
          contenu et ne visent qu’à permettre à l’internaute de trouver plus
          facilement d’autres ressources documentaires sur le sujet consulté.
        </p>
      </div>
      <div class="fr-col-12">
        <h4>Création de liens vers le site</h4>
        <p>
          La mise en place de lien vers vao.social.gouv.fr n’est conditionnée à
          aucun accord préalable. La mise en place de lien vers
          admin-vao.social.gouv.fr n’est conditionnée à aucun accord préalable.
        </p>
        <p>
          En revanche les pages des sites vao.social.gouv.fr et
          admin-vao.social.gouv.fr ne doivent pas être imbriquées à l’intérieur
          des pages d’un autre site.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Mentions légales | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page décrivant les mentions légales.",
    },
  ],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Mentions légales",
  },
];
</script>
