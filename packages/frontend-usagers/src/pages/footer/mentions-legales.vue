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
        <h2>Editeur</h2>
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
      </div>
      <div class="fr-col-12">
        <h2>Directeur de la publication</h2>
        <p>
          Monsieur Jean-Benoît DUJOL - Directeur général de la cohésion sociale
        </p>
      </div>
      <div class="fr-col-12">
        <h2>Prestataires</h2>
        <strong>Hébergement</strong>
        <em>
          <dl>
            <dt>OVH SAS</dt>
            <dt>2 rue Kellermann</dt>
            <dt>59100 Roubaix</dt>
            <dt>France</dt>
          </dl>
        </em>
        <strong>Développement et maintenance</strong>
        <p>
          Le développement et la maintenance sont assurés par la Direction du
          Numérique des ministères sociaux.
        </p>
        <strong>Prestataire Statistiques</strong>
        <p>
          Les statistiques de consultation du site sont assurées par la société
          <a
            title="Site Internet MATOMO, nouvelle fenêtre"
            href="https://matomo.org/"
            target="_blank"
            rel="noopener external"
            >MATOMO</a
          >
        </p>
      </div>
      <div class="fr-col-12">
        <h2>Droits de reproduction</h2>
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
        <h2>Responsabilité de l’utilisateur dans la saisine des données</h2>
        <p>
          L'utilisateur du service numérique VAO s'engage à ne pas inscrire des
          données à caractère personnel sauf si un champ le demande
          explicitement, conformément à la définition de la Commission nationale
          de l’informatique et des libertés (CNIL) et aux dispositions légales
          et réglementaires en vigueur, notamment le Règlement Général sur la
          Protection des Données (RGPD) et la loi Informatique et Libertés. Il
          lui appartient de s'assurer de l'exactitude, de la légitimité, de la
          proportionnalité et de la pertinence des données fournies.
          L’utilisateur s’engage à assurer la sécurité des données, en
          particulier leur confidentialité, en prenant toutes les précautions
          nécessaires. Toute utilisation inappropriée, frauduleuse ou illicite
          du service numérique VAO engage exclusivement la responsabilité de
          l'utilisateur.
        </p>
      </div>
      <div class="fr-col-12">
        <h2>Liens vers d'autres sites</h2>
        <p>
          Des liens vers d’autres sites sont proposés. Leur présence ne saurait
          engager la Direction Générale de la Cohésion Sociale quant à leur
          contenu et ne visent qu’à permettre à l’internaute de trouver plus
          facilement d’autres ressources documentaires sur le sujet consulté.
        </p>
      </div>
      <div class="fr-col-12">
        <h2>Création de liens vers le site</h2>
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
