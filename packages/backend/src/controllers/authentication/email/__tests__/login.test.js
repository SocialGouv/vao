const login = require("../login");
const User = require("../../../../services/User");
const Session = require("../../../../services/common/Session");
const CommonUser = require("../../../../services/common/Users");
const AppError = require("../../../../utils/error");
const { status } = require("../../../../helpers/users");
const jwt = require("jsonwebtoken");

jest.mock("../../../../services/User");
jest.mock("../../../../services/common/Users");
jest.mock("../../../../services/common/Session");
jest.mock("jsonwebtoken");
jest.mock("../../../../utils/logger", () => () => ({
  d: jest.fn(),
  i: jest.fn(),
  w: jest.fn(),
}));

describe("login controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
    };
    res = {
      cookie: jest.fn(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  it("should return 400 if email or password is missing", async () => {
    req.body = { email: "test@test.com" }; // Missing password

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it("should return 429 if too many login attempts", async () => {
    req.body = { email: "test@test.com", password: "1234" };
    CommonUser.verifyLoginAttempt.mockResolvedValue(true);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(429);
  });

  it("should return 404 if user is not found", async () => {
    req.body = { email: "test@test.com", password: "badpass" };
    CommonUser.verifyLoginAttempt.mockResolvedValue(false);
    User.login.mockResolvedValue(null);

    await login(req, res, next);

    expect(CommonUser.recordLoginAttempt).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it("should return 400 if account needs email or SIRET validation", async () => {
    req.body = { email: "test@test.com", password: "pass" };
    CommonUser.verifyLoginAttempt.mockResolvedValue(false);
    User.login.mockResolvedValue({ statusCode: status.NEED_EMAIL_VALIDATION });

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it("should return 400 if account is blocked", async () => {
    req.body = { email: "test@test.com", password: "pass" };
    CommonUser.verifyLoginAttempt.mockResolvedValue(false);
    User.login.mockResolvedValue({ statusCode: status.BLOCKED });

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].name).toBe("EmailUnauthorized");
  });

  it("should return 400 if account is temporarily blocked", async () => {
    req.body = { email: "test@test.com", password: "pass" };
    CommonUser.verifyLoginAttempt.mockResolvedValue(false);
    User.login.mockResolvedValue({ statusCode: status.TEMPORARY_BLOCKED });

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(next.mock.calls[0][0].message).toMatch(/temporairement bloqué/i);
    expect(next.mock.calls[0][0].name).toBe("UserTemporarilyBlocked");
  });

  it("should login successfully and set cookies", async () => {
    req.body = { email: "test@test.com", password: "goodpass" };
    const fakeUser = { id: "user1", statusCode: 200 };
    const fakeAccessToken = "access.token";
    const fakeRefreshToken = "refresh.token";

    CommonUser.verifyLoginAttempt.mockResolvedValue(false);
    User.login.mockResolvedValue(fakeUser);
    jwt.sign
      .mockReturnValueOnce(fakeAccessToken) // for access token
      .mockReturnValueOnce(fakeRefreshToken); // for refresh token

    await login(req, res, next);

    expect(Session.create).toHaveBeenCalledWith(
      fakeUser.id,
      fakeRefreshToken,
      expect.anything(),
    );
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.cookie).toHaveBeenCalledWith(
      "VAO_access_token",
      fakeAccessToken,
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "VAO_refresh_token",
      fakeRefreshToken,
      expect.any(Object),
    );
    expect(res.json).toHaveBeenCalledWith({ user: fakeUser });
  });

  it("should call next with error on unexpected exception", async () => {
    req.body = { email: "test@test.com", password: "pass" };
    CommonUser.verifyLoginAttempt.mockRejectedValue(new Error("Unexpected"));

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
