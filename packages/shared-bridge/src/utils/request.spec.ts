import {
  buildRequestPath,
  buildRequestQueryString,
  hashToFormData,
} from "./request";

describe("buildRequestQueryString", () => {
  it("should return an empty string with no query", () => {
    expect(buildRequestQueryString()).toEqual("");
  });

  it("should return an empty string with an empty query", () => {
    expect(buildRequestQueryString({})).toEqual("");
  });

  it("should return a query string with a single query param", () => {
    const query = { page: 1 };
    expect(buildRequestQueryString(query)).toEqual("?page=1");
  });

  it("should return a query string with an undefined query param", () => {
    const query = { limit: undefined, page: 1 };
    // @ts-expect-error undefined is not a valid query param
    expect(buildRequestQueryString(query)).toEqual("?page=1");
  });

  it("should return a query string with multiple query params", () => {
    const query = { limit: 10, page: 1 };
    expect(buildRequestQueryString(query)).toEqual("?limit=10&page=1");
  });

  it("should return a query string with an array query param", () => {
    const query = { page: ["1", "2", "3"] };
    expect(buildRequestQueryString(query)).toEqual(
      "?page=%5B%221%22%2C%222%22%2C%223%22%5D",
    );
  });
  it("should return a query string with an object query param", () => {
    const query = {
      deleted: ["false", "true"],
      limit: 10,
      nom: "John",
    };
    expect(buildRequestQueryString(query)).toEqual(
      "?deleted=%5B%22false%22%2C%22true%22%5D&limit=10&nom=John",
    );
  });
});

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

  it("should remove missing params when value is null", () => {
    const path = "/users/{userId?}";
    const params = { userId: null } as unknown as Record<string, string>;
    expect(buildRequestPath(path, params)).toEqual("/users/");
  });

  it("should remove missing params when value is undefined", () => {
    const path = "/users/{userId?}";
    const params = { userId: undefined } as unknown as Record<string, string>;
    expect(buildRequestPath(path, params)).toEqual("/users/");
  });

  it("should remove unfilled optional segments and replace multiple params", () => {
    const path = "/users/{userId}/posts/{postId?}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123/posts");
  });
});

describe("hashToFormData", () => {
  it("should append scalar values and ignore undefined", () => {
    const formData = hashToFormData({
      a: "hello",
      b: 42,
      c: false,
      d: undefined,
    });

    expect(Array.from(formData.entries())).toEqual([
      ["a", "hello"],
      ["b", "42"],
      ["c", "false"],
    ]);
  });

  it("should append dates as ISO strings", () => {
    const date = new Date("2020-01-02T03:04:05.000Z");
    const formData = hashToFormData({ createdAt: date });

    expect(Array.from(formData.entries())).toEqual([
      ["createdAt", "2020-01-02T03:04:05.000Z"],
    ]);
  });

  it("should append arrays using key[] and stringify objects", () => {
    const formData = hashToFormData({
      items: [{ id: 1 }, { id: 2 }],
      tags: ["a", "b"],
    });

    expect(Array.from(formData.entries())).toEqual([
      ["items[]", JSON.stringify({ id: 1 })],
      ["items[]", JSON.stringify({ id: 2 })],
      ["tags[]", "a"],
      ["tags[]", "b"],
    ]);
  });

  it("should append nested objects and nested arrays", () => {
    const formData = hashToFormData({
      user: { name: "Ada", roles: ["admin", { code: "editor" }] },
    });

    expect(Array.from(formData.entries())).toEqual([
      ["user[name]", "Ada"],
      ["user[roles][]", "admin"],
      ["user[roles][]", JSON.stringify({ code: "editor" })],
    ]);
  });

  it("should append blobs/files with a filename", async () => {
    const blob = new Blob(["content"], { type: "text/plain" });
    const formData = hashToFormData({ file: blob });

    const entries = Array.from(formData.entries());
    expect(entries).toHaveLength(1);
    expect(entries[0]?.[0]).toBe("file");
    expect(entries[0]?.[1]).toBeInstanceOf(Blob);
  });
});
