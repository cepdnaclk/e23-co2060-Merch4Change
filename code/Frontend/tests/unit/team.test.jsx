import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Team from "../../src/pages/About/Team.jsx";

function renderTeam() {
  return render(
    <MemoryRouter>
      <Team />
    </MemoryRouter>,
  );
}

describe("Team", () => {
  it("introduces Team Antigravity and its university", () => {
    renderTeam();
    expect(
      screen.getByRole("heading", { name: "Team Antigravity" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The passionate individuals driving Merch4Change."),
    ).toBeInTheDocument();
    expect(screen.getByText("University of Peradeniya")).toBeInTheDocument();
  });

  it("shows the six documented members and roles", () => {
    renderTeam();
    const members = [
      ["S.D.M.P. Sandanayake", "Team Leader"],
      ["R.A.J.C. Adhikari", "Tech Lead"],
      ["M.N.A. Fikry", "Scrum Master"],
      ["S.B.N.S. Samarawickrama", "Backend Developer"],
      ["M.A.S. Dulshara", "Database Manager"],
      ["G.C. Damsiluni", "Frontend Developer"],
    ];
    members.forEach(([name, role]) => {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
      expect(screen.getByText(role)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Under Construction/)).not.toBeInTheDocument();
  });

  it("connects the team page to the About pages and contact form", () => {
    renderTeam();
    expect(screen.getByRole("link", { name: "Our team" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Our mission" })).toHaveAttribute(
      "href",
      "/about/mission",
    );
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/help/contact",
    );
    expect(
      screen.getByRole("link", { name: "Help & Support" }),
    ).toHaveAttribute("href", "/help");
    expect(
      screen.getByRole("link", { name: "Meet Team Antigravity" }),
    ).toHaveAttribute("href", "#meet-the-team");
  });
});
