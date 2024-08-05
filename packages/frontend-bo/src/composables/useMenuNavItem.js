import { useUserStore, computed } from "#imports";

export const useMenuNavItems = () => {
  const userStore = useUserStore();
  const menu = computed(() => {
    if (!userStore.isConnected) {
      return [];
    }
    const roles = userStore.user.roles ?? [];
    const comptes = roles.includes("Compte")
      ? [
          {
            title: "Comptes",
            links: [
              {
                text: "Back-office",
                to: "/comptes/liste",
              },
              {
                text: "Organismes",
                to: "/comptes/liste-organisme",
              },
            ],
          },
        ]
      : [
          {
            title: "Comptes",
            links: [
              {
                text: "Organismes",
                to: "/comptes/liste-organisme",
              },
            ],
          },
        ];
    return [
      {
        text: "Accueil",
        to: "/",
      },
      ...comptes,
      ...(roles.includes("DemandeSejour_Lecture") ||
      roles.includes("DemandeSejour_Ecriture")
        ? [
            {
              title: "Déclaration de séjour",
              links: [
                {
                  text: "Mes déclarations",
                  to: "/sejours",
                },
              ],
            },
          ]
        : []),
      {
        text: "Organismes",
        to: "/organismes/liste",
      },
      ...(roles.includes("DemandeSejour_Lecture") ||
      roles.includes("DemandeSejour_Ecriture")
        ? [
            {
              text: "Informations",
              to: "/informations",
            },
            {
              title: "Hébergements",
              links: [
                {
                  text: "simple",
                  to: "/hebergements/simple",
                },
                {
                  text: "Hébergements dans les sejours",
                  to: "/hebergements/pour-sejours",
                },
              ],
            },
          ]
        : []),
    ];
  });

  return menu;
};
