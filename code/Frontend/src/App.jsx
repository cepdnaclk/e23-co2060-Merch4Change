import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import MessagingPage from "./pages/Messaging/MessagingPage";
import Home from "./pages/Home/Home";
import UserProfile from "./pages/UserProfile/UserProfile";
import MarketplacePage from "./pages/Marketplace/Marketplace";
import ProductDetailPage from "./pages/ProductDetail/ProductDetailPage";
import AuctionDetailPage from "./pages/AuctionDetail/AuctionDetailPage";
import SignUpPage from "./pages/SignUp/SignUpPage";
import UserSignupPage from "./pages/SignUp/UserSignupPage";
import VerifyOtpPage from "./pages/VerifyOtp/VerifyOtpPage";
import Settings from "./pages/Settings/Settings";
import OrgCommunities from "./pages/OrgCommunities/OrgCommunities";
import OrgProjects from "./pages/OrgProjects/OrgProjects";
import PublicLayout from "./components/PublicLayout/PublicLayout";
import FAQ from "./pages/FAQ/FAQ";
import HelpAndSupport from "./pages/HelpAndSupport/HelpAndSupport";
import Contact from "./pages/HelpAndSupport/Contact";
import OurStory from "./pages/About/OurStory";
import Mission from "./pages/About/Mission";
import Team from "./pages/About/Team";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import DonationsPage from "./pages/Donations/DonationsPage";
import DonatePage from "./pages/Donate/DonatePage";
import UnderConstruction from "./components/UnderConstruction/UnderConstruction";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/Context";
import { ThemeProvider } from "./context/ThemeContext";
import VerificationForm from "./pages/Charity/VerificationForm";
import CharityQueue from "./pages/Admin/CharityVerification/CharityQueue";
import CharityReview from "./pages/Admin/CharityVerification/CharityReview";
import NotificationPage from "./pages/Notification/Notification";
import SearchPage from "./pages/Search/SearchPage";
import AllDonorsPage from "./pages/AllDonors/AllDonorsPage";
import LeaderboardPage from "./pages/Leaderboard/LeaderboardPage";
import OrderSuccessPage from "./pages/Order/OrderSuccessPage";
import OrderCancelPage from "./pages/Order/OrderCancelPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpAndSupport />} />
                <Route path="/help/contact" element={<Contact />} />
                <Route path="/contact" element={<Navigate to="/help/contact" replace />} />
                <Route path="/about/story" element={<OurStory />} />
                <Route path="/about/mission" element={<Mission />} />
                <Route path="/about/team" element={<Team />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/signup/orgsignup" element={<Navigate to="/signup?type=org" replace />} />
              <Route path="/signup/usersignup" element={<UserSignupPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />

              {/* Private/App Routes */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/messaging" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/profile/me" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/profile/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/product/:id" element={<ProductDetailPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/marketplace/auction/:id" element={<AuctionDetailPage />} />
              <Route path="/auctions/:id" element={<AuctionDetailPage />} />
              <Route path="/orders/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
              <Route path="/orders/cancel" element={<ProtectedRoute><OrderCancelPage /></ProtectedRoute>} />
              <Route path="/donations" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/donate" element={<ProtectedRoute><DonatePage /></ProtectedRoute>} />
              <Route path="/under-construction" element={<ProtectedRoute><UnderConstruction /></ProtectedRoute>} />
              <Route path="/notification" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/charity/verify" element={<ProtectedRoute><VerificationForm /></ProtectedRoute>} />
              <Route path="/admin/charities" element={<AdminRoute><CharityQueue /></AdminRoute>} />
              <Route path="/admin/charities/:id" element={<AdminRoute><CharityReview /></AdminRoute>} />

              {/* Organization & Donor Subroutes */}
              <Route
                path="/profile/:username/donors"
                element={<ProtectedRoute><AllDonorsPage /></ProtectedRoute>}
              />
              <Route
                path="/profile/:username/projects"
                element={<OrgProjects />}
              />
              <Route
                path="/profile/:username/communities"
                element={<OrgCommunities />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Analytics />
          </Router>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;