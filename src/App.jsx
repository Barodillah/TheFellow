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
import ThreadDetail from './pages/ThreadDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import PDCA from './pages/PDCA';
import HOMEStandard from './pages/HOMEStandard';
import About from './pages/About';
import Quiz from './pages/Quiz';
import KanalQuiz from './pages/KanalQuiz';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Prestasi from './pages/Prestasi';
import Publikasi from './pages/Publikasi';
import SmartLibrary from './pages/SmartLibrary';
import WaBlast from './pages/WaBlast';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Panel from './pages/Panel';
import MyProfile from './pages/MyProfile';
import Users from './pages/Users';
import PanelFellows from './pages/PanelFellows';
import PanelProfileView from './pages/PanelProfileView';
import PanelAchievements from './pages/PanelAchievements';
import PanelPublikasi from './pages/PanelPublikasi';
import CalculatorTarget from './pages/CalculatorTarget';
import PDCAGenerator from './pages/PDCAGenerator';
import ManageEvents from './pages/ManageEvents';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import PDCAMetodologi from './pages/PDCAMetodologi';
import Ekosistem from './pages/Ekosistem';
import MyArticles from './pages/MyArticles';
import ArticleForm from './pages/ArticleForm';

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
          <Route path="/forum/:id" element={<ThreadDetail />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/home-standard" element={<HOMEStandard />} />
          <Route path="/about" element={<About />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/prestasi" element={<Prestasi />} />
          <Route path="/publikasi" element={<Publikasi />} />
          <Route path="/smart-library" element={<SmartLibrary />} />
          <Route path="/whatsapp-blast" element={<WaBlast />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/kebijakan-privasi" element={<PrivacyPolicy />} />
          <Route path="/syarat-ketentuan" element={<TermsConditions />} />
          <Route path="/pdca-metodologi" element={<PDCAMetodologi />} />
          <Route path="/ekosistem" element={<Ekosistem />} />
        </Route>

        {/* Panel (Dashboard) Routes */}
        <Route element={<PanelLayout />}>
          <Route path="/panel" element={<Panel />} />
          <Route path="/kanal-quiz" element={<KanalQuiz />} />
          <Route path="/kanal-quiz/create" element={<CreateQuiz />} />
          <Route path="/kanal-quiz/take/:id" element={<TakeQuiz />} />
          <Route path="/directory" element={<PanelFellows />} />
          <Route path="/directory/:id" element={<PanelProfileView />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/achievements" element={<PanelAchievements />} />
          <Route path="/manage-publikasi" element={<PanelPublikasi />} />
          <Route path="/users" element={<Users />} />
          <Route path="/calculator-target" element={<CalculatorTarget />} />
          <Route path="/pdca-generator" element={<PDCAGenerator />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/pdca-tracker" element={<PDCA />} />
          <Route path="/my-articles" element={<MyArticles />} />
          <Route path="/articles/create" element={<ArticleForm />} />
          <Route path="/articles/edit/:id" element={<ArticleForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
