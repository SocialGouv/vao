const buildAccessToken = ({ id, email, personneId }) => ({
  email,
  id,
  personneId,
});

const buildRefreshToken = ({ id: userId }) => ({ userId });
const buildEmailToken = (email) => ({ email });

module.exports.buildAccessToken = buildAccessToken;
module.exports.buildEmailToken = buildEmailToken;
module.exports.buildRefreshToken = buildRefreshToken;
