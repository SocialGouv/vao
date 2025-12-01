import { computed, useOrganismeStore, useUserStore } from "#imports";
import { ROLES as userRolesRef } from "../helpers/users";

export const useMenuNavItems = () => {
  const userStore = useUserStore();
  const organismeStore = useOrganismeStore();
  if (userStore.isConnected) {
    organismeStore.setMyOrganisme();
  }
  return computed(() => {
    if (!userStore.isConnected) {
      return [];
    }

    return [
      {
        text: "Accueil",
        to: "/",
      },
      {
        title: "Organisateur",
        links: [
          {
            text: "Ma fiche organisateur",
            to: "/organisme",
          },
          {
            text: "Liste des utilisateurs",
            to: "/utilisateurs/liste",
          },
        ],
      },
      {
        title: "Agrément",
        links: [
          {
            text: "Renouvellements d'agrément",
            to: "/agrement",
          },
        ],
      },
      ...(organismeStore.organismeCourant?.complet
        ? [
            {
              title: "Déclaration de séjour",
              links: [
                {
                  text: "Nouvelle déclaration",
                  to: "/demande-sejour",
                },
                {
                  text: "Mes déclarations",
                  to: "/demande-sejour/liste",
                },
                {
                  text: "Messagerie",
                  to: "/messagerie",
                },
              ],
            },
            {
              text: "Mes hébergements",
              to: "/hebergements/liste",
            },
            ...(userStore.user?.roles?.some((role) =>
              [userRolesRef.EIG_LECTURE, userRolesRef.EIG_ECRITURE].includes(
                role,
              ),
            )
              ? [
                  {
                    title: "EIG",
                    links: [
                      { text: "Mes EIG", to: "/eig/liste" },
                      ...(userStore.user?.roles?.includes(
                        userRolesRef.EIG_ECRITURE,
                      )
                        ? [{ text: "Créer un EIG", to: "/eig" }]
                        : []),
                    ],
                  },
                ]
              : []),
          ]
        : []),
    ];
  });
};
