import { computed } from "vue";
import { useLogout, useQuickLinks } from "../composables";

export function useLayoutHeader({
  logoutUrl,
  accountPath,
  userStore,
}: {
  logoutUrl: string;
  accountPath: string;
  userStore: any;
}) {
  const isConnected = computed<boolean>(() => userStore.isConnected);
  const user = computed(() => userStore.user);

  const { logout } = useLogout({
    apiUrl: logoutUrl,
    getUserId: (user: any) => user?.id,
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
