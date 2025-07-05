---
layout:
  width: default
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

# Modification d'une déclaration

## Déclaration à 2 mois

Lorsque l'OVA reçoit une demande de compléments d'information sur la déclaration de séjour, il reçoit une nofication par email :&#x20;

{% include "../../.gitbook/includes/demande-de-complement-dinformation-2-mois-et-8j.md" %}

Il peut visualiser la déclaration dont le statut est `À modifier` dans la page de liste.&#x20;

<details>

<summary>Capture</summary>

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-05 à 20.43.12.png" alt=""><figcaption><p>Une déclaration avec le statut "À modifier"</p></figcaption></figure>

</details>

Au clic sur le bouton d'action dans la liste, l'utilisateur arrive sur la page détaillée de la déclaration et peut modifier les informations dans les différentes étapes du formulaire de déclaration de séjour.&#x20;

Afin de renvoyer la déclaration, il suffit de valider la synthèse ([étape 8](declaration-a-2-mois/etape-8-synthese.md)) avec les modifications réalisées dans le formulaire.&#x20;

Lors de validation de la synthès :&#x20;

* Le statut de la déclaration passe à `Transmise` &#x20;
* Un log est ajouté à [l'historique de la déclaration](page-detaillee-declaration.md#id-3.-historique-de-la-declaration)
* Un nouveau CERFA est disponible dans l'onglet "[Documents joints](page-detaillee-declaration.md#id-2.-documents-joints)"
* Une notification est envoyée à la DDEETS

{% include "../../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois.md" %}

* Une notification de confirmation est en à l'OVA&#x20;

{% include "../../.gitbook/includes/validation-de-la-declaration-de-sejour-2-mois-confirmation.md" %}

