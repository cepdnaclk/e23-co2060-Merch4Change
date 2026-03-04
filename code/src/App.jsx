import { useState } from "react";
import LandingPage from "./pages/landing/LandingPage";
import SelectSignUp from "./pages/selectsignup/SelectSignUp";
import LoginPage from "./pages/login/LoginPage"; 
import OrgSignupPage from "./pages/signup/OrgSignupPage";
import UserSignupPage from "./pages/signup/UserSignupPage";

function App() {
  // Initialize current page from localStorage or default to 'landing'
  const [page, setPage] = useState(() => {
    try {
      return localStorage.getItem("page") || "landing";
    } catch (e) {
      return "landing";
    }
  });
  
  // Navigation function
  const navigate = (to) => {
    setPage(to);
    try {
      localStorage.setItem("page", to);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {page === "landing" && <LandingPage onNavigate={navigate} />}
      {page === "login" && <LoginPage onNavigate={navigate} />}
      {page === "selectsignup" && <SelectSignUp onNavigate={navigate} />}
      {page === "organizationsignup" && <OrgSignupPage onNavigate={navigate} />}
      {page === "usersignup" && <UserSignupPage onNavigate={navigate} />}
    </>
  );
}

export default App;