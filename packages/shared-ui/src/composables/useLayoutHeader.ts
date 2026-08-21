import { computed } from "vue";
import { useLogout, useQuickLinks } from "../composables";

export function useLayoutHeader({
  logoutUrl,
  accountPath,
  userStore,
  additionalStoresToReset = [],
}: {
  logoutUrl: string;
  accountPath: string;
  userStore: any;
  additionalStoresToReset?: { $reset: () => void }[];
}) {
  const isConnected = computed<boolean>(() => userStore.isConnected);
  const user = computed(() => userStore.user);

  const { logout } = useLogout({
    apiUrl: logoutUrl,
    getUserId: (user: any) => user?.id,
    user,
    resetUserStore: () => {
      userStore.$reset();
      additionalStoresToReset.forEach((store) => store.$reset());
    },
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
