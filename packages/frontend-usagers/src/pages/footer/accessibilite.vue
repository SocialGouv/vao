<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>
    <h1>Déclaration d’accessibilité</h1>
    <p>
      <strong>Les Ministères Sociaux</strong> s’engage à rendre ses sites
      internet, intranet, extranet et ses progiciels accessibles (et ses
      applications mobiles et mobilier urbain numérique) conformément à
      l’article 47 de la loi n°2005-102 du 11 février 2005.
    </p>
    <p>
      Cette déclaration d’accessibilité s’applique à
      <strong>https://vao.social.gouv.fr/</strong>.
    </p>
    <h2>État de conformité</h2>
    <p>
      <strong
        >VAO (Vacances Adaptées Organisées)
        <a
          target="_blank"
          href="https://vao.social.gouv.fr/"
          title="https://vao.social.gouv.fr/, nouvelle fenêtre"
          rel="noopener external"
          >https://vao.social.gouv.fr/</a
        ></strong
      >
      est <strong>non</strong> conforme avec le référentiel général
      d’amélioration de l’accessibilité (RGAA).
    </p>
    <h2>Résultats des tests</h2>
    <p>
      L’audit de conformité finalisé le 23 avril 2024 par la société
      <strong>Access Ethics</strong> révèle que le site est conforme à
      <strong>47%</strong> au RGAA version 4.1.
    </p>
    <h2>Contenus non accessibles</h2>
    <h3>Non-conformités</h3>
    <div>
      <p>
        Liste non exhaustive des erreurs d'accessibilité présentes sur le site :
      </p>
      <ul>
        <li>
          les contrastes ne sont pas respectés sur les messages d'erreur ;
        </li>
        <li>
          certains composants interactifs ne sont pas correctement identifiable
          ;
        </li>
        <li>
          certains liens ne sont pas pertinents et des boutons n'ont pas de nom
          ;
        </li>
        <li>le code HTML n'est pas toujours valide ;</li>
        <li>le changement de langue n'est pas toujours définit ;</li>
        <li>éléments HTML utilisés à des fins de présentation ;</li>
        <li>certains pages n'ont pas de titre pertinent ;</li>
        <li>la structure des titres n'est pas toujours cohérentes ;</li>
        <li>certains éléments ne sont pas structurés en liste ;</li>
        <li>certains contenus ne sont pas présents sans CSS ;</li>
        <li>
          les contenus sont parfois difficile à lire avec un zoom à 200% ;
        </li>
        <li>
          certains contenu se chevauchent en mode portrait et nécessitent un
          scroll horizontal sur écran de 320px ;
        </li>
        <li>les tableaux n'ont pas de titre ;</li>
        <li>absence de lien d'accès rapide vers le contenu principal ;</li>
        <li>les messages de statut ne sont pas toujours restitués ;</li>
        <li>l'information est parfois indiquée uniquement par un picto ;</li>
        <li>
          les champs de formulaire obligatoires ne sont pas correctement
          paramétrés ;
        </li>
        <li>absence de texte d'aide ;</li>
        <li>
          les données de l'usager ne sont pas prédéfinis dans les champs
          concernés ;
        </li>
        <li>l'usager n'a pas le contrôle sur le temps de session.</li>
      </ul>
    </div>
    <h2>Établissement de cette déclaration d’accessibilité</h2>
    <p>
      Cette déclaration a été établie le <strong>23 avril 2024</strong>. Elle a
      été mise à jour le <strong>11 juillet 2024</strong>.
    </p>
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
      <li>Sur desktop MacOS avec Safari et VoiceOver</li>
      <li>Sur desktop Windows avec Firefox et JAWS</li>
      <li>Sur desktop Windows avec Firefox et NVDA</li>
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
      <li>Contraste élevé</li>
    </ul>
    <h3>Pages du site ayant fait l’objet de la vérification de conformité</h3>
    <ul>
      <li>
        Création de compte
        <strong>https://vao.social.gouv.fr/connexion/enregistrement</strong>
      </li>
      <li>
        Mot de passe oublié
        <strong
          >https://vao.social.gouv.fr/connexion/mot-de-passe-oublie</strong
        >
      </li>
      <li>
        Authentification <strong>https://vao.social.gouv.fr/connexion/</strong>
      </li>
      <li>
        Mentions légales
        <strong>https://vao.social.gouv.fr/footer/mentions-legales</strong>
      </li>
      <li>
        Données personnelles
        <strong>https://vao.social.gouv.fr/footer/donnees-personnelles</strong>
      </li>
      <li>
        Ma fiche organisateur - Étape 1 sur 5 - Infos générales
        <strong>https://vao.social.gouv.fr/organisme/64</strong>
      </li>
      <li>
        Ma fiche organisateur - Étape 2 sur 5 - Agrément
        <strong>https://vao.social.gouv.fr/organisme/64#agrement</strong>
      </li>
      <li>
        Ma fiche organisateur - Étape 3 sur 5 - Infos transport
        <strong
          >https://vao.social.gouv.fr/organisme/64#protocole-transport</strong
        >
      </li>
      <li>Accueil <strong>https://vao.social.gouv.fr/</strong></li>
      <li>
        Accessibilité
        <strong>https://vao.social.gouv.fr/footer/accessibilite</strong>
      </li>
      <li>
        Ma fiche organisateur - Étape 4 sur 5 - Infos sanitaire
        <strong
          >https://vao.social.gouv.fr/organisme/64#protocole-sanitaire</strong
        >
      </li>
      <li>
        Ma fiche organisateur - Étape 5 sur 5 - Synthèse
        <strong>https://vao.social.gouv.fr/organisme/64#synthese</strong>
      </li>
      <li>
        Mes hébergements
        <strong>https://vao.social.gouv.fr/hebergements/liste</strong>
      </li>
      <li>
        Création d'un hébergement
        <strong>https://vao.social.gouv.fr/hebergements</strong>
      </li>
      <li>Mes séjours <strong>https://vao.social.gouv.fr/</strong></li>
      <li>
        Nouveau séjour : étape 1 : informations générales
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#info-generales</strong
        >
      </li>
      <li>
        Nouveau séjour étape 2 : informations sur les vacanciers
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#info-vacanciers</strong
        >
      </li>
      <li>
        Nouveau séjour étape 3 : informations sur le personnel
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#info-personnel</strong
        >
      </li>
      <li>
        Nouveau séjour étape 4 : Sélection des hébergements
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#hebergements</strong
        >
      </li>
    </ul>
    <h2>Plan d’action d’accessibilité</h2>
    <p>
      Le plan d’action détaille les actions menées par la DNUM et la DGCS des
      MSS pour améliorer continuellement l’accessibilité du site. Dernière mise
      à jour le 10 mars 2025.
    </p>
    <h3>Bilan d’action 2024</h3>
    <ul>
      <li>Audit d’accessibilité par un prestataire externe – Printemps 2024</li>
      <li>
        Intégration de l’accessibilité via une adaptation de l’organisation
        interne des étapes de conception au développement
      </li>
      <li>Sensibilisation au RGAA de l’équipe interne de développement</li>
      <li>
        Correctifs d’accessibilité intégrés au fil des sprints à la suite de
        l’audit
      </li>
    </ul>
    <h3>Plan d’action 2025</h3>
    <ul>
      <li>
        Audit d’accessibilité par un prestataire externe – Premier semestre 2025
      </li>
      <li>Mise en place de tests d’accessibilité automatique</li>
      <li>Suivi et évaluation régulière de l’accessibilité du site</li>
    </ul>
    <h2>Retour d’information et contact</h2>
    <p>
      Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez
      contacter le responsable de VAO (Vacances Adaptées Organisées) pour être
      orienté vers une alternative accessible ou obtenir le contenu sous une
      autre forme.
    </p>
    <ul>
      <li>
        Envoyer un message via le
        <strong
          ><a
            href="https://vao-assistance.atlassian.net/servicedesk/customer/portals"
            target="_blank"
            >portail d'aide</a
          ></strong
        >
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
      <li>
        Contacter le délégué du Défenseur des droits dans votre région :
        <a
          href="https://www.defenseurdesdroits.fr/carte-des-delegues"
          target="_blank"
          >Annuaire des délégués | Défenseur des Droits</a
        >
      </li>
      <li>
        Contacter le délégué du Défenseur des droits par téléphone :
        <a href="tel:0969390000">09 69 39 00 00</a>, du lundi au vendredi de
        8h30 à 19h30 (coût d’un appel local)
      </li>
      <li>
        Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) à
        l’adresse suivante : Défenseur des droits Libre réponse 71120 75342
        Paris CEDEX 07
      </li>
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
