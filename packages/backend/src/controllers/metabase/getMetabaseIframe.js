const jwt = require("jsonwebtoken");
const { metabase } = require("../../config");

module.exports = async (req, res) => {
  const boardId = parseInt(req.params.boardId, 10);

  if (isNaN(boardId)) {
    return res.status(400).json({ error: "boardId invalide" });
  }

  const payload = {
    exp: Math.round(Date.now() / 1000) + 10 * 60,
    params: {},
    resource: { question: boardId },
  };
  const token = jwt.sign(payload, metabase.secretKey);

  const iframeUrl =
    metabase.siteUrl +
    "/embed/question/" +
    token +
    "#bordered=true&titled=true";

  return res.status(200).json({
    url: iframeUrl,
  });
};
