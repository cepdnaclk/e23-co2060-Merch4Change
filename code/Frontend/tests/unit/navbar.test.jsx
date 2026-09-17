import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "../../src/i18n/I18nContext.jsx";
import Navbar from "../../src/components/Navbar/Navbar.jsx";

describe("Navbar", () => {
  it("renders the Merch4Change brand and navigation buttons", () => {
    render(
      <I18nProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByRole("button", { name: "Merch4Change" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
  });

  it("shows navigation links on the landing page", () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Navbar scrolled={false} />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("For Organisations")).toBeInTheDocument();
    expect(screen.getByText("Impact")).toBeInTheDocument();
  });

  it("toggles mobile menu when menu button is clicked", () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Navbar scrolled={false} />
        </MemoryRouter>
      </I18nProvider>,
    );

    const toggleButton = screen.getByRole("button", { name: "Toggle menu" });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    const allMarketplaceLinks = screen.getAllByText("Marketplace");
    const mobileLink = allMarketplaceLinks.find(el => el.classList.contains("lp-navbar-mobile-link"));
    expect(mobileLink).toBeInTheDocument();

    fireEvent.click(toggleButton);
  });

  it("applies scrolled styling when scrolled prop is true", () => {
    render(
      <I18nProvider>
        <MemoryRouter>
          <Navbar scrolled={true} />
        </MemoryRouter>
      </I18nProvider>,
    );

    const navbar = screen.getByRole("button", { name: "Merch4Change" }).closest(".lp-navbar");
    expect(navbar).toHaveClass("lp-navbar--scrolled");
  });

  it("does not render navigation links on non-landing pages", () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Navbar scrolled={false} />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.queryByText("Marketplace")).not.toBeInTheDocument();
  });
});
