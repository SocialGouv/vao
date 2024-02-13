const buildAccessToken = ({ id, email, personneId }) => ({
  id,
  email,
  personneId,
});

const buildRefreshToken = ({ id: userId }) => ({ userId });
const buildEmailToken = (email) => ({ email });

module.exports.buildAccessToken = buildAccessToken;
module.exports.buildEmailToken = buildEmailToken;
module.exports.buildRefreshToken = buildRefreshToken;
