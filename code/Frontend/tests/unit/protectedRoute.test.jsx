import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "../../src/components/ProtectedRoute/ProtectedRoute.jsx";

// ProtectedRoute reads its auth state from useAuth() (context/Context.tsx),
// which itself is populated asynchronously from an http-only refresh cookie —
// not from localStorage. Mocking the hook lets us test ProtectedRoute's own
// redirect/render logic deterministically, independent of that network call.
const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("../../src/context/Context.tsx", () => ({ useAuth }));

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuth.mockReset();
  });

  it("redirects unauthenticated users to the login page", () => {
    useAuth.mockReturnValue({ accessToken: null, loading: false });

    renderProtectedRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders protected content when a token exists in storage", () => {
    useAuth.mockReturnValue({ accessToken: "test-token", loading: false });

    renderProtectedRoute();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});
