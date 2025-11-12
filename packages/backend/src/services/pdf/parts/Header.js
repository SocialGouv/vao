const { images } = require("../../../utils/staticsFiles");

function Header(imageCerfa) {
  return {
    columns: [
      {
        stack: [
          {
            alignment: "left",
            image: images.logo,
            width: 80,
          },
        ],
      },
      {
        stack: [
          {
            alignment: "right",
            image: imageCerfa,
            width: 50,
          },
        ],
      },
    ],
    margin: [10, 10, 10, 10],
  };
}

module.exports = Header;
