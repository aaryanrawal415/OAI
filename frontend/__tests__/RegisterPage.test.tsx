import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterPage } from "../pages/RegisterPage";

const mocks = vi.hoisted(() => ({ register: vi.fn() }));

vi.mock("../auth/AuthProvider", () => ({
  useAuth: () => ({ user: null, register: mocks.register }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    mocks.register.mockReset().mockResolvedValue(undefined);
  });

  it("registers an organization owner as a distinct account type", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Fleet Owner" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "owner@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "organization_owner" } });
    fireEvent.change(screen.getByLabelText("Organization name"), { target: { value: "OptiFreight" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mocks.register).toHaveBeenCalledWith("Fleet Owner", "owner@example.com", "password123", "organization_owner", "OptiFreight");
    });
  });
});
