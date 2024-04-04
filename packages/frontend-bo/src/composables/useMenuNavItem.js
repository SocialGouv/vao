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
      ...[
        roles.includes("Compte") && {
          text: "Comptes",
          to: "/comptes/liste",
        },
      ],
      ...[
        roles.includes("DemandeSejour") && {
          title: "Déclaration de séjour",
          links: [
            {
              text: "Mes déclarations",
              to: "/sejours",
            },
          ],
        },
      ],
    ];
  });

  return menu;
};