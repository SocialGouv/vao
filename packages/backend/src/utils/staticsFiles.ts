import path from "path";

const root = path.resolve(__dirname, "../../assets");
const IMAGE_PATH = path.join(root, "images");
const FONT_PATH = path.join(root, "fonts");

export const fonts = {
  Marianne: {
    bold: path.join(FONT_PATH, "Marianne-Bold.woff"),
    italics: path.join(FONT_PATH, "Marianne-Light_Italic.woff"),
    normal: path.join(FONT_PATH, "Marianne-Regular.woff"),
  },
};

export const images = {
  cerfaDS2M: path.join(IMAGE_PATH, "cerfa-12672-04.png"),
  cerfaDS8J: path.join(IMAGE_PATH, "cerfa-12672-03.png"),
  logo: path.join(IMAGE_PATH, "logo.png"),
};
