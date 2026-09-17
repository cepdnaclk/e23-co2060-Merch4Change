import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../src/pages/LoginPage/LoginPage.jsx";

// LoginPage reads `login` from useAuth() (context/Context.tsx) to store the
// access token/user after a successful sign-in. Mocking it here lets these
// tests exercise the form itself without needing a real AuthProvider (which
// pulls in a live /api/v1/auth/refresh fetch on mount).
const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("../../src/context/Context.tsx", () => ({ useAuth }));

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn() });
  });

  it("renders the login form with email and password fields", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Wear your/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("shows error message when submitting empty form", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole("button", { name: /sign in|log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter both your email address and password/i)
      ).toBeInTheDocument();
    });
  });

  it("updates form data when user types", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("toggles remember me checkbox", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("has a link to the signup page", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up free/i })).toBeInTheDocument();
  });
});