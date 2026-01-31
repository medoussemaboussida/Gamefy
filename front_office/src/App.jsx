import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import VitrinePage from "./pages/vitrine/VitrinePage";
import './App.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<VitrinePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
