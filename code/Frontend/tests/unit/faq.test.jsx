import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FAQ from "../../src/pages/FAQ/FAQ.jsx";

describe("FAQ", () => {
  it("renders the FAQ sections and toggles accordion items", () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

    const questionText = screen.getByText("How long does delivery take across Sri Lanka?");
    const questionButton = questionText.closest("button");

    expect(questionButton).not.toBeNull();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(questionButton.closest(".faq-card-item")).not.toHaveClass("open");

    fireEvent.click(questionButton);

    expect(questionButton.closest(".faq-card-item")).toHaveClass("open");
    expect(screen.getByText(/Deliveries within the Western Province/)).toBeInTheDocument();

    fireEvent.click(questionButton);

    expect(questionButton.closest(".faq-card-item")).not.toHaveClass("open");
  });
});
