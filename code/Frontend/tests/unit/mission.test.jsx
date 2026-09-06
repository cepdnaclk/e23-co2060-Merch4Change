import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Mission from "../../src/pages/About/Mission.jsx";

function renderMission() {
  return render(
    <MemoryRouter>
      <Mission />
    </MemoryRouter>,
  );
}

describe("Mission", () => {
  it("introduces the mission and retains its tagline", () => {
    renderMission();
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Make every choice a chance for change.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Driving impact-led commerce globally."),
    ).toBeInTheDocument();
  });

  it("preserves all three priorities and their descriptions", () => {
    renderMission();
    ["Global Impact", "Empowering Connections", "Sustainable Commerce"].forEach(
      (name) => {
        expect(screen.getByRole("heading", { name })).toBeInTheDocument();
      },
    );
    expect(
      screen.getByText(/Connecting local communities with global resources/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Fostering powerful partnerships between socially-conscious brands/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Promoting eco-friendly and ethically sourced merchandise/,
      ),
    ).toBeInTheDocument();
  });

  it("offers working destinations for shoppers, organisations, and support", () => {
    renderMission();
    expect(screen.getByRole("link", { name: "Our mission" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Explore what drives us" }),
    ).toHaveAttribute("href", "#our-priorities");
    expect(
      screen.getByRole("link", { name: "Explore the marketplace" }),
    ).toHaveAttribute("href", "/marketplace");
    expect(
      screen.getByRole("link", { name: "Get your organisation started" }),
    ).toHaveAttribute("href", "/signup?type=org");
    expect(
      screen.getByRole("link", { name: "Help & Support" }),
    ).toHaveAttribute("href", "/help");
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/help/contact",
    );
  });
});
