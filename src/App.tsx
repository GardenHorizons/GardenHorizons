import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ContentPage from './pages/ContentPage';
import HallOfFame from './pages/HallOfFame';
import Support from './pages/Support';
import Codes from './pages/Codes';
import Updates from './pages/Updates';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mutations" element={<ContentPage type="mutations" />} />
            <Route path="/plants" element={<ContentPage type="plants" />} />
            <Route path="/codes" element={<Codes />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SettingsProvider>
  );
}
