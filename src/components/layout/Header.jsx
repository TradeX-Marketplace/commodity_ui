import React from 'react';
import { MenuIcon, RefreshIcon, ServerIcon } from '../common/Icons';

export default function Header({
  activeTabTitle = "Dashboard Overview",
  onRefresh,
  isRefreshing = false,
  onToggleMobileSidebar,
  apiBaseUrl = "http://localhost:9090",
}) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon size={22} />
        </button>

        <div className="header-title-wrapper">
          <h1 className="header-page-title">{activeTabTitle}</h1>
          <span className="header-breadcrumb">
            Commodity Admin AI &bull; B2B Marketplace Management
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Backend server badge */}
        <div className="header-backend-chip" title={`Spring Boot Backend URL: ${apiBaseUrl}`}>
          <ServerIcon size={14} />
          <span className="chip-text">Backend: 9090</span>
          <span className="status-indicator-dot online" />
        </div>

        {/* Global refresh action */}
        {onRefresh && (
          <button
            type="button"
            className={`btn btn-outline btn-sm header-refresh-btn ${isRefreshing ? 'is-loading' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh current section"
            title="Refresh current data"
          >
            <RefreshIcon size={15} className={isRefreshing ? 'spin-animation' : ''} />
            <span className="refresh-btn-text">Refresh</span>
          </button>
        )}

        {/* Admin Profile Placeholder */}
        <div className="admin-profile-badge">
          <div className="admin-avatar">
            <span>AD</span>
          </div>
          <div className="admin-info">
            <span className="admin-name">Admin User</span>
            <span className="admin-role">System Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
