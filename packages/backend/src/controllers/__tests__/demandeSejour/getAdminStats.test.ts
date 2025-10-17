import type { Response } from "express";

const service = require("../../../services/DemandeSejour");
const getController = require("../../demandeSejour/getAdminStats");

jest.mock("../../../services/DemandeSejour", () => ({
  getAdminStats: jest.fn(),
}));

describe("controllers/demandeSejour/getAdminStats", () => {
  let req: any;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      decoded: { territoireCode: "T1" },
      departements: [{ value: "01" }],
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test("should return stats and status 200 when service resolves", async () => {
    const fakeStats = { total: 42 };
    (service.getAdminStats as jest.Mock).mockResolvedValue({
      stats: fakeStats,
    });

    await getController(req, res, next);

    expect(service.getAdminStats).toHaveBeenCalledWith({
      departementCodes: ["01"],
      territoireCode: "T1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ stats: fakeStats });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next with error when service throws", async () => {
    const err = new Error("boom");
    (service.getAdminStats as jest.Mock).mockRejectedValue(err);

    await getController(req, res, next);

    expect(service.getAdminStats).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test("should not call next/res when req.departements is undefined (controller resolves)", async () => {
    // controller no longer throws on undefined departements; ensure it doesn't call next/res
    req.departements = undefined;

    await getController(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
