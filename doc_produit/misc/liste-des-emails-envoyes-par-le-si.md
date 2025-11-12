---
icon: envelope-open-text
---

# Liste des emails envoyés par le SI

Plusieurs notifications par mails sont envoyées par la plateforme VAO.&#x20;

Voici la liste de l'ensemble de ces notifications



## Création de compte agent

{% include "../.gitbook/includes/mail-agent-confirmation-de-creation-de-compte.md" %}

{% include "../.gitbook/includes/agent-confirmation-de-creation-de-compte.md" %}

## Création de compte OVA

### Scénario 1 - L’organisme n’existe pas sur la plateforme VAO&#x20;

{% include "../.gitbook/includes/notif-ova-demande-de-creation-de-compte.md" %}

{% include "../.gitbook/includes/ova-confirmation-de-demande-dinscription.md" %}

{% include "../.gitbook/includes/ova-inscription-validee.md" %}

{% include "../.gitbook/includes/ova-compte-deja-existant.md" %}

{% include "../.gitbook/includes/agent-dreets-validation-de-creation-de-compte-ova.md" %}

{% include "../.gitbook/includes/ova-refus-dinscription.md" %}

***

### Scénario 2 – L’organisme a déjà un ou plusieurs comptes utilisateurs sur la plateforme VAO

{% include "../.gitbook/includes/ova-confirmation-de-demande-dinscription-par-ova.md" %}

{% include "../.gitbook/includes/ova-validation-de-creation-de-compte-ova.md" %}

{% include "../.gitbook/includes/ova-refus-dinscription-par-lova.md" %}

## Notification compte bloqué

<details>

<summary>Notification compte bloqué</summary>

* **Déclencheur :** Un compte utilisateur est bloqué (désactivé)

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur dont le compte a été bloqué

* **Object du mail** : Portail VAO - Votre compte a été bloqué

- **Contenu du mail** :

```
Portail VAO - Compte bloqué

Bonjour,

Votre compte sur le portail VAO a été bloqué.

Pour plus d'informations, veuillez contacter le support.

Cordialement.
L'équipe du SI VAO
Portail VAO
```

</details>

## Déclaration de séjour 2 moi

{% include "../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois (1).md" %}

{% include "../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois-confirmation.md" %}

<details>

<summary>Messagerie - Nouveau message</summary>

* **Déclencheur :** Un utilisateur (OVA ou Agent) qui écrit un message dans l'onglet "messagerie" du contexte d'une déclaration de séjour

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : Utilisateurs (OVA ou Agent) destinataire du message. &#x20;

* **Object du mail** : nouveau message sur la déclaration \[Numéro de DS]

- **Contenu du mail** :&#x20;

```
Portail VAO - Nouveau message

Bonjour,

Le message ci dessous vous a été adressé relativement à la déclaration [NUMERO DE DS]. Il est consultable dans l'onglet Messagerie.

> [Texte renseignée par le déclencheur]

[Bouton] Accéder à ma déclaration

Cordialement.
L'équipe du SI VAO
Portail VAO
```



</details>

{% include "../.gitbook/includes/demande-de-complement-dinformation-2-mois-et-8j.md" %}

{% include "../.gitbook/includes/refus-et-annulation-de-la-declaration-de-sejour-2-mois-et-8j.md" %}

{% include "../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois.md" %}

<details>

<summary>Rappel OVA - Récapitulatif des déclarations de séjour à réaliser #1</summary>

* **Déclencheur :** Une fois par jour, récupération de tous les DS en cours

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur OVA qui a réalisé la DS

* **Object du mail** : Séjours VAO – Récapitulatif des déclarations de séjour en attente de traitement de votre part

- **Contenu du mail** :&#x20;

```
Bonjour,

Vous trouverez ci-dessous la liste des déclarations VAO sur lesquelles une action de votre part est attendue,

AUTRES DECLARATIONS DE SEJOUR NECESSITANT UNE ACTION DE VOTRE PART

[N° de la DS] - [Ville du séjour]
Statut de la déclaration : [STATUT]
Date de début du séjour : [Date de début du séjour]


Si vous avez des difficultés pour traiter vos déclarations, vous vous rappelons que vous pouvez [Lien - contacter le support utilisateur].

De plus, vous avez toujours la possibilité d’annuler des déclarations de séjours qui ne sont plus d’actualité pour garder votre tableau à jour.

[BOUTON - Accéder à mes déclarations]

Cordialement.
L'équipe du SI VAO

Ce courriel est un message automatique, merci de ne pas répondre.
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 11.32.27.png" alt=""><figcaption></figcaption></figure>



</details>

<details>

<summary>Rappel OVA - Récapitulatif des déclarations de séjour à réaliser #2</summary>

*   **Déclencheur :**&#x20;

    > Chaque jour, un mail est envoyé aux utilisateurs OVA dont une déclaration de séjour est au statut ATTENTE\_8\_JOUR, lorsque la date du jour est comprise entre J-(8 + délai de rappel) et J-8, J étant la date de début du séjour (par défaut, le délai de rappel est de 3 jours).

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur OVA qui a réalisé la DS

* **Object du mail** : Séjours VAO – Récapitulatif des déclarations de séjour en attente de traitement de votre part&#x20;

- **Contenu du mail** :&#x20;

```
Bonjour,

Il vous reste [N] jours à compter du [Date] pour réaliser la déclaration de séjour à 8 jours pour le séjour «[Titre séjour]».
Passé ce délai, il ne vous sera plus possible de constituer le dossier pour votre séjour.

Cordialement.
L'équipe du SI VAO

Ce courriel est un message automatique, merci de ne pas répondre.
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 11.37.07.png" alt=""><figcaption></figcaption></figure>





</details>

<details>

<summary>Rappel Agent - Récapitulatif des déclarations de séjour à instruire</summary>

* **Déclencheur :** chaque jour, un message est envoyé à l'agent instructeur du département pour instruire le dossier dont le statut est `TRANSMISE, EN_COURS, TRANSMISE_8J, EN_COURS_8J`

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur agent de la DDEETS qui instruit la DS

* **Object du mail** : Séjours VAO – Récapitulatif des déclarations de séjour en attente de traitement de votre part&#x20;

- **Contenu du mail** :&#x20;

<pre><code>Bonjour,

Vous trouverez ci-dessous la liste des déclarations VAO sur lesquelles une action de votre part est attendue,

AUTRES DECLARATIONS DE SEJOUR NECESSITANT UNE ACTION DE VOTRE PART

[N° de la DS] - [Ville du séjour]
Statut de la déclaration : [STATUT]
Date de début du séjour : [Date de début du séjour]

[BOUTON - Accéder à mes déclarations]

<strong>Cordialement.
</strong><strong>L'équipe du SI VAO
</strong>
Ce courriel est un message automatique, merci de ne pas répondre.
</code></pre>

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 16.18.55.png" alt=""><figcaption></figcaption></figure>

</details>

{% include "../.gitbook/includes/validation-de-la-declaration-de-sejour-8-jours.md" %}

{% include "../.gitbook/includes/validation-de-la-declaration-de-sejour-8-jours-confirmation.md" %}

<details>

<summary>OVA - Annulation d'une déclaration de séjour</summary>

* **Déclencheur :** L'utilisateur OVA annule une déclaration de déjour

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : Lui-même

* **Object du mail** : Portail VAO - Déclaration annulée : \[Numero de DS]

- **Contenu du mail**&#x20;

```
Portail VAO - Déclaration annulée

Bonjour,

Votre déclaration [Numero de DS] a bien été annulée à votre demande.

Les services compétents ont été avisés de cette annulation.

[BOUTON - Accéder à mes déclarations]

Cordialement.
L'équipe du SI VAO
Portail VAO
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 17.16.38.png" alt=""><figcaption></figcaption></figure>

</details>

<details>

<summary>Agent - Annulation d'une déclaration de séjour</summary>

* **Déclencheur :** L'utilisateur OVA annule une déclaration de déjour

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'agent du département où se passe le séjour

* **Object du mail** : Portail VAO - Déclaration annulée : \[Numero de DS]

- **Contenu du mail**&#x20;

<pre><code>Portail VAO - Déclaration annulée : [Numero de DS]
<strong>
</strong><strong>Bonjour,
</strong>
La déclaration [Numero de DS], «[Titre de la DS]», vient d'être annulée par l'organisateur sur le portail VAO


Il n'y a plus aucune action à effectuer dessus.

[BOUTON - Liste des déclarations en cours]

Cordialement.
L'équipe du SI VAO
Portail VAO
</code></pre>

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 17.20.51.png" alt=""><figcaption></figcaption></figure>

</details>

{% include "../.gitbook/includes/validation-et-enregistrement-de-la-declartion-de-sejours.md" %}



## EIG

{% include "../.gitbook/includes/agent-region-declaration-dun-evenement-indesirable.md" %}

{% include "../.gitbook/includes/agent-departement-declaration-dun-evenement-indesirable.md" %}

{% include "../.gitbook/includes/ova-declaration-dun-evenement-indesirable.md" %}

{% include "../.gitbook/includes/ova-porteur-agrement-declaration-dun-evenement-indesirable.md" %}

## Gestion des comptes (v1.24.0)

### Notification de désactivation imminente (2 mois)

<details>

<summary>OVA - Notification compte inactif (2 mois avant suppression)</summary>

* **Déclencheur :** Un compte utilisateur n'a pas été utilisé depuis une période prolongée (2 mois avant la date de suppression prévue)

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur dont le compte est inactif

* **Object du mail** : Portail VAO - Votre compte sera désactivé

- **Contenu du mail** :

```
Portail VAO - Notification compte inactif

Bonjour,

Votre compte sur le portail VAO n'a pas été utilisé depuis une période prolongée.

Pour éviter la désactivation de votre compte, veuillez vous connecter dans les 2 mois.

Si vous ne vous connectez pas, votre compte sera automatiquement désactivé.

[BOUTON - Se connecter]

Cordialement.
L'équipe du SI VAO
Portail VAO
```

</details>

### Notification de gestion avant suppression

<details>

<summary>OVA - Notification gestion compte avant suppression</summary>

* **Déclencheur :** Un compte utilisateur est sur le point d'être supprimé, le système vérifie s'il peut être réactivé

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur dont le compte est concerné

* **Object du mail** : Portail VAO - Réactivation de votre compte

- **Contenu du mail** :

```
Portail VAO - Réactivation de compte

Bonjour,

Votre compte sur le portail VAO peut être réactivé.

Si vous souhaitez continuer à utiliser la plateforme, veuillez vous connecter pour réactiver votre compte.

[BOUTON - Se connecter]

Cordialement.
L'équipe du SI VAO
Portail VAO
```

</details>

### Notification de suppression de compte inactif

<details>

<summary>OVA - Notification suppression compte inactif</summary>

* **Déclencheur :** Un compte utilisateur inactif a été automatiquement supprimé

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur dont le compte a été supprimé

* **Object du mail** : Portail VAO - Votre compte a été supprimé

- **Contenu du mail** :

```
Portail VAO - Suppression de compte

Bonjour,

Votre compte sur le portail VAO a été supprimé en raison d'une inactivité prolongée.

Si vous souhaitez continuer à utiliser la plateforme, vous devrez créer un nouveau compte.

Pour plus d'informations, veuillez contacter le support.

Cordialement.
L'équipe du SI VAO
Portail VAO
```

</details>
