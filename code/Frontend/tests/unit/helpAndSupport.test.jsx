import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HelpAndSupport from "../../src/pages/HelpAndSupport/HelpAndSupport.jsx";

function renderHelpAndSupport() {
  return render(
    <MemoryRouter>
      <HelpAndSupport />
    </MemoryRouter>,
  );
}

describe("HelpAndSupport", () => {
  it("renders the help page heading", () => {
    renderHelpAndSupport();

    expect(screen.getByText("How can we help you today?")).toBeInTheDocument();
  });

  it("displays the search bar with placeholder text", () => {
    renderHelpAndSupport();

    const searchInput = screen.getByPlaceholderText(
      "Search all 32 guides, shipping questions, verification...",
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAccessibleName("Search help articles");
  });

  it("displays help category cards", () => {
    renderHelpAndSupport();

    expect(screen.getByRole("heading", { name: "Getting Started" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Orders & Shipping" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Causes & Impact" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Charity Verification" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Account & Security" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Direct Support" })).toBeInTheDocument();
  });

  it("displays help category descriptions", () => {
    renderHelpAndSupport();

    expect(
      screen.getByText(/Platform basics, creating your account/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Vetting standards, NGO legal requirements/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Get in touch with our dedicated support agents/),
    ).toBeInTheDocument();
  });

  it("displays the guide directory for the default category", () => {
    renderHelpAndSupport();

    expect(
      screen.getByRole("heading", { name: "Getting Started Guides (6)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Welcome to Merch4Change: Platform Overview",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "How to Create a Supporter Account with Email OTP",
      }),
    ).toBeInTheDocument();
  });

  it("switches the guide directory when a filter pill is clicked", () => {
    renderHelpAndSupport();

    fireEvent.click(screen.getByRole("button", { name: "Orders & Shipping (9)" }));

    expect(
      screen.getByRole("heading", { name: "Orders & Shipping Guides (9)" }),
    ).toBeInTheDocument();
  });

  it("search input can be typed into and filters the results heading", () => {
    renderHelpAndSupport();

    const searchInput = screen.getByPlaceholderText(
      "Search all 32 guides, shipping questions, verification...",
    );
    fireEvent.change(searchInput, { target: { value: "account" } });

    expect(searchInput.value).toBe("account");
    expect(
      screen.getByRole("heading", { name: /Results for "account"/ }),
    ).toBeInTheDocument();
  });

  it("renders the FAQ accordion and toggles an item", () => {
    renderHelpAndSupport();

    expect(screen.getByRole("heading", { name: "Frequently Asked Questions" })).toBeInTheDocument();

    const secondQuestion = screen.getByRole("button", {
      name: "How can I track where my donation goes?",
    });
    expect(secondQuestion).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(secondQuestion);

    expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/Your personal Profile and Donations tab record every rupee/),
    ).toBeInTheDocument();
  });
});
