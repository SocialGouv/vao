# Scénario 2 – L’organisme a déjà un ou plusieurs comptes utilisateurs sur la plateforme VAO



{% stepper %}
{% step %}
### L’utilisateur OVA renseigne le formulaire de création de compte

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/image (5).png" alt=""><figcaption></figcaption></figure>

</details>

Un email est envoyé à l'utilisateur OVA pour valider son email.&#x20;

{% include "../../.gitbook/includes/notif-ova-demande-de-creation-de-compte.md" %}

L’utilisateur OVA valide sa demande d’inscription via le bouton disponible dans le mail. Validité du lien 1h.

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

</details>

L'utilisateur OVA reçoit une confirmation de sa demande d'inscription.

{% include "../../.gitbook/includes/ova-confirmation-de-demande-dinscription-par-ova.md" %}
{% endstep %}

{% step %}
### L'OVA valide le nouveau compte de l'utilisateur l'OVA

Suite à la confirmation de la demande de création de compte, le 1er compte créé historiquement par l'organisme OVA reçoit une notification pour alerter qu’un nouvel utilisateur de sont organisme souhaite créer un compte sur le SI-VAO.

{% include "../../.gitbook/includes/ova-validation-de-creation-de-compte-ova.md" %}

En cliquant sur le lien du la notification, l'utilisateur OVA ayant déjà un compte est renvoyé sur le SI-VAO - page "Liste des utilisateurs de l'organisme", afin de valider ou non la demande de l’utilisateur qui souhaite créer un compte

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-26 à 16.14.06.png" alt=""><figcaption></figcaption></figure>

</details>

L'utilisateur étant déjà inscrit valide l’inscription

* La ligne de l’utilisateur change de statut "En attente validation compte" à "Validé"

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-26 à 16.16.17.png" alt=""><figcaption></figcaption></figure>

</details>

L'utilisateur souhaitant s'inscrire reçoit un mail de confirmation d'inscription au SI VAO

{% include "../../.gitbook/includes/ova-inscription-validee.md" %}
{% endstep %}

{% step %}
### L'OVA refuse la création de compte de l'utilisateur l'OVA

Suite à la demande d'inscription d'un OVA et comme dans la démarche de validation, le compte OVA existant reçoit une notification pour valider / refuser l'inscription d'un nouvel OVA.

Dans le cas d'un refus, dans la page de liste des demandes en cours, il est possible de cliquer sur le bouton refus.

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-26 à 16.36.19.png" alt=""><figcaption></figcaption></figure>

</details>

Lors du clic sur le bouton refus, une popup d'affiche pour argumenter le refus via un formulaire. Le champ "Motif de refus" est obligatoire.

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-26 à 16.37.59.png" alt=""><figcaption></figcaption></figure>

</details>

Au clic sur le bouton "Refuser" :

* La ligne de l’utilisateur change de statut "En attente validation compte" à "compte Bloqué"

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-06-26 à 16.40.49.png" alt=""><figcaption></figcaption></figure>

</details>

L’utilisateur OVA souhaitant s'inscrire reçoit un mail de refus avec le texte renseigné par l'agent dans le formulaire de refus.

{% include "../../.gitbook/includes/ova-refus-dinscription-par-lova.md" %}
{% endstep %}

{% step %}
### Le compte existe déjà ?

Lors de la demande de création de compte via le formulaire d'inscription, si l'OVA renseigne un email déjà enregistré dans le SI VAO, l'utilisateur dont le mail est renseigne reçoit une notification par email.

{% include "../../.gitbook/includes/ova-compte-deja-existant.md" %}
{% endstep %}
{% endstepper %}

