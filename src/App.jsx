import React, { useState, useEffect } from 'react';
import Sidebar, { NAVIGATION_ITEMS } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import OverviewPage from './pages/OverviewPage';
import CommoditiesPage from './pages/CommoditiesPage';
import MarketRatesPage from './pages/MarketRatesPage';
import RateHistoryPage from './pages/RateHistoryPage';
import BuyerDemandsPage from './pages/BuyerDemandsPage';
import NotificationsPage from './pages/NotificationsPage';
import WhatsAppLogsPage from './pages/WhatsAppLogsPage';
import ChatbotPage from './pages/ChatbotPage';
import { API_BASE_URL } from './services/api';
import './styles/dashboard.css';

export default function App() {
  // Read initial active tab from URL hash, or default to 'ai-assistant'
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const valid = NAVIGATION_ITEMS.find((item) => item.id === hash);
    return valid ? valid.id : 'ai-assistant';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync hash changes with state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const valid = NAVIGATION_ITEMS.find((item) => item.id === hash);
      if (valid) {
        setActiveTab(valid.id);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const currentItem = NAVIGATION_ITEMS.find((item) => item.id === activeTab) || NAVIGATION_ITEMS[0];

  return (
    <div className="dashboard-app">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        <Header
          activeTabTitle={currentItem.label}
          onRefresh={activeTab !== 'ai-assistant' ? handleGlobalRefresh : null}
          isRefreshing={isRefreshing}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          apiBaseUrl={API_BASE_URL}
        />

        <main className="dashboard-content-container">
          {activeTab === 'overview' && (
            <OverviewPage
              key={refreshKey}
              onNavigate={handleSelectTab}
            />
          )}

          {activeTab === 'commodities' && (
            <CommoditiesPage key={refreshKey} />
          )}

          {activeTab === 'market-rates' && (
            <MarketRatesPage key={refreshKey} />
          )}

          {activeTab === 'rate-history' && (
            <RateHistoryPage key={refreshKey} />
          )}

          {activeTab === 'buyer-demands' && (
            <BuyerDemandsPage key={refreshKey} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsPage key={refreshKey} />
          )}

          {activeTab === 'whatsapp-logs' && (
            <WhatsAppLogsPage key={refreshKey} />
          )}

          {activeTab === 'ai-assistant' && (
            <ChatbotPage />
          )}
        </main>
      </div>
    </div>
  );
}
