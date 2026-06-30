import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';

// Pages
import Home from './pages/Home';
import Fellows from './pages/Fellows';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Articles from './pages/Articles';
import PDCA from './pages/PDCA';
import HOMEStandard from './pages/HOMEStandard';
import About from './pages/About';
import Quiz from './pages/Quiz';
import Prestasi from './pages/Prestasi';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-surface-warm text-slate-800 font-sans antialiased">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/fellows" element={<Fellows />} />
            <Route path="/fellows/:id" element={<Profile />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/pdca" element={<PDCA />} />
            <Route path="/home-standard" element={<HOMEStandard />} />
            <Route path="/about" element={<About />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/prestasi" element={<Prestasi />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
