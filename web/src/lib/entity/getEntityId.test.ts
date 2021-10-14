import { describe, expect, test } from "@jest/globals";
import getEntityId from "./getEntityId";

type TestEntity<IdType extends string | number> = {
  id: IdType;
  attr?: string;
};

describe("getEntityId", () => {
  test("Handles strings", () => {
    expect(getEntityId<TestEntity<string>>("some-id")).toEqual("some-id");
  });

  test("Handles finite numbers", () => {
    expect(getEntityId(0)).toEqual(0);
    expect(getEntityId(1)).toEqual(1);
    expect(getEntityId(-1)).toEqual(-1);
    expect(getEntityId(42.5)).toEqual(42.5);
  });

  test("Rejects invalid ids", () => {
    expect(() => getEntityId(-Infinity)).toThrow();
    expect(() => getEntityId(Infinity)).toThrow();
    expect(() => getEntityId(NaN)).toThrow();
    expect(() => getEntityId({ id: -Infinity })).toThrow();
    expect(() => getEntityId({ id: Infinity })).toThrow();
    expect(() => getEntityId({ id: NaN })).toThrow();
  });

  test("Handles entities", () => {
    expect(getEntityId({ id: 42, foo: "other" })).toEqual(42);
    expect(getEntityId({ id: "some-id", foo: "other" })).toEqual("some-id");
  });
});
