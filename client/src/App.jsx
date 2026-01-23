import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./auth/Register";
import Login from "./auth/Login";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Goals from "./pages/Goals";
import Report from "./pages/Report";
import Navbar from "./components/Navbar";
import ChatAssistant from "./components/ChatAssistant";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      {/* 2. Taruh Navbar DI SINI (Di dalam Router, tapi di luar Routes) */}
      <Navbar />
      <ChatAssistant />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/report" element={<Report />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
