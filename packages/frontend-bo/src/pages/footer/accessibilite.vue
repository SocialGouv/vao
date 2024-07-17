<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <h1>Déclaration d’accessibilité</h1>

    <p>
      <strong>Le Ministère du travail, de la santé et des solidarités, </strong>
      s’engage à rendre ses sites internet, intranet, extranet et ses progiciels
      accessibles (et ses applications mobiles et mobilier urbain numérique)
      conformément à l’article 47 de la loi n°2005-102 du 11 février 2005.
    </p>

    <p>
      Cette déclaration d’accessibilité s’applique au service numérique
      <strong>https://vao.social.gouv.fr/</strong>. L’accessibilité numérique
      consiste à rendre les contenus et services numériques compréhensibles et
      utilisables par les personnes en situation de handicap.
    </p>

    <h2>État de conformité</h2>

    <p>
      L'audit de conformité au référentiel général d’amélioration de
      l’accessibilité (RGAA) est en cours de réalisation.
    </p>
    <p>Les résultats seront publiés prochainement.</p>

    <h2>Résultats des tests</h2>

    <p>En attente des résultats de l’audit accessibilité numérique</p>

    <h2>Établissement de cette déclaration d’accessibilité</h2>

    <p>Cette déclaration a été établie le <strong>15 avril 2024</strong>.</p>

    <h3>Technologies utilisées pour la réalisation de l’audit</h3>

    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>Javascript</li>
    </ul>

    <h3>Environnement de test</h3>

    <p>
      Les vérifications de restitution de contenus ont été réalisées sur la base
      de la combinaison fournie par la base de référence du RGAA, avec les
      versions suivantes :
    </p>

    <ul>
      <li>Sur ordinateur Windows avec Firefox et NVDA</li>
      <li>Sur ordinateur Windows avec Firefox et JAWS</li>
      <li>Sur ordinateur MacOS avec Safari et VoiceOver</li>
      <li>Sur mobile iOS avec Safari et VoiceOver</li>
    </ul>

    <h3>Outils pour évaluer l’accessibilité</h3>

    <ul>
      <li>Web Developer Toolbar</li>
      <li>Colour Contrast Analyser</li>
      <li>HeadingsMap</li>
      <li>WCAG Contrast checker</li>
      <li>Inspecteur de composants</li>
      <li>Validateur HTML du W3C</li>
    </ul>

    <h3>Pages du site ayant fait l’objet de la vérification de conformité</h3>

    <ul>
      <li>Création de compte</li>
      <li>Mot de passe oublié</li>
      <li>Authentification</li>
      <li>Accueil</li>
      <li>Accessibilité</li>
      <li>Mentions légales</li>
      <li>Données personnelles</li>
      <li>Ma fiche organisateur (5 étapes)</li>
      <li>Mes hébergements</li>
      <li>Création d'un hébergement</li>
      <li>Nouvelle déclaration de séjour</li>
      <li>Mes séjours</li>
    </ul>

    <h2>Retour d’information et contact</h2>

    <p>
      Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez
      contacter le responsable de AGAPE'TH - Espace documentaire pour être
      orienté vers une alternative accessible ou obtenir le contenu sous une
      autre forme.
    </p>

    <ul>
      <li>
        Contacter le ou la référente accessibilité à
        <strong> accessibilite@sante.gouv.fr</strong>
      </li>
    </ul>

    <h2>Voies de recours</h2>

    <p>
      Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un
      contenu ou une fonctionnalité du site, que vous nous le signalez et que
      vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en
      droit de faire parvenir vos doléances ou une demande de saisine au
      Défenseur des droits.
    </p>

    <p>Plusieurs moyens sont à votre disposition :</p>

    <ul>
      <li>Écrire un message au Défenseur des droits</li>
      <li>Contacter le délégué du Défenseur des droits dans votre région</li>
    </ul>

    <p>
      Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)
      Défenseur des droits Libre réponse 71120 75342 Paris CEDEX 07
    </p>
  </div>
</template>

<script setup>
useHead({
  title: "Accessibilité | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de gestion de l'accessibilité .",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Accessibilite",
  },
];
</script>
