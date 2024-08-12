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
        <a target="_blank" href="https://vao.social.gouv.fr/"
          >https://vao.social.gouv.fr/</a
        ></strong
      >
      est <strong>non</strong> conforme avec le référentiel général
      d’amélioration de l’accessibilité (RGAA).
    </p>

    <h2>Résultats des tests</h2>

    <p>
      L’audit de conformité réalisé par <strong>Access Ethics</strong> révèle
      que <strong>47%</strong> des critères du RGAA version 4 sont respectés.
    </p>

    <h2>Contenus non accessibles</h2>

    <h3>Non-conformités</h3>

    <div>
      <p>
        Liste non exhaustive des erreurs d'accessibilité présentes sur le site :
      </p>

      <ul role="list">
        <li role="listitem">
          les contrastes ne sont pas respectés sur les messages d'erreur ;
        </li>

        <li role="listitem">
          certains composants interactifs ne sont pas correctement identifiable
          ;
        </li>

        <li role="listitem">
          certains liens ne sont pas pertinents et des boutons n'ont pas de nom
          ;
        </li>

        <li role="listitem">le code HTML n'est pas toujours valide ;</li>

        <li role="listitem">
          le changement de langue n'est pas toujours définit ;
        </li>

        <li role="listitem">
          éléments HTML utilisés à des fins de présentation ;
        </li>

        <li role="listitem">certains pages n'ont pas de titre pertinent ;</li>

        <li role="listitem">
          la structure des titres n'est pas toujours cohérentes ;
        </li>

        <li role="listitem">
          certains éléments ne sont pas structurés en liste ;
        </li>

        <li role="listitem">
          certains contenus ne sont pas présents sans CSS ;
        </li>

        <li role="listitem">
          les contenus sont parfois difficile à lire avec un zoom à 200% ;
        </li>

        <li role="listitem">
          certains contenu se chevauchent en mode portrait et nécessitent un
          scroll horizontal sur écran de 320px ;
        </li>

        <li role="listitem">les tableaux n'ont pas de titre ;</li>

        <li role="listitem">
          absence de lien d'accès rapide vers le contenu principal ;
        </li>

        <li role="listitem">
          les messages de statut ne sont pas toujours restitués ;
        </li>

        <li role="listitem">
          l'information est parfois indiquée uniquement par un picto ;
        </li>

        <li role="listitem">
          les champs de formulaire obligatoires ne sont pas correctement
          paramétrés ;
        </li>

        <li role="listitem">absence de texte d'aide ;</li>

        <li role="listitem">
          les données de l'usager ne sont pas prédéfinis dans les champs
          concernés ;
        </li>

        <li role="listitem">
          l'usager n'a pas le contrôle sur le temps de session.
        </li>
      </ul>
    </div>
    <h2>Établissement de cette déclaration d’accessibilité</h2>

    <p>
      Cette déclaration a été établie le <strong>23 avril 2024</strong>. Elle a
      été mise à jour le <strong>11 juillet 2024</strong>.
    </p>

    <h3>Technologies utilisées pour la réalisation de l’audit</h3>

    <ul role="list">
      <li role="listitem">HTML</li>
      <li role="listitem">CSS</li>
      <li role="listitem">Javascript</li>
    </ul>

    <h3>Environnement de test</h3>

    <p>
      Les vérifications de restitution de contenus ont été réalisées sur la base
      de la combinaison fournie par la base de référence du RGAA, avec les
      versions suivantes :
    </p>

    <ul role="list">
      <li role="listitem">Sur desktop MacOS avec Safari et VoiceOver</li>
      <li role="listitem">Sur desktop Windows avec Firefox et JAWS</li>
      <li role="listitem">Sur desktop Windows avec Firefox et NVDA</li>
      <li role="listitem">Sur mobile iOS avec Safari et VoiceOver</li>
    </ul>

    <h3>Outils pour évaluer l’accessibilité</h3>

    <ul role="list">
      <li role="listitem">Web Developer Toolbar</li>
      <li role="listitem">Colour Contrast Analyser</li>
      <li role="listitem">HeadingsMap</li>
      <li role="listitem">WCAG Contrast checker</li>
      <li role="listitem">Inspecteur de composants</li>
      <li role="listitem">Validateur HTML du W3C</li>
      <li role="listitem">Contraste élevé</li>
    </ul>

    <h3>Pages du site ayant fait l’objet de la vérification de conformité</h3>

    <ul role="list">
      <li role="listitem">
        Création de compte
        <strong>https://vao.social.gouv.fr/connexion/enregistrement</strong>
      </li>
      <li role="listitem">
        Mot de passe oublié
        <strong
          >https://vao.social.gouv.fr/connexion/mot-de-passe-oublie</strong
        >
      </li>
      <li role="listitem">
        Authentification <strong>https://vao.social.gouv.fr/connexion/</strong>
      </li>
      <li role="listitem">
        Mentions légales
        <strong>https://vao.social.gouv.fr/footer/mentions-legales</strong>
      </li>
      <li role="listitem">
        Données personnelles
        <strong>https://vao.social.gouv.fr/footer/donnees-personnelles</strong>
      </li>
      <li role="listitem">
        Ma fiche organisateur - Étape 1 sur 5 - Infos générales
        <strong>https://vao.social.gouv.fr/organisme/64</strong>
      </li>
      <li role="listitem">
        Ma fiche organisateur - Étape 2 sur 5 - Agrément
        <strong>https://vao.social.gouv.fr/organisme/64#agrement</strong>
      </li>
      <li role="listitem">
        Ma fiche organisateur - Étape 3 sur 5 - Infos transport
        <strong
          >https://vao.social.gouv.fr/organisme/64#protocole-transport</strong
        >
      </li>
      <li role="listitem">
        Accueil <strong>https://vao.social.gouv.fr/</strong>
      </li>
      <li role="listitem">
        Accessibilité
        <strong>https://vao.social.gouv.fr/footer/accessibilite</strong>
      </li>
      <li role="listitem">
        Ma fiche organisateur - Étape 4 sur 5 - Infos sanitaire
        <strong
          >https://vao.social.gouv.fr/organisme/64#protocole-sanitaire</strong
        >
      </li>
      <li role="listitem">
        Ma fiche organisateur - Étape 5 sur 5 - Synthèse
        <strong>https://vao.social.gouv.fr/organisme/64#synthese</strong>
      </li>
      <li role="listitem">
        Mes hébergements
        <strong>https://vao.social.gouv.fr/hebergements/liste</strong>
      </li>
      <li role="listitem">
        Création d'un hébergement
        <strong>https://vao.social.gouv.fr/hebergements</strong>
      </li>
      <li role="listitem">
        Mes séjours <strong>https://vao.social.gouv.fr/</strong>
      </li>
      <li role="listitem">
        Nouveau séjour : étape 1 : informations générales
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#info-generales</strong
        >
      </li>
      <li role="listitem">
        Nouveau séjour étape 2 : informations sur les vacanciers
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#info-vacanciers</strong
        >
      </li>
      <li role="listitem">
        Nouveau séjour étape 3 : informations sur le personnel
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#info-personnel</strong
        >
      </li>
      <li role="listitem">
        Nouveau séjour étape 4 : Sélection des hébergements
        <strong
          >https://vao.social.gouv.fr/demande-sejour/100#hebergements</strong
        >
      </li>
    </ul>

    <h2>Retour d’information et contact</h2>

    <p>
      Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez
      contacter le responsable de VAO (Vacances Adaptées Organisées) pour être
      orienté vers une alternative accessible ou obtenir le contenu sous une
      autre forme.
    </p>

    <ul role="list">
      <li role="listitem">
        Contacter
        <strong
          >Les Ministères Sociaux :
          referent-accessibilite@sg.social.gouv.fr</strong
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

    <ul role="list">
      <li role="listitem">Écrire un message au Défenseur des droits</li>
      <li role="listitem">
        Contacter le délégué du Défenseur des droits dans votre région
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
