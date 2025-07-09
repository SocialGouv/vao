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

# Page de liste des EIG

La page liste des EIG permet aux organisateurs de consulter et gérer tous leurs événements indésirables graves déclarés sur la plateforme VAO.

<figure><img src="../../.gitbook/assets/Capture d’écran 2025-07-09 à 13.26.20.png" alt=""><figcaption></figcaption></figure>

## Fonctionnalités principales

### Affichage des EIG

La page affiche un tableau avec les informations suivantes pour chaque déclaration :

| Colonne                 | Description                      |
| ----------------------- | -------------------------------- |
| **Déclaration**         | Code de la déclaration de séjour |
| **Date de déclaration** | Date de création de l'EIG        |
| **Territoire**          | Département de survenue          |
| **Séjour**              | Libellé du séjour concerné       |
| **Dates (Début-fin)**   | Période du séjour                |
| **Types d'événement**   | Catégories et types d'incidents  |
| **Date de l'incident**  | Date de survenue de l'EIG        |
| **Statut**              | État actuel de l'EIG             |
| **Actions**             | Boutons d'action (suppression)   |

### Barre de recherche et filtres

Il est possible de filtrer les EIG via des filtres

| Filtre               | Description                           | Type               |
| -------------------- | ------------------------------------- | ------------------ |
| **Déclaration**      | Code de la déclaration de séjour      | Texte              |
| **Séjour**           | Libellé du séjour                     | Texte              |
| **Type d'événement** | Catégorie et type d'EIG               | Sélection multiple |
| **Statut**           | État de l'EIG (Brouillon, Envoyé, Lu) | Sélection multiple |
| **Date de l'EIG**    | Période de survenue de l'incident     | Plage de dates     |

***

### **Suppression d'un EIG**

**Conditions :**

* EIG en statut `BROUILLON` uniquement
* Confirmation obligatoire

**Processus :**

1. Clic sur l'icône de suppression
2. Modal de confirmation
3. Suppression définitive de l'EIG
