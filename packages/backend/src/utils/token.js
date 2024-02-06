const buildAuthToken = ({ id, email, modedoublea }, login, otp) => ({
  user: {
    id,
    email,
    modedoublea,
  },
  login,
  otp,
});

const buildAccessToken = ({
  id,
  email,
  roles,
  territoires,
  sousdispositifs,
  dispositifs,
}) => ({
  id,
  email,
  roles,
  territoires,
  sousdispositifs,
  dispositifs,
});

const buildRefreshToken = ({ id: userId }) => ({ userId });
const buildValidationToken = (id) => ({
  id,
});
const buildEmailToken = (id, email) => ({ id, email });

module.exports.buildEmailToken = buildEmailToken;
module.exports.buildValidationToken = buildValidationToken;
module.exports.buildAuthToken = buildAuthToken;
module.exports.buildAccessToken = buildAccessToken;
module.exports.buildRefreshToken = buildRefreshToken;
