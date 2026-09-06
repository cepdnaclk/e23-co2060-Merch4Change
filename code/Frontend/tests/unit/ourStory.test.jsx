import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OurStory from "../../src/pages/About/OurStory.jsx";

describe("OurStory", () => {
  it("renders the Our Story heading", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );

    expect(screen.getByText("Our Story")).toBeInTheDocument();
  });

  it("displays the story tagline", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("How a simple idea grew into a movement for change."),
    ).toBeInTheDocument();
  });

  it("displays the three content sections", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );

    expect(screen.getByText("The Beginning")).toBeInTheDocument();
    expect(screen.getByText("Our Vision")).toBeInTheDocument();
    expect(screen.getByText("The Journey Ahead")).toBeInTheDocument();
  });

  it("displays the beginning section content", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        /Merch4Change was born out of a desire to bridge the gap/,
      ),
    ).toBeInTheDocument();
  });

  it("displays the vision section content", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Our goal is to create a seamless platform/),
    ).toBeInTheDocument();
  });

  it("displays the journey section content", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        /We are constantly expanding our network of charities and brands/,
      ),
    ).toBeInTheDocument();
  });

  it("links readers to the mission, team, and current organisation signup flow", () => {
    render(
      <MemoryRouter>
        <OurStory />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Our team" })).toHaveAttribute(
      "href",
      "/about/team",
    );
    expect(
      screen.getAllByRole("link", { name: "Our mission" })[0],
    ).toHaveAttribute("href", "/about/mission");
    expect(
      screen.getByRole("link", { name: /Bring your organisation/ }),
    ).toHaveAttribute("href", "/signup?type=org");
    expect(
      screen.getByRole("link", { name: "Help & Support" }),
    ).toHaveAttribute("href", "/help");
  });
});
