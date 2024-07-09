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
                text: "back office",
                to: "/comptes/liste",
              },
              {
                text: "organismes",
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
                text: "organismes",
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
          ]
        : []),
    ];
  });

  return menu;
};
