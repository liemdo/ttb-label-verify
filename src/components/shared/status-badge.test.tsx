import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ApplicationStatusBadge,
  ApprovedByLine,
  StatusBadge,
} from "@/components/shared/status-badge";
import { makeResult } from "@/test/fixtures";

describe("StatusBadge", () => {
  it("labels field statuses", () => {
    const { rerender } = render(<StatusBadge status="pass" />);
    expect(screen.getByText("Pass")).toBeInTheDocument();

    rerender(<StatusBadge status="fail" />);
    expect(screen.getByText("Fail")).toBeInTheDocument();
  });

  it("marks an overridden field", () => {
    render(<StatusBadge status="pass" overridden />);
    expect(screen.getByText("(overridden)")).toBeInTheDocument();
  });
});

describe("ApplicationStatusBadge", () => {
  it("shows pending while awaiting review", () => {
    render(
      <ApplicationStatusBadge
        result={makeResult({
          overallVerdict: "approved",
          reviewStatus: "awaiting_review",
        })}
      />
    );
    expect(screen.getByText("Pending review")).toBeInTheDocument();
  });

  it("shows approved after a specialist decision", () => {
    render(
      <ApplicationStatusBadge
        result={makeResult({
          overallVerdict: "approved",
          reviewStatus: "reviewed",
        })}
      />
    );
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });
});

describe("ApprovedByLine", () => {
  it("names the specialist who approved or rejected", () => {
    const { rerender } = render(
      <ApprovedByLine
        result={makeResult({
          overallVerdict: "approved",
          reviewStatus: "reviewed",
          agentName: "Sarah Chen",
        })}
      />
    );
    expect(screen.getByText(/Approved by/)).toBeInTheDocument();
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();

    rerender(
      <ApprovedByLine
        result={makeResult({
          overallVerdict: "rejected",
          reviewStatus: "reviewed",
          agentName: "Sarah Chen",
        })}
      />
    );
    expect(screen.getByText(/Rejected by/)).toBeInTheDocument();
  });

  it("renders nothing while unassigned", () => {
    const { container } = render(
      <ApprovedByLine
        result={makeResult({
          overallVerdict: "pending",
          reviewStatus: "awaiting_review",
          agentName: "Unassigned",
        })}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
