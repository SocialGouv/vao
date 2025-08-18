# Instruction déclaration à 8 jours

Lorsqu'un OVA soumet une déclaration de séjour à 2 mois (statut "transmise"), l'agent de la DDETS reçois une notification par email pour l'informer.&#x20;

{% include "../../.gitbook/includes/validation-de-la-declaration-de-sejour-8-jours.md" %}

Dans [la page de liste des déclarations](page-de-liste-des-declarations.md), l'agent doit cliquer sur le bouton "Action" d'une déclaration pour l'instruire.&#x20;

Une pop-up s'ouvre pour confirmer la prise en charge de la déclaration.&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d'écran 2025-07-07 à 11.02.48.png" alt=""><figcaption><p>Pop-up de prise en charge de la déclaration de séjour par un agent</p></figcaption></figure>

</details>

Au clic sur le bouton "Valider la prise en charge" :&#x20;

* L'agent est dirigé vers la page détaillée
* Le statut de la déclaration passe en `En cours 8J`

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d'écran 2025-07-07 à 11.04.49.png" alt=""><figcaption><p>Page détaillé d'une déclaration de séjour pour l'instruction</p></figcaption></figure>

</details>

Dans cette étape d'instruction, l'agent peut :&#x20;

* Accéder à l'ensemble des informations de la déclarations via les différents onglets de la page détaillée
* Réaliser 3 actions spécifique :
  * Demander des compléments d'informations à l'organisateur
  * Refuser
  * Accepter

***

### Demande de complément d'informations

L'agent peut demander des compléments d'informations à l'organisateur pour valider la déclaration de séjour.

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-07 à 11.07.37.png" alt=""><figcaption><p>Pop-up de "Demander des compléments à l'organisateur"</p></figcaption></figure>

</details>

Pour cela, en cliquant sur le bouton "Demander des compléments à l'organisateur", une pop-up s'ouvre avec un formulaire à renseigner :&#x20;

* Un champ unique de texte "Commentaires"
* Il est obligatoire
* Le bouton de validation n'apparait que si le champ texte est rempli d'à minima 5 caractères.&#x20;
* Au clic sur le bouton "Valider" :&#x20;
  * La déclaration passe au statut `À modifier 8J`
  * Les commentaires sont logués dans [l'historique de la déclaration](../../front-ova/declaration-de-sejour/page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
  * Une notification est envoyée, avec les commentaires, à l'organisateur pour qu'il modifie la déclaration

{% include "../../.gitbook/includes/demande-de-complement-dinformation-2-mois-et-8j.md" %}

***

### Refuser

L'agent peut refuser une déclaration de séjour&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-07 à 11.10.27.png" alt=""><figcaption><p>Pop-up de "Refus"</p></figcaption></figure>

</details>

Pour cela, en cliquant sur le bouton "Refuser", une pop-up s'ouvre avec un formulaire à renseigner :&#x20;

* Un champ unique de texte "Commentaires"
* Il est obligatoire
* Le bouton de validation n'apparait que si le champ texte est rempli d'à minima 5 catactères.&#x20;
* Au clic sur le bouton "Valider" :&#x20;
  * La déclaration passe au statut `Refusé 8J`
  * Les commentaires sont logués dans [l'historique de la déclaration](../../front-ova/declaration-de-sejour/page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
  * Une notification est envoyée, avec les commentaires, à l'organisateur pour le notifier du refus de la déclaration de séjour

{% include "../../.gitbook/includes/refus-et-annulation-de-la-declaration-de-sejour-2-mois-et-8j.md" %}

* Il n'est plus possible, pour l'OVA et l'agent, de revenir sur cette déclaration

***

### Valider

L'agent peut valider une déclaration de séjour&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-07 à 11.12.38.png" alt=""><figcaption><p>Pop-up de validation</p></figcaption></figure>

</details>

Pour cela, en cliquant sur le bouton "Accepter", une pop-up s'ouvre avec un bouton de confirmation "Enregistrer la déclaration" :&#x20;

* Au clic sur le bouton "Enregistrer la déclaration" :&#x20;
  * La déclaration passe au statut `VALIDEE 8J`
  * La validation est loguée dans [l'historique de la déclaration](../../front-ova/declaration-de-sejour/page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
  * Une notification est envoyée à l'organisateur pour le notifier de la validation de la déclaration de séjour

{% include "../../.gitbook/includes/validation-et-enregistrement-de-la-declartion-de-sejours.md" %}

* C'est la fin du parcours de déclaration dans le cadre d'une instruction validée
* Quand le séjour commence (date de début), le statut passe à `SEJOUR EN COURS`&#x20;
* Quand le séjour finit (date de fin), le statut passe à `TERMINEE`&#x20;

