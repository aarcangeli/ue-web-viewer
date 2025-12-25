import { PatternQuery } from "./PatternQuery";
import { expect, test } from "vitest";

test("basic query", () => {
  const query = new PatternQuery("test");

  // true assertions
  expect(query.match("test")).toBe(true);
  expect(query.match("TEST")).toBe(true);
  expect(query.match("MyTest")).toBe(true);
  expect(query.match("myTest")).toBe(true);
  expect(query.match("MyComplexTestReally")).toBe(true);

  // false assertions
  expect(query.match("mytest")).toBe(false);
});

test("splitParts", () => {
  const query = new PatternQuery("test");

  // true assertions
  expect(query.splitParts("test").length).toBeGreaterThan(1);
  expect(query.splitParts("TEST").length).toBeGreaterThan(1);
  expect(query.splitParts("MyTest").length).toBeGreaterThan(1);
  expect(query.splitParts("myTest").length).toBeGreaterThan(1);
  expect(query.splitParts("MyComplexTestReally").length).toBeGreaterThan(1);

  // false assertions
  expect(query.splitParts("mytest").length).toBe(1);
});

test("PatternQuery with numbers", () => {
  const query = new PatternQuery("test1");

  // true assertions
  expect(query.match("test1")).toBe(true);
  expect(query.match("Test1")).toBe(true);
  expect(query.match("myTest13")).toBe(true);
  expect(query.match("MyComplexTest1Really")).toBe(true);

  // false assertions
  expect(query.match("test")).toBe(false);
  expect(query.match("mytest")).toBe(false);
});
