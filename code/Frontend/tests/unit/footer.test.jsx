import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "../../src/i18n/I18nContext.jsx";
import Footer from "../../src/components/Footer/Footer.jsx";

function renderFooter() {
  return render(
    <I18nProvider>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe("Footer", () => {
  it("renders the Merch4Change branding", () => {
    renderFooter();

    expect(screen.getByText("Merch4Change")).toBeInTheDocument();
    expect(screen.getByText(/Empowering communities through impact-led commerce/)).toBeInTheDocument();
  });

  it("displays footer navigation columns", () => {
    renderFooter();

    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  it("displays footer links for navigation", () => {
    renderFooter();

    expect(screen.getByText("Our Story")).toBeInTheDocument();
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(screen.getByText("Team Antigravity")).toBeInTheDocument();
    expect(screen.getByText("Help Center")).toBeInTheDocument();
    expect(screen.getByText("FAQs")).toBeInTheDocument();
  });

  it("displays copyright information with current year", () => {
    renderFooter();

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear} Merch4Change`))).toBeInTheDocument();
  });

  it("displays social media icons", () => {
    renderFooter();

    const socialIcons = screen.getAllByText(/IN|TW|FB|IG/);
    expect(socialIcons.length).toBeGreaterThan(0);
  });

  it("displays legal links section", () => {
    renderFooter();

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
  });
});
