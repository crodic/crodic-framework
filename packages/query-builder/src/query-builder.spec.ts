import { describe, expect, it } from "vitest";
import { RestQueryBuilder } from "./rest-query-builder";

describe("REST Query Builder", () => {
  it("should format filters, sorts, and includes in REST style", () => {
    const qb = new RestQueryBuilder()
      .filter("status", "active")
      .filter("category", ["electronics", "books"])
      .sortBy("createdAt", "desc")
      .sortBy("title", "asc")
      .include("author", "comments")
      .fields("id", "title", "price")
      .page(1)
      .limit(20);

    const qs = qb.toQueryString();
    expect(qs).toContain("filter[status]=active");
    expect(qs).toContain("filter[category]=electronics,books");
    expect(qs).toContain("sort=-createdAt,title");
    expect(qs).toContain("include=author,comments");
    expect(qs).toContain("fields=id,title,price");
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=20");
  });

  it("should support scoped sparse fields", () => {
    const qb = new RestQueryBuilder()
      .fieldsFor("users", ["id", "name"])
      .fieldsFor("posts", ["id", "title"]);

    const qs = qb.toQueryString();
    expect(qs).toContain("fields[users]=id,name");
    expect(qs).toContain("fields[posts]=id,title");
  });

  it("should support bracket pagination if enabled", () => {
    const qb = new RestQueryBuilder(undefined, { bracketPagination: true })
      .page(3)
      .limit(50);

    const qs = qb.toQueryString();
    expect(qs).toContain("page[number]=3");
    expect(qs).toContain("page[size]=50");
  });

  it("should support bracket array filtering if enabled", () => {
    const qb = new RestQueryBuilder(undefined, {
      arrayFormat: "bracket",
    }).filter("status", ["active", "pending"]);

    const qs = qb.toQueryString();
    expect(qs).toContain("filter[status][]=active&filter[status][]=pending");
  });

  it("should support cursor pagination and clear page when cursor is set", () => {
    const qb = new RestQueryBuilder()
      .page(3)
      .cursorPaginate("eyJpZCI6IjEwMCJ9", 20)
      .filter("emailNotify", true);

    const built = qb.build();
    expect(built.page).toBeUndefined();
    expect(built.cursor).toBe("eyJpZCI6IjEwMCJ9");
    expect(built.limit).toBe(20);

    const qs = qb.toQueryString();
    expect(qs).not.toContain("page=");
    expect(qs).toContain("cursor=eyJpZCI6IjEwMCJ9");
    expect(qs).toContain("limit=20");
    expect(qs).toContain("filter[emailNotify]=true");

    // Round-trip initialization from params
    const restored = new RestQueryBuilder(built);
    expect(restored.build().cursor).toBe("eyJpZCI6IjEwMCJ9");
  });

  it("should support filterDynamic for single and range comparison operators", () => {
    const single = new RestQueryBuilder().filterDynamic("minAge", ">=", 18);
    expect(single.build().filter).toEqual({ minAge: ">=18" });

    const range = new RestQueryBuilder()
      .filterDynamic("price", ">=", 100)
      .filterDynamic("price", "<=", 500);
    expect(range.build().filter).toEqual({ price: [">=100", "<=500"] });
    expect(range.toQueryString()).toBe("filter[price]=%3E%3D100,%3C%3D500");
  });

  it("should clear cursor when page() is called and preserve falsy scalar values (false, 0)", () => {
    const qb = new RestQueryBuilder()
      .cursor("eyJpZCI6IjEwMCJ9")
      .page(2)
      .filter("active", false)
      .filter("count", 0)
      .filterDynamic("score", ">=", 0);

    const built = qb.build();
    expect(built.cursor).toBeUndefined();
    expect(built.page).toBe(2);
    expect(built.filter).toEqual({ active: false, count: 0, score: ">=0" });
    expect(qb.toQueryString()).toBe(
      "filter[active]=false&filter[count]=0&filter[score]=%3E%3D0&page=2",
    );
  });

  it("should sanitize filter array values and ignore prototype keys in constructor params", () => {
    const rawParams = JSON.parse(
      '{"filter":{"tags":["","  ",null,"cosplay"],"__proto__":{"polluted":true}}}',
    );
    const qb = new RestQueryBuilder(rawParams);

    expect(qb.build().filter).toEqual({ tags: ["cosplay"] });
    expect(qb.toQueryString()).toBe("filter[tags]=cosplay");
    expect(({} as any).polluted).toBeUndefined();

    const spacedFields = new RestQueryBuilder().fieldsFor("user", [
      " id ",
      " name ",
      "  ",
    ]);
    expect(spacedFields.build().fields).toEqual({ user: "id,name" });
  });
});
