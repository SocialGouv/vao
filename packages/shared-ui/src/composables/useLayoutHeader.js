import { computed } from "vue";
import { useLogout } from "@vao/shared-ui";
import { useQuickLinks } from "@vao/shared-ui";

export function useLayoutHeader({ logoutUrl, accountPath, userStore }) {
  const isConnected = computed(() => userStore.isConnected);
  const user = computed(() => userStore.user);

  const { logout } = useLogout({
    apiUrl: logoutUrl,
    getUserId: (user) => user?.id,
    user,
    resetUserStore: () => userStore.$reset(),
  });

  const quickLinks = useQuickLinks({
    isConnected,
    logout,
    accountPath,
  });

  const homeTo = computed(() => (isConnected.value ? "/" : "/connexion/"));

  return {
    quickLinks,
    homeTo,
  };
}
