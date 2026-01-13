module.exports = jest.fn(() => {
  return (req, res, next) => {
    req.decoded = { id: 1, role: "admin" };
    next();
  };
});
