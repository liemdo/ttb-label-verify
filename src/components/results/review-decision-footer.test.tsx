import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewDecisionFooter } from "@/components/results/review-decision-footer";
import { makeField, makeResult } from "@/test/fixtures";

describe("ReviewDecisionFooter", () => {
  it("shows Approve when every checked field passes", async () => {
    const onDecide = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewDecisionFooter
        result={makeResult({
          fields: [makeField({ status: "pass" })],
        })}
        onDecide={onDecide}
        isDeciding={null}
      />
    );

    expect(
      screen.getByText("All checked fields pass. This application can be approved.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Reject$/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecide).toHaveBeenCalledWith("approved");
  });

  it("shows Reject when fields still need to be resolved", async () => {
    const onDecide = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewDecisionFooter
        result={makeResult({
          fields: [
            makeField({ status: "warning" }),
            makeField({
              fieldName: "classType",
              displayName: "Class/Type",
              status: "fail",
            }),
          ],
        })}
        onDecide={onDecide}
        isDeciding={null}
      />
    );

    expect(
      screen.getByText("2 fields need to be resolved to approve")
    ).toBeInTheDocument();
    expect(screen.getByText("Brand Name, Class/Type")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(onDecide).toHaveBeenCalledWith("rejected");
  });

  it("offers override options from the chevron menu", async () => {
    const onDecide = vi.fn();
    const user = userEvent.setup();

    render(
      <ReviewDecisionFooter
        result={makeResult({ fields: [makeField({ status: "pass" })] })}
        onDecide={onDecide}
        isDeciding={null}
      />
    );

    await user.click(screen.getByRole("button", { name: "Override status" }));
    expect(screen.getByRole("option", { name: "Reject" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Set to pending review" })
    ).toBeDisabled();

    await user.click(screen.getByRole("option", { name: "Reject" }));
    expect(onDecide).toHaveBeenCalledWith("rejected");
  });
});
