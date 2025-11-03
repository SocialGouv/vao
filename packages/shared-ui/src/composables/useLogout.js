import { logger, $fetchBackend, navigateTo } from "#imports";
import { unref } from "vue";

/**
 * @param {Object} options
 * @param {string} options.apiUrl - URL de déconnexion à utiliser
 * @param {(user: any) => string} options.getUserId - Fonction pour extraire l'id utilisateur
 * @param {any} options.user - L'objet utilisateur courant
 * @param {Function} options.resetUserStore - Fonction pour reset le store utilisateur
 */
export function useLogout({ apiUrl, getUserId, user, resetUserStore }) {
  const log = logger("logout");

  async function logout() {
    const userId = getUserId(unref(user));
    if (!userId)
      throw new Error("Impossible de déconnecter: aucun utilisateur trouvé.");
    log.i("logout - IN");
    try {
      await $fetchBackend(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sub: userId }),
      });
      await navigateTo("/connexion");
      resetUserStore();
      log.i("logout - Done");
    } catch (e) {
      log.w("logout - Error");
    }
  }

  return { logout };
}
