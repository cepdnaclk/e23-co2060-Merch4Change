import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "../../src/context/ThemeContext.jsx";
import { I18nProvider } from "../../src/i18n/I18nContext.jsx";
import PublicLayout from "../../src/components/PublicLayout/PublicLayout.jsx";

function renderPublicLayout(initialEntry, path, content) {
  return render(
    <I18nProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path={path} element={<div>{content}</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </I18nProvider>,
  );
}

describe("PublicLayout", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the navbar on public pages and scrolls to the top on the landing page", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    renderPublicLayout("/", "/", "Landing content");

    expect(screen.getByRole("button", { name: "Merch4Change" })).toBeInTheDocument();
    expect(screen.getByText("Landing content")).toBeInTheDocument();
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("hides the navbar on the login page", () => {
    renderPublicLayout("/login", "/login", "Login content");

    expect(screen.queryByRole("button", { name: "Merch4Change" })).not.toBeInTheDocument();
    expect(screen.getByText("Login content")).toBeInTheDocument();
  });
});
