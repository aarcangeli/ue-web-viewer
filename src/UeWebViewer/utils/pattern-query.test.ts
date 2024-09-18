import { PatternQuery } from "./pattern-query";

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
