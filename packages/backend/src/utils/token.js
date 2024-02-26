const buildAccessToken = ({ id, email }) => ({
  email,
  id,
});

const buildRefreshToken = ({ id: userId }) => ({ userId });
const buildEmailToken = (email) => ({ email });

module.exports.buildAccessToken = buildAccessToken;
module.exports.buildEmailToken = buildEmailToken;
module.exports.buildRefreshToken = buildRefreshToken;
