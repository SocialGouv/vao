/* eslint-disable no-nested-ternary */
module.exports.getBody = (titre, content, signature) => {
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

  function formatP({ p }) {
    return `
  <tr>
    <td align="justify" style="padding:0;Margin:0;padding-top:15px">
  ${p
    .map(
      (element) =>
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

  function formatLink({ link, text }) {
    return `
  <tr>
    <td align="center" style="width="25%";padding:0;Margin:0;padding-top:15px">
      <a href=${link} style="border: 0;
        text-decoration: none;
        line-height: 2.5;
        padding: 10px  20px;
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
  </tr>
    `;
  }

  function formatCode({ code }) {
    return `
  <tr>                                
    <td align="center" style="width="25%";padding:0;Margin:0;padding-top:15px">
      <p style="border: 0;line-height: 2.5;padding: 0 20px;font: 20px/22px sans-serif;text-align: center;color: #fff;background-color: #000091;">
        ${code}
      </p>
      <BR>
      <BR>
    </td>
  </tr>
  `;
  }

  function formatArray({ headers, lines }) {
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
        : type === "code"
          ? formatCode(others)
          : type === "array"
            ? formatArray(others)
            : "",
  ).join(`
  `)}
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
