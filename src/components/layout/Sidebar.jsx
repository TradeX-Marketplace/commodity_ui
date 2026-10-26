import React from 'react';
import {
  DashboardIcon,
  CommodityIcon,
  RateIcon,
  HistoryIcon,
  DemandIcon,
  NotificationIcon,
  WhatsAppIcon,
  BotIcon,
  SparklesIcon,
  CloseIcon,
} from '../common/Icons';

export const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Dashboard Overview', icon: DashboardIcon, hidden: true },
  { id: 'commodities', label: 'Commodities', icon: CommodityIcon, hidden: true },
  { id: 'market-rates', label: 'Market Rates', icon: RateIcon, hidden: true },
  { id: 'rate-history', label: 'Rate History', icon: HistoryIcon, hidden: true },
  { id: 'buyer-demands', label: 'Buyer Demands', icon: DemandIcon, hidden: true },
  { id: 'notifications', label: 'Notifications', icon: NotificationIcon, hidden: true },
  { id: 'whatsapp-logs', label: 'WhatsApp Logs', icon: WhatsAppIcon, hidden: true },
  { id: 'ai-assistant', label: 'AI Admin Assistant', icon: BotIcon, isAi: true },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <SparklesIcon size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Commodity Admin</span>
            <span className="brand-tag">AI DASHBOARD</span>
          </div>
          <button
            type="button"
            className="sidebar-close-mobile-btn"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav" aria-label="Main Administration Navigation">
          <div className="nav-section-label">MAIN MENU</div>
          <ul className="nav-list">
            {NAVIGATION_ITEMS.filter((item) => !item.hidden).map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`nav-link ${isSelected ? 'active' : ''} ${item.isAi ? 'ai-highlight' : ''}`}
                    aria-current={isSelected ? 'page' : undefined}
                  >
                    <span className="nav-icon-wrapper">
                      <Icon size={18} />
                    </span>
                    <span className="nav-label">{item.label}</span>
                    {item.isAi && (
                      <span className="nav-badge-ai">AI</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer Architecture Note */}
        <div className="sidebar-footer">
          <div className="backend-info-box">
            <div className="info-title">System Architecture</div>
            <div className="info-details">
              <span>Admin AI: <strong>Port 9090</strong></span>
              <span>Marketplace: <strong>Port 7070</strong></span>
            </div>
            <div className="info-version">Phase 1 &bull; Read-Only AI</div>
          </div>
        </div>
      </aside>
    </>
  );
}
