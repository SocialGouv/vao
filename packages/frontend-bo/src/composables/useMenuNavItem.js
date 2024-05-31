import { useUserStore, computed } from "#imports";

export const useMenuNavItems = () => {
  const userStore = useUserStore();
  const menu = computed(() => {
    if (!userStore.isConnected) {
      return [];
    }
    const roles = userStore.user.roles ?? [];
    return [
      {
        text: "Accueil",
        to: "/",
      },
      ...(roles.includes("Compte")
        ? [
            {
              text: "Comptes",
              to: "/comptes/liste",
            },
          ]
        : []),
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
