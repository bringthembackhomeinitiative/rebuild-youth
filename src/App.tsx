import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import VisionMission from './components/VisionMission';
import WhyBeyond from './components/WhyBeyond';
import Impact from './components/Impact';
import BookSection from './components/BookSection';
import Hosts from './components/Hosts';
import EventDetails from './components/EventDetails';
import RegistrationForm from './components/RegistrationForm';
import Footer from './components/Footer';
import TicketPage from './pages/TicketPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Readbook from './pages/Readbook';
import type { AttendanceMode, TicketData } from './types';

// ── Landing page ─────────────────────────────────────────────────────────────
// The registration form and ticket are now on separate routes so the browser
// Back button works correctly: /ticket → Back → / (form visible again).
function Landing() {
  const [selectedMode, setSelectedMode] = useState<AttendanceMode | null>(null);
  const navigate = useNavigate();

  const handleSelectMode = (mode: AttendanceMode) => {
    setSelectedMode(mode);
    setTimeout(() => {
      document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Navigate to /ticket and pass the ticket data via router state.
  // This creates a real browser history entry, so Back returns here.
  const handleTicketGenerated = (ticket: TicketData) => {
    navigate('/ticket', { state: { ticket } });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <VisionMission />
      <WhyBeyond />
      <Impact />
      <BookSection />
      <Hosts />
      <EventDetails onSelectMode={handleSelectMode} />
      <RegistrationForm
        initialMode={selectedMode}
        onTicketGenerated={handleTicketGenerated}
      />
      <Footer />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Landing />}       />
        <Route path="/ticket"       element={<TicketPage />}    />
        <Route path="/admin/login"  element={<AdminLogin />}    />
        <Route path="/admin"        element={<AdminDashboard />} />
        <Route path="/read-book"    element={<Readbook />}      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
