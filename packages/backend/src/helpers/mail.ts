export const getBody = (
  titre: string,
  content: any[],
  signature: string,
  options?: { includeSecurityNotice?: boolean },
) => {
  const baliseParagraphe = `<p style="Margin:0;mso-line-height-rule:exactly;font: 12px/14px sans-serif;">`;

  const head = `
    <head>
      <meta charset="UTF-8">
      <title>${titre}</title>
    </head>
    `;
  const titlePart = `
    <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr>
        <td align="center" style="padding:0;Margin:0">
          &nbsp;
          <table class="es-header-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000091;width:600px">
            <tr>
              <td align="left" style="padding:20px;Margin:0">
                <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                  <tr>
                    <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" style="padding:0;Margin:0;font-size:0;mso-line-height-rule:exactly;text-decoration:none;font: 12px/14px sans-serif;color:#FFFFFF"">
                            <b>${titre}</b>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `;

  function formatP({ p }: { p: string[] }) {
    return `
  <tr>
    <td align="justify" style="padding:0;Margin:0;padding-top:15px">
  ${p
    .map(
      (element: string) =>
        `
      ${baliseParagraphe}
        ${element}
      </p>
      <BR>
  `,
    )
    .join("")}
    </td>
  </tr>
    `;
  }

  function formatQuote({ p }: { p: string[] }) {
    return `
  <tr>
    <td style="mso-line-height-rule:exactly;font: 12px/14px sans-serif;font-style:italic;padding:30;Margin:0;padding-top:15px;">
  ${p
    .map(
      (element) =>
        `
      <p>
        ${element}
      </p>
      <BR>
  `,
    )
    .join("")}
    </td>
  </tr>
    `;
  }

  function formatLink({ link, text }: { link: string; text: string }) {
    return `
    <tr>
      <td style="border-radius:0;text-align:center" valign="top">
        <a href="${link}" target="_blank" style="margin-left: 20%; margin-right: 20%;padding: 14px 14px !important; font-size: 16px !important;background-color:#000091;border-radius:0;border:2px solid #000091;color:#ffffff;display:block;font-family:'Helvetica Neue', Helvetica, Arial, Verdana, sans-serif;font-size:16px;font-weight:normal;font-style:normal;text-decoration:none;min-width:30px;text-align:center;direction:ltr;letter-spacing:0px">
          ${text}
        </a>
    </td></tr>
  <!--<tr>
    <td align="center" style="width="25%";padding:0;Margin:0;padding-top:15px">
      <BR>
      <a href=${link} style="
        border: 0;
        text-decoration: none;
        line-height: 2.5;
        padding: 16px 28px;
        text-align: center;
        color: #fff;
        font: 14px/16px sans-serif;
        font-weight: bold;
        background-color: #000091;"
      >
        ${text}
      </a>
      <BR>
      <BR>
    </td>
  </tr>-->
    `;
  }

  // function formatCode({ code }) {
  //   return `
  // <tr>
  //   <td align="center" style="width="25%";padding:0;Margin:0;padding-top:15px">
  //     <p style="border: 0;line-height: 2.5;padding: 0 20px;font: 20px/22px sans-serif;text-align: center;color: #fff;background-color: #000091;">
  //       ${code}
  //     </p>
  //     <BR>
  //     <BR>
  //   </td>
  // </tr>
  // `;
  // }

  function formatArray({
    headers,
    lines,
  }: {
    headers: string[];
    lines: string[][];
  }) {
    return `
  <table style="table-layout:fixed;width: 80%;border: 1px solid;border-collapse: collapse;font: 12px/14px sans-serif;">
      <tr align="center" style="background-color:#000091;color:#FFFFFF">
        ${headers
          .map(
            (element) =>
              `
              <th>
              ${element}
            </th>
        `,
          )
          .join("")}
      </tr>
      ${lines
        .map(
          (ligne) =>
            `
            <tr align="center">
            ${ligne.map((colonne) => `<td>${colonne}</td>`).join("")}
            </tr>
      `,
        )
        .join("")}
  </table>
  <BR>
      `;
  }

  const securityNotice = options?.includeSecurityNotice
    ? `
      <tr>
        <td align="left" style="padding:0;Margin:0;padding-top:25px">
          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;border-top:1px solid #cccccc">
            <tr>
              <td style="padding-top:15px">
                ${baliseParagraphe}<strong>Attention à l'hameçonnage (phishing)</strong></p>
                ${baliseParagraphe}
                  L'hameçonnage (phishing) consiste à usurper une identité (mail, SMS, faux site) pour vous tromper
                  et vous amener à divulguer des informations sensibles (identifiants, mots de passe, etc.).
                </p>
                ${baliseParagraphe}Il vous est conseillé de :</p>
                <ul style="font: 12px/14px sans-serif;margin-top:5px">
                  <li>Vérifier l'expéditeur des messages reçus</li>
                  <li>N'ouvrir aucun lien ni pièce jointe suspecte</li>
                  <li>Ne pas communiquer vos identifiants ou mots de passe par message</li>
                </ul>
                ${baliseParagraphe}
                  La vigilance de chacun est essentielle pour protéger notre système d'information et vos données.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const corpsMail = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    ${head}
    <body style="width:100%;height:100%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#CAC2C2">
        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#CAC2C2">
          <tr>
            <td valign="top" style="padding:0;Margin:0">
              ${titlePart}
              <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
                <tr>
                  <td align="center" style="padding:0;Margin:0">
                    <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                      <tr>
                        <td align="left" style="Margin:0;padding-top:10px;padding-right:30px;padding-bottom:40px;padding-left:30px">
                          <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                            <tr>
                              <td valign="top" align="center" style="padding:0;Margin:0;width:540px">
                                <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                  ${content.map(({ type, ...others }) =>
                                    type === "p"
                                      ? formatP(others)
                                      : type === "link"
                                        ? formatLink(others)
                                        : type === "quote"
                                          ? formatQuote(others)
                                          : type === "array"
                                            ? formatArray(others)
                                            : "",
                                  ).join(`
                                  `)}
                                  ${securityNotice}
                                  <tr>
                                    <td align="left" style="padding:0;Margin:0;padding-top:25px">
                                      ${baliseParagraphe}
                                        Cordialement.<BR><i>${signature}</i>
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              &nbsp;
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>
  `;
  return corpsMail;
};
