import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import VitrinePage from "./pages/vitrine/VitrinePage";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TwoFaVerify from "./pages/auth/TwoFaVerify";
import PlayerDashboard from "./pages/player/PlayerDashboard";
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachRoom from "./pages/coach/CoachRoom";
import SignUpCoach from "./pages/auth/SignUpCoach";
import Rooms from "./pages/player/Rooms";
import ScrollToHash from "./components/common/ScrollToHash";

import ProfilePage from "./pages/profile";
import EventsPage from "./pages/event";
import PlayerPacks from "./pages/player/Packs";
import ReservationPage from "./pages/player/ReservationPage";
import CoachPacks from "./pages/coach/CoachPacks";
import NotificationBell from "./components/NotificationBell";
import ChatBot from "./components/ChatBot";

// Pages where the floating bell should NOT appear
const PUBLIC_ROUTES = ["/", "/signin", "/signup", "/become-coach", "/forgot-password", "/reset-password", "/verify-2fa"];

function App() {
  const location = useLocation();
  const showChatBot = !PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <ScrollToHash />
      <Routes>
        {/* Layout with Header/Footer for Vitrine and other public pages */}
        <Route path="/" element={
          <>
            <Header />
            <main className="flex-grow">
              <VitrinePage />
            </main>
            <Footer />
          </>
        } />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventsPage />} />

        {/* Auth pages usually don't have global Header/Footer */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/become-coach" element={<SignUpCoach />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-2fa" element={<TwoFaVerify />} />
        <Route path="/player/dashboard" element={<PlayerDashboard />} />
        <Route path="/player/rooms" element={<Rooms />} />
        <Route path="/player/packs" element={<PlayerPacks />} />
        <Route path="/player/reservation" element={<ReservationPage />} />
        <Route path="/coach/dashboard" element={<CoachDashboard />} />
        <Route path="/coach/coachRoom" element={<CoachRoom />} />
        <Route path="/coach/packs" element={<CoachPacks />} />


        {/* Add more routes as needed */}
      </Routes>

      {/* Floating AI Chatbot — visible on authenticated pages only */}
      {showChatBot && <ChatBot />}
    </div>
  )
}

export default App


