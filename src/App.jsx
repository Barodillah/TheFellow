import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import PanelLayout from './components/layout/PanelLayout';
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
import Auth from './pages/Auth';
import Panel from './pages/Panel';
import MyProfile from './pages/MyProfile';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
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
          <Route path="/login" element={<Auth />} />
        </Route>

        {/* Panel (Dashboard) Routes */}
        <Route element={<PanelLayout />}>
          <Route path="/panel" element={<Panel />} />
          <Route path="/profile" element={<MyProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
