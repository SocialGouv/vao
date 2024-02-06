// TODO: split france-connect utils from others (ie. regroup)

/**
 * Format the url use in the redirection call
 * to the France Connect Authorization and logout API endpoint.
 * @see @link{ https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service# }
 */

const config = require("../config");

module.exports = {
  // TODO hard code state et nonce because they normally generate from every request
  getAuthorizationUrl: () =>
    `${config.franceConnect.FC_URL}${config.franceConnect.AUTHORIZATION_FC_PATH}?` +
    `response_type=code&client_id=${config.franceConnect.CLIENT_ID}&redirect_uri=${config.franceConnect.FS_URL}` +
    `${config.franceConnect.CALLBACK_FS_PATH}&scope=${config.franceConnect.SCOPES}&acr_values=eidas1&state=customState11&nonce=customNonce11`,
  /**
   * Format the url 's that is used in a redirect call to France Connect logout API endpoint
   * @returns {string}
   */ getLogoutUrl: (req) =>
    `${config.franceConnect.FC_URL}${config.franceConnect.LOGOUT_FC_PATH}?id_token_hint=` +
    `${req.session.idToken}&state=customState11&post_logout_redirect_uri=${config.franceConnect.FS_URL}` +
    `${config.franceConnect.LOGOUT_FS_PATH}`,
  formatEmail: (mail) => mail && mail.trim().toLowerCase(),
  formatDate: () => {
    // Renvoi la date et heure actuelle formatée AAAAMMJJHHMM
    const now = new Date();
    const jour = now.getDate().toString().padStart(2, "0");
    const mois = now.getMonth().toString().padStart(2, "0");
    const annee = now.getFullYear();
    const heure = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const dateTimeFormate = annee + mois + jour + heure + minute;
    return dateTimeFormate;
  },
};
