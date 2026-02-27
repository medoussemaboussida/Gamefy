import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import VitrinePage from "./pages/vitrine/VitrinePage";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PlayerDashboard from "./pages/player/PlayerDashboard";
import CoachDashboard from "./pages/coach/CoachDashboard";
import SignUpCoach from "./pages/auth/SignUpCoach";

import ProfilePage from "./pages/profile";
import EventsPage from "./pages/event";
import PlayerPacks from "./pages/player/Packs";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
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
        <Route path="/player/dashboard" element={<PlayerDashboard />} />
        <Route path="/player/packs" element={<PlayerPacks />} />
        <Route path="/coach/dashboard" element={<CoachDashboard />} />


        {/* Add more routes as needed */}
      </Routes>
    </div>
  )
}

export default App
