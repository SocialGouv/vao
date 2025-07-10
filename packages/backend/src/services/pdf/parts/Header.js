const path = require("path");

const CERFA_TYPES = {
  CERFA_12672_03: "cerfa-12672-03.png",
  CERFA_12672_04: "cerfa-12672-04.png",
};

function Header(cerfaType) {
  return {
    columns: [
      {
        stack: [
          {
            alignment: "left",
            image: path.join(__dirname, "../../../images/logo.png"),
            width: 80,
          },
        ],
      },
      {
        stack: [
          {
            alignment: "right",
            image: path.join(
              __dirname,
              "../../../images/",
              CERFA_TYPES[cerfaType],
            ),
            width: 50,
          },
        ],
      },
    ],
    margin: [10, 10, 10, 10],
  };
}

// 👇 Attache l'objet CERFA_TYPES à la fonction
Header.CERFA_TYPES = CERFA_TYPES;

module.exports = Header;
