import { describe, expect, it } from "vitest";
import { runWithConcurrency } from "@/lib/async-pool";

describe("runWithConcurrency", () => {
  it("keeps results in input order", async () => {
    const results = await runWithConcurrency(
      [30, 10, 20],
      2,
      async (ms, index) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        return index;
      }
    );

    expect(results.map((result) => result.status)).toEqual([
      "fulfilled",
      "fulfilled",
      "fulfilled",
    ]);
    expect(
      results.map((result) =>
        result.status === "fulfilled" ? result.value : null
      )
    ).toEqual([0, 1, 2]);
  });

  it("captures worker failures without stopping the pool", async () => {
    const results = await runWithConcurrency([1, 2, 3], 2, async (n) => {
      if (n === 2) throw new Error("boom");
      return n * 10;
    });

    expect(results[0]).toEqual({ status: "fulfilled", value: 10 });
    expect(results[1]?.status).toBe("rejected");
    expect(results[2]).toEqual({ status: "fulfilled", value: 30 });
  });

  it("returns an empty list for no items", async () => {
    await expect(runWithConcurrency([], 3, async (n) => n)).resolves.toEqual(
      []
    );
  });
});
