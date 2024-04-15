const path = require("path");

module.exports = function buildHeader() {
  return {
    columns: [
      {
        stack: [
          {
            alignment: "left",
            image: path.join(__dirname, "../../../../images/logo.png"),
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
              "../../../../images/cerfa-12672-03.png",
            ),
            width: 50,
          },
        ],
      },
    ],
    margin: [10, 10, 10, 10],
  };
};
