import { describe, expect, it } from "vitest";
import { computeDiff } from "@/lib/diff";
import { GOVERNMENT_WARNING_TEXT } from "@/lib/constants";

describe("computeDiff", () => {
  it("returns a single equal segment when wording matches ignoring case", () => {
    const diff = computeDiff(
      GOVERNMENT_WARNING_TEXT,
      GOVERNMENT_WARNING_TEXT.toUpperCase()
    );
    expect(diff).toEqual([{ type: "equal", text: GOVERNMENT_WARNING_TEXT }]);
  });

  it("marks missing expected text as removed", () => {
    expect(computeDiff("GOVERNMENT WARNING:", "")).toEqual([
      { type: "removed", text: "GOVERNMENT WARNING:" },
    ]);
  });

  it("marks extra actual text as added", () => {
    expect(computeDiff("", "extra")).toEqual([{ type: "added", text: "extra" }]);
  });

  it("highlights a replaced word", () => {
    const diff = computeDiff(
      "women should not drink",
      "people should not drink"
    );
    expect(diff.some((segment) => segment.type === "removed")).toBe(true);
    expect(diff.some((segment) => segment.type === "added")).toBe(true);
    expect(diff.some((segment) => segment.type === "equal")).toBe(true);
  });
});
