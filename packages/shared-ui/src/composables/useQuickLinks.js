import { computed, unref } from "vue";

/**
 * @param {Object} options
 * @param {import('vue').Ref<boolean>|boolean} options.isConnected
 * @param {Function} options.logout
 * @param {string} options.accountPath - chemin vers la page mon compte
 * @returns {import('vue').ComputedRef<Array>}
 */
export function useQuickLinks({
  isConnected,
  logout,
  accountPath = "/mon-compte",
}) {
  return computed(() => [
    {
      label: "Aide",
      href: "https://vao-assistance.atlassian.net/servicedesk/customer/portals",
      icon: "ri:question-line",
      iconRight: false,
      target: "_blank",
      rel: "noopener noreferrer",
    },
    ...(unref(isConnected)
      ? [
          {
            label: "Mon compte",
            to: accountPath,
            icon: "ri:account-circle-line",
            iconRight: false,
          },
        ]
      : []),
    ...(unref(isConnected)
      ? [
          {
            label: "Se déconnecter",
            onclick: logout,
            icon: "ri:logout-box-line",
            iconRight: false,
            button: true,
          },
        ]
      : []),
  ]);
}
