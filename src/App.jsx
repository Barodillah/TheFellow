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
import Publikasi from './pages/Publikasi';
import SmartLibrary from './pages/SmartLibrary';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Panel from './pages/Panel';
import MyProfile from './pages/MyProfile';
import Users from './pages/Users';
import PanelFellows from './pages/PanelFellows';
import PanelProfileView from './pages/PanelProfileView';
import PanelAchievements from './pages/PanelAchievements';

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
          <Route path="/publikasi" element={<Publikasi />} />
          <Route path="/smart-library" element={<SmartLibrary />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Panel (Dashboard) Routes */}
        <Route element={<PanelLayout />}>
          <Route path="/panel" element={<Panel />} />
          <Route path="/directory" element={<PanelFellows />} />
          <Route path="/directory/:id" element={<PanelProfileView />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/achievements" element={<PanelAchievements />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
