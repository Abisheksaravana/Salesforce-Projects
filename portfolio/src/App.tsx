import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Contact from './pages/Contact';
import AgentforceChat from './components/AgentforceChat';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col text-white">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/projects"    element={<Projects />} />
            <Route path="/skills"      element={<Skills />} />
            <Route path="/experience"  element={<Experience />} />
            <Route path="/contact"     element={<Contact />} />
          </Routes>
        </div>
        <Footer />
        <AgentforceChat />
      </div>
    </BrowserRouter>
  );
}
