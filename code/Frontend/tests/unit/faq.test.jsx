import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FAQ from "../../src/pages/FAQ/FAQ.jsx";

describe("FAQ", () => {
  it("renders the FAQ list and toggles an accordion item", () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeInTheDocument();

    const questionButton = screen.getByRole("button", {
      name: /How long does delivery take across Sri Lanka\?/,
    });

    expect(questionButton).toHaveAttribute("aria-expanded", "false");
    expect(questionButton.closest(".faq-card-item")).not.toHaveClass("open");

    fireEvent.click(questionButton);

    expect(questionButton).toHaveAttribute("aria-expanded", "true");
    expect(questionButton.closest(".faq-card-item")).toHaveClass("open");
    expect(
      screen.getByText(/Deliveries within the Western Province/),
    ).toBeInTheDocument();

    fireEvent.click(questionButton);

    expect(questionButton).toHaveAttribute("aria-expanded", "false");
    expect(questionButton.closest(".faq-card-item")).not.toHaveClass("open");
  });
});
