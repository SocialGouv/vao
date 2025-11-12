import { buildRequestPath } from "./request";

describe("buildRequestPath", () => {
  it("should return the path with no params", () => {
    const path = "/users";
    const params = {};
    expect(buildRequestPath(path, params)).toEqual(path);
  });

  it("should return the path with params", () => {
    const path = "/users/{userId}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123");
  });

  it("should return the path with optional params", () => {
    const path = "/users/{userId?}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123");
  });

  it("should return the path with missing optional params", () => {
    const path = "/users/{userId?}";
    const params = {};
    expect(buildRequestPath(path, params)).toEqual("/users");
  });

  it("should return the path with missing required params", () => {
    const path = "/users/{userId}";
    const params = {}; // not handle
    expect(buildRequestPath(path, params)).toEqual("/users/{userId}");
  });
});
