type P = {
  p: string[];
  type: "p";
};

type Link = {
  link: string;
  text: string;
  type: "link";
};

type Quote = {
  p: string[];
  type: "quote";
};

type Array = {
  headers: string[];
  lines: string[][];
  type: "array";
};

type Types = P | Link | Quote | Array;

const baliseParagraphe =
  '<p style="Margin:0;mso-line-height-rule:exactly;font: 12px/14px sans-serif;">';

const head = (titre: string) => `
<head>
  <meta charset="UTF-8">
  <title>${titre}</title>
</head>
`;

const titlePart = (titre: string) => `
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

const formatPElement = (element: string) => `
${baliseParagraphe}
  ${element}
</p>
<BR>
`;

const formatP = ({ p }: P) => `
<tr>
  <td align="justify" style="padding:0;Margin:0;padding-top:15px">
    ${p.map(formatPElement).join("")}
  </td>
</tr>
`;

const formatQuoteElement = (element: string) => `
<p>
  ${element}
</p>
<BR>
`;

const formatQuote = ({ p }: Quote) => `
<tr>
  <td style="mso-line-height-rule:exactly;font: 12px/14px sans-serif;font-style:italic;padding:30;Margin:0;padding-top:15px;">
    ${p.map(formatQuoteElement).join("")}
  </td>
</tr>
`;

const formatLink = ({ link, text }: Link) => `
<tr>
  <td style="border-radius:0;text-align:center" valign="top">
    <a href="${link}" target="_blank" style="margin-left: 20%; margin-right: 20%;padding: 14px 14px !important; font-size: 16px !important;background-color:#000091;border-radius:0;border:2px solid #000091;color:#ffffff;display:block;font-family:'Helvetica Neue', Helvetica, Arial, Verdana, sans-serif;font-size:16px;font-weight:normal;font-style:normal;text-decoration:none;min-width:30px;text-align:center;direction:ltr;letter-spacing:0px">
      ${text}
    </a>
  </td>
</tr>
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

const formatHeader = (element: string) => `
<th>
  ${element}
</th>
`;

const formatLine = (line: string[]) => `
<tr align="center">
  ${line.map((colonne) => `<td>${colonne}</td>`).join("")}
</tr>
`;

const formatArray = ({ headers, lines }: Array) => `
  <table style="table-layout:fixed;width: 80%;border: 1px solid;border-collapse: collapse;font: 12px/14px sans-serif;">
      <tr align="center" style="background-color:#000091;color:#FFFFFF">
        ${headers.map(formatHeader).join("")}
      </tr>
      ${lines.map(formatLine)}
  </table>
  <BR>
`;

const formatContent = (content: Types[]) => {
  return content
    .map((item) => {
      switch (item.type) {
        case "p":
          return formatP(item);
        case "link":
          return formatLink(item);
        case "quote":
          return formatQuote(item);
        case "array":
          return formatArray(item);
        default:
          return "";
      }
    })
    .join("\n");
};

const constructMail = (titre: string, content: Types[], signature: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  ${head(titre)}
  <body style="width:100%;height:100%;padding:0;Margin:0">
    <div class="es-wrapper-color" style="background-color:#CAC2C2">
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#CAC2C2">
        <tr>
          <td valign="top" style="padding:0;Margin:0">
            ${titlePart(titre)}
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
                              ${formatContent(content)}
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

export default (titre: string, content: Types[], signature: string) =>
  constructMail(titre, content, signature);
