import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OffRouteToggle } from "../components/OffRouteToggle";

describe("OffRouteToggle", () => {
  it("shows unchecked when off and reports a change when clicked", async () => {
    const onChange = vi.fn();
    render(<OffRouteToggle checked={false} onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: /off-route pickups and drops/i });
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it("mentions the 40 km limit", () => {
    render(<OffRouteToggle checked onChange={() => undefined} />);
    expect(screen.getAllByText(/40 km/).length).toBeGreaterThan(0);
  });
});
