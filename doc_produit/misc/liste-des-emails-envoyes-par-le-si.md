# Liste des emails envoyés par le SI

Plusieurs notifications par mails sont envoyées par la plateforme VAO.&#x20;

Voici la liste de l'ensemble de ces notifications



## Création de compte agent

{% include "../.gitbook/includes/mail-agent-confirmation-de-creation-de-compte.md" %}

{% include "../.gitbook/includes/agent-confirmation-de-creation-de-compte.md" %}

## Création de compte OVA&#x20;

{% include "../.gitbook/includes/notif-ova-demande-de-creation-de-compte.md" %}

{% include "../.gitbook/includes/ova-confirmation-de-demande-dinscription.md" %}

{% include "../.gitbook/includes/ova-inscription-validee.md" %}

<details>

<summary><span data-gb-custom-inline data-tag="emoji" data-code="26a0">⚠️</span> Compte déjà existant</summary>

* **Déclencheur :** Tentative de création de compte avec une adresse déjà enregistrée
* **Expéditeur :** nepasrepondre@vao.social.gouv.fr
* **Destinataire** : Utilisateur ayant déjà le compte associé à l'adresse email
* **Object du mail** : Portail VAO - Votre compte existe déjà
* **Contenu du mail** :&#x20;

```
Bonjour,

Une tentative de création de compte a été faite avec cette adresse e-mail sur [Nom de l'application].

Nous vous rappelons que cette adresse e-mail est déjà associée à un compte existant.  
Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser ici :

➡️ [Lien sécurisé vers la réinitialisation de mot de passe]

Si ce n'était pas vous, vous pouvez ignorer cet e-mail.  
Aucune action n’est requise de votre part.

Merci,  
L’équipe [Nom de l'application]
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-20 à 14.18.30.png" alt=""><figcaption></figcaption></figure>

</details>

{% include "../.gitbook/includes/agent-dreets-validation-de-creation-de-compte-ova.md" %}

## Déclaration de séjour 2 mois

<details>

<summary>Validation de la déclaration de séjour - 2 mois</summary>

* **Déclencheur :** L'utilisateur OVA qui a validé la déclaration de séjour à 2 mois

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : Email de la DDEETS rattaché au lieu d'hébergement du séjour

* **Object du mail** : Portail VAO - Nouvelle déclaration déposée : \[Numéro de DS]

- **Contenu du mail** :&#x20;

```
PORTAIL VAO ADMINISTRATION - NOUVELLE DECLARATION DE SEJOUR

Bonjour,

La déclaration de séjour [Numéro de DS] vient d'être déposée sur le portail VAO.

La DDETS du département [Numéro de département] est en charge de l'instruction de cette déclaration.

[BOUTON] Accéder aux déclarations transmises

Cordialement.
L'équipe du SI VAO
https://vao-preprod.ovh.fabrique.social.gouv.fr
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-16 à 11.40.12.png" alt=""><figcaption></figcaption></figure>

</details>

<details>

<summary>Validation de la déclaration de séjour -  2 mois - confirmation</summary>

* **Déclencheur :** L'utilisateur OVA qui a validé la déclaration de séjour à 2 mois

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : Lui-même

* **Object du mail** : Portail VAO - Transmission de la déclaration de séjour VAO n°\[Numero de DS]

- **Contenu du mail** :&#x20;

```

Portail VAO - Transmission de la déclaration de séjour

Bonjour,

Votre déclaration de séjour n°[numero de DS] a bien été transmise au(x) service(s) instructeur(s) le [Date du jour]].

[BOUTON] Accéder à ma déclaration

Cordialement.
L'équipe du SI VAO
Portail VAO
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-16 à 14.19.18.png" alt=""><figcaption></figcaption></figure>

</details>

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

<details>

<summary>Demande de complément d'information - 2 mois et 8J</summary>

* **Déclencheur :** L'agent qui instruit une déclaration de séjour 2 mois, demande un complément d'information pour valider la déclaration.&#x20;

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : l'utilisateur OVA qui a réalisé la déclaration de séjour 2 mois&#x20;

* **Object du mail** : Portail VAO - Demande de compléments sur la déclaration \[N° de la DS]

- **Contenu du mail** :&#x20;

<pre><code>Portail VAO - demande de complément
<strong>
</strong><strong>Bonjour,
</strong>
Vous avez reçu des demandes de complément pour votre déclaration [N° de la DS]

Vous trouverez ci-joint le message de la DDETS [Nom du département]

> [Texte du message]

[BOUTON - Accéder à ma déclaration]

Cordialement.
L'équipe du SI VAO
Portail VAO
</code></pre>

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-16 à 15.48.42.png" alt=""><figcaption></figcaption></figure>

</details>

<details>

<summary>Refus et annulation de la déclaration de séjour - 2 mois et 8J</summary>

* **Déclencheur :** L'agent qui instruit une déclaration de séjour 2 mois, refuse la déclaration de séjour.&#x20;

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : l'utilisateur OVA qui a réalisé la déclaration de séjour 2 mois&#x20;

* **Object du mail** : Refus la déclaration \[N° de la DS]

- **Contenu du mail** :&#x20;

```
Portail VAO - Déclaration annulée

Bonjour,

Votre déclaration [N° de la DS] a été refusée pour les raisons indiquées ci dessous.

> [TEXTE RENSEIGNÉ PAR L'AGENT]

[BOUTON - Accéder à mes déclarations]

Cordialement.
L'équipe du SI VAO
Portail VAO
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-16 à 15.54.12.png" alt=""><figcaption></figcaption></figure>



</details>

<details>

<summary>Validation de la déclaration de séjour - 2 mois</summary>

* **Déclencheur :** L'agent qui instruit une déclaration de séjour 2 mois, valide la déclaration de séjour.&#x20;

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : l'utilisateur OVA qui a réalisé la déclaration de séjour 2 mois&#x20;

* **Object du mail** : Portail VAO - Enregistrement de la déclaration \[N° de la DS]

- **Contenu du mail** :&#x20;

```
Portail VAO - accusé de réception de déclaration de séjour

Bonjour,

Vous êtes titulaire de l’agrément « Vacances adaptées organisées » délivré le [Date du jour] et avez déposé en date du [Date de l'envoie de la DS], une déclaration pour le séjour « [Titre de la DS] » que vous organisez du [Date début] au [Date fin].

Nous accusons ce jour, le [Date du jour], réception de votre déclaration [N° de la DS].

Vous devrez, huit jours avant le déroulement de ce séjour, réaliser la déclaration complémentaire prévue à l’article R. 412-14 du code du tourisme.

[BOUTON - Accéder à ma déclaration]

Cordialement.
L'équipe du SI VAO
Portail VAO
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 11.21.39.png" alt=""><figcaption></figcaption></figure>



</details>

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

<details>

<summary>Validation de la déclaration de séjour - 8 jours</summary>

* **Déclencheur :** L'utilisateur OVA qui a validé la déclaration de séjour à 8 jours

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : Email de la DDEETS rattaché au lieu d'hébergement du séjour

* **Object du mail** : Portail VAO - Déclaration à jours déposée : \[Numéro de DS]

- **Contenu du mail** :&#x20;

```
PORTAIL VAO ADMINISTRATION - NOUVELLE DECLARATION DE SEJOUR

Bonjour,

La déclaration de séjour à 8 jours [Numéro de DS] vient d'être déposée sur le portail VAO.

La DDETS du département [Numéro de département] est en charge de l'instruction de cette déclaration.

[BOUTON] Accéder aux déclarations transmises

Cordialement.
L'équipe du SI VAO
https://vao-preprod.ovh.fabrique.social.gouv.fr
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 16.29.31.png" alt=""><figcaption></figcaption></figure>

</details>

<details>

<summary>Validation de la déclaration de séjour -  8 jours - confirmation</summary>

* **Déclencheur :** L'utilisateur OVA qui a validé la déclaration de séjour à 8 jours

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : Lui-même

* **Object du mail** : Portail VAO - "Transmission de la déclaration de séjour à 8 jours n°\[Numero de DS]

- **Contenu du mail** :&#x20;

```

Portail VAO - Transmission de la déclaration de séjour à 8 jours

Bonjour,

Votre déclaration à 8 jours n°[numero de DS] a bien été transmise au(x) service(s) instructeur(s) le [Date du jour].

[BOUTON] Accéder à ma déclaration

Cordialement.
L'équipe du SI VAO
Portail VAO
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 17.18.19.png" alt=""><figcaption></figcaption></figure>

</details>

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

<details>

<summary>Validation et enregistrement de la déclartion de séjours </summary>

* **Déclencheur :** L'agent en département valide une déclaration de séjour 8J

- **Expéditeur :** nepasrepondre@vao.social.gouv.fr
- **Destinataire** : L'utilisateur OVA

* **Object du mail** : Portail VAO - Enregistrement de la déclaration \[Numero de DS]

- **Contenu du mail**&#x20;

```
Portail VAO - accusé de réception de déclaration complémentaire

Bonjour,

Vous êtes titulaire de l’agrément « Vacances adaptées organisées » délivré le [DATE DE LIVRANCE DE L'AGRÉMENT] et avez déposé en date du [DATE DU JOUR], une déclaration complémentaire pour le séjour « [Titre séjour] » que vous organisez du [DATE DEBUT] au [DATE FIN].

Nous accusons ce jour, le [DATE DU JOUR], réception de votre déclaration [Numero de DS].

[BOUTON - Accéder à ma déclaration]

Cordialement.
L'équipe du SI VAO
Portail VAO
```

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-18 à 17.45.11.png" alt=""><figcaption></figcaption></figure>

</details>





