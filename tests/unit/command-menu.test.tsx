import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandMenu } from "@/components/accessibility/CommandMenu";
import { CommandMenuTrigger } from "@/components/accessibility/CommandMenuTrigger";
import { COMMAND_ROUTES } from "@/components/accessibility/command-menu.constants";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("CommandMenu refactoring: constants, logic, and UI", () => {
  it("verifies that data constants (COMMAND_ROUTES) have valid structures and search keywords", () => {
    expect(COMMAND_ROUTES.length).toBeGreaterThan(5);
    for (const route of COMMAND_ROUTES) {
      expect(route.label).toBeTruthy();
      expect(route.href.startsWith("/")).toBe(true);
      expect(route.icon).toBeTruthy();
      expect(route.keywords).toBeTruthy();
    }
  });

  it("renders wide bar search trigger with accessibility attributes", () => {
    const onOpen = vi.fn();
    render(<CommandMenuTrigger onOpen={onOpen} bar />);
    const button = screen.getByRole("button", { name: /Cari halaman/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("renders compact search trigger", () => {
    const onOpen = vi.fn();
    render(<CommandMenuTrigger onOpen={onOpen} compact />);
    const button = screen.getByRole("button", { name: /Cari halaman/i });
    expect(button).toBeInTheDocument();
  });

  it("triggers onOpen when clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CommandMenuTrigger onOpen={onOpen} bar />);
    const button = screen.getByRole("button", { name: /Cari halaman/i });
    await user.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders full CommandMenu without errors", () => {
    render(<CommandMenu bar />);
    expect(screen.getByRole("button", { name: /Cari halaman/i })).toBeInTheDocument();
  });
});
