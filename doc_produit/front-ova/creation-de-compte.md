---
icon: circle-user
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
---

# Création de compte

{% hint style="warning" %}
**Important**\
La création de compte nécessite **une étape de validation obligatoire** avant de pouvoir accéder à la plateforme.

\
Cette validation peut être effectuée selon **2 scénarios spécifiques** :

1. L’organisme n’a pas encore de compte utilisateur sur la plateforme VAO (aucun SIRET rattaché) : c’est **la région** à laquelle est rattaché l’organisme qui validera la demande de création de compte
2. L’organisme a déjà un compte utilisateur sur la plateforme VAO (SIRET déjà renseigné sur la plateforme) : c’est **un utilisateur déjà inscrit** dont le compte est lié à l’organisme qui validera la demande de création de compte
{% endhint %}

## Scénario 1 - L’organisme n’existe pas sur la plateforme VAO

<figure><img src="../.gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

{% stepper %}
{% step %}
### L’utilisateur OVA renseigne le formulaire de création de compte

<details>

<summary>Capture</summary>

<figure><img src="../.gitbook/assets/Capture d’écran 2025-06-20 à 21.31.37.png" alt=""><figcaption><p>Page de création de compte pour les OVA</p></figcaption></figure>

</details>

Un email est envoyé à l'utilisateur OVA pour confirmer sa demande

{% include "../.gitbook/includes/notif-ova-demande-de-creation-de-compte.md" %}

L’utilisateur OVA valide sa demande d’inscription via le bouton disponible dans le mail. Validité du lien 1h.

<details>

<summary>Capture</summary>

<figure><img src="../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

</details>

L'utilisateur OVA reçoit une conformation de sa validation d'inscription

{% include "../.gitbook/includes/ova-confirmation-de-demande-dinscription.md" %}
{% endstep %}

{% step %}
### La DREETS valide le compte de l'OVA

Suite à la confirmation de la demande de création de compte, la DREETS de la région où est situé l’OVA reçoit une notification pour alerter qu’un nouvel utilisateur OVA souhaite créer un compte sur le SI-VAO

{% include "../.gitbook/includes/agent-dreets-validation-de-creation-de-compte-ova.md" %}

En cliquant sur le lien du la notification, la DREETS est renvoyé sur le SI-VAO, côté Back - page "Liste des nouveaux comptes à valider", afin de valider ou non la demande de l’utilisateur.

<details>

<summary>Capture</summary>

<figure><img src="../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

</details>

La DREETS valide l’inscription

* La ligne de l’utilisateur disparait de la liste des comptes à valider
* La ligne apparait dans la liste des comptes validés

<details>

<summary>Capture</summary>

<figure><img src="../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

</details>

L’utilisateur OVA reçoit un mail de confirmation.

{% include "../.gitbook/includes/ova-inscription-validee.md" %}
{% endstep %}

{% step %}
### La DREETS refuse la création de compte de l'OVA


{% endstep %}
{% endstepper %}

<details>

<summary>Capture</summary>



</details>
