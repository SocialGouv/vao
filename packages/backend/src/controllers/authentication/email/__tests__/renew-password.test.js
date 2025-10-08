const renewPassword = require("../renew-password");
const User = require("../../../../services/User");
const AppError = require("../../../../utils/error");
const jwt = require("jsonwebtoken");

jest.mock("../../../../services/User");
jest.mock("jsonwebtoken");
jest.mock("../../../../utils/logger", () => () => ({
  d: jest.fn(),
  i: jest.fn(),
  w: jest.fn(),
}));
jest.mock("../../../../schemas/parts/password", () => () => ({
  validate: jest.fn().mockResolvedValue(true),
}));

describe("renew-password controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { password: "newPassword123" },
      query: { token: "fake-token" },
    };
    res = { json: jest.fn(), status: jest.fn(() => res) };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should reactivate a TEMPORARY_BLOCKED user and reset inactivity fields", async () => {
    // Mock JWT
    jwt.verify.mockReturnValue({ email: "test@test.com" });

    // Mock ova avant password change
    const userBefore = {
      email: "test@test.com",
      id: 1,
      last_mail_inactivity_2m_at: "2025-08-01T00:00:00.000Z",
      last_mail_inactivity_5m_at: "2025-07-01T00:00:00.000Z",
      last_mail_inactivity_5m_reminder_at: "2025-09-24T00:00:00.000Z",
      planned_deletion_at: "2025-10-01T00:00:00.000Z",
      statusCode: "TEMPORARY_BLOCKED",
      temporary_blocked_at: "2025-09-01T00:00:00.000Z",
    };
    // Mock ova après password change et réactivation
    const userAfter = {
      ...userBefore,
      last_mail_inactivity_2m_at: null,
      last_mail_inactivity_5m_at: null,
      last_mail_inactivity_5m_reminder_at: null,
      planned_deletion_at: null,
      statusCode: "VALIDATED",
      temporary_blocked_at: null,
    };

    User.editPassword.mockResolvedValue(userBefore);
    User.activate.mockResolvedValue(userAfter);

    await renewPassword(req, res, next);

    expect(User.editPassword).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "newPassword123",
    });
    expect(User.activate).toHaveBeenCalledWith("test@test.com");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: userAfter });
  });

  it("should return error if token is missing", async () => {
    req.query.token = undefined;
    await renewPassword(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});
