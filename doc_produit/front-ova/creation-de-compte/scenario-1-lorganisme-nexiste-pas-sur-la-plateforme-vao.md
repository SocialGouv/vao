# Scénario 1 - L’organisme n’existe pas sur la plateforme VAO

<figure><img src="../../.gitbook/assets/création de compte.png" alt=""><figcaption></figcaption></figure>

{% stepper %}
{% step %}
### L’utilisateur OVA renseigne le formulaire de création de compte

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-20 à 21.31.37.png" alt=""><figcaption><p>Page de création de compte pour les OVA</p></figcaption></figure>

</details>

Un email est envoyé à l'utilisateur OVA pour confirmer sa demande

{% include "../../.gitbook/includes/notif-ova-demande-de-creation-de-compte.md" %}

L’utilisateur OVA valide sa demande d’inscription via le bouton disponible dans le mail. Validité du lien 1h.

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

</details>

L'utilisateur OVA reçoit une confirmation de sa demande d'inscription

{% include "../../.gitbook/includes/ova-confirmation-de-demande-dinscription.md" %}
{% endstep %}

{% step %}
### La DREETS valide le compte de l'OVA

Suite à la confirmation de la demande de création de compte, la DREETS de la région où est situé l’OVA reçoit une notification pour alerter qu’un nouvel utilisateur OVA souhaite créer un compte sur le SI-VAO

{% include "../../.gitbook/includes/agent-dreets-validation-de-creation-de-compte-ova.md" %}

En cliquant sur le lien du la notification, la DREETS est renvoyé sur le SI-VAO, côté Back - page "Liste des nouveaux comptes à valider", afin de valider ou non la demande de l’utilisateur.

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

</details>

La DREETS valide l’inscription

* La ligne de l’utilisateur disparait de la liste des comptes à valider
* La ligne apparait dans la liste des comptes validés

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

</details>

L’utilisateur OVA reçoit un mail de confirmation.

{% include "../../.gitbook/includes/ova-inscription-validee.md" %}
{% endstep %}

{% step %}
### La DREETS refuse la création de compte de l'OVA

Suite à la demande d'inscription d'un OVA et comme dans la démarche de validation, la DREETS reçoit une notification pour valider / refuser l'inscription d'un nouvel OVA.&#x20;

Dans le cas d'un refus, dans la page de liste des demandes en cours, il est possible de cliquer sur le bouton refus.&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

</details>

Lors du clic sur le bouton refus, une popup d'affiche pour argumenter le refus via un formulaire. Le champ "Motif de refus" est obligatoire.&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-25 à 16.13.51.png" alt=""><figcaption></figcaption></figure>

</details>

Au clic sur le bouton, refus :&#x20;

* La ligne de l’utilisateur disparait de la liste des comptes à valider
* La ligne apparait dans la liste des comptes, avec l'état bloqué :&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-25 à 16.23.08.png" alt=""><figcaption></figcaption></figure>

</details>

L’utilisateur OVA reçoit un mail de confirmation avec le texte renseigné par l'agent dans le formulaire de refus.&#x20;

{% include "../../.gitbook/includes/ova-refus-dinscription.md" %}
{% endstep %}

{% step %}
### Le compte existe déjà ?

Lors de la demande de création de compte via le formulaire d'inscription, si l'OVA renseigne un email déjà enregistré dans le SI VAO, l'utilisateur dont le mail est renseigne reçoit une notification par email :

{% include "../../.gitbook/includes/ova-compte-deja-existant.md" %}
{% endstep %}
{% endstepper %}
