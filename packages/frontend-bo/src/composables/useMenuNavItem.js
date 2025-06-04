import { computed, useUserStore, useEigStore } from "#imports";

export const useMenuNavItems = () => {
  const userStore = useUserStore();
  const eigStore = useEigStore();
  const menu = computed(() => {
    if (!userStore.isConnected) {
      return [];
    }

    const serviceCompetent = userStore.user?.serviceCompetent ?? [];
    const validationOva =
      serviceCompetent === "REG"
        ? [
            {
              text: "Validation des OVA",
              to: "/utilisateurs-ova/liste",
            },
          ]
        : [];
    const roles = userStore.user?.roles ?? [];
    eigStore.getTotalEigToRead();
    const comptes = roles.includes("Compte")
      ? [
          {
            title: "Comptes",
            links: [
              {
                text: "Agents de l’Etat",
                to: "/comptes/liste",
              },
              {
                text: "Organisateurs",
                to: "/comptes/liste-organisme",
              },
              ...validationOva,
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
              ...validationOva,
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
                {
                  text: "Messagerie",
                  to: "/messagerie",
                },
              ],
            },
          ]
        : []),
      {
        text: "Organismes",
        to: "/organismes/liste",
      },
      {
        text: "Territoires",
        to: "/territoires/liste",
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
                  text: "Tous les hébergements",
                  to: "/hebergements/tous",
                },
                {
                  text: "Hébergements liés à des séjours",
                  to: "/hebergements/lies-a-des-sejours",
                },
              ],
            },
          ]
        : []),
      ...(roles.includes("eig")
        ? [
            {
              text: `EIG (${eigStore.totalNonLus})`,
              to: "/eig",
            },
          ]
        : []),
    ];
  });

  return menu;
};
