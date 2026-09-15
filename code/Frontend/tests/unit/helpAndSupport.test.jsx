import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HelpAndSupport from "../../src/pages/HelpAndSupport/HelpAndSupport.jsx";

describe("HelpAndSupport", () => {
  it("renders the help page heading", () => {
    render(
      <MemoryRouter>
        <HelpAndSupport />
      </MemoryRouter>,
    );

    expect(screen.getByText("How can we help you today?")).toBeInTheDocument();
  });

  it("displays knowledge base topics", () => {
    render(
      <MemoryRouter>
        <HelpAndSupport />
      </MemoryRouter>,
    );

    expect(screen.getByText("Knowledge Base Topics")).toBeInTheDocument();
    expect(screen.getAllByText("Getting Started")[0]).toBeInTheDocument();
    expect(screen.getByText("Orders & Shipping")).toBeInTheDocument();
  });

  it("displays search bar input", () => {
    render(
      <MemoryRouter>
        <HelpAndSupport />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText("Search all 32 guides, shipping questions, verification...");
    expect(searchInput).toBeInTheDocument();
  });

  it("search input can be typed into", () => {
    render(
      <MemoryRouter>
        <HelpAndSupport />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText("Search all 32 guides, shipping questions, verification...");
    fireEvent.change(searchInput, { target: { value: "account" } });

    expect(searchInput.value).toBe("account");
  });
});
