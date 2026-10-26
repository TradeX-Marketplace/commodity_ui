import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/common/StatCard';
import TrendChart from '../components/common/TrendChart';
import { StatCardSkeleton } from '../components/common/LoadingSkeleton';
import Badge from '../components/common/Badge';
import {
  CommodityIcon,
  RateIcon,
  DemandIcon,
  NotificationIcon,
  WhatsAppIcon,
  BotIcon,
  ServerIcon,
  RefreshIcon,
  SparklesIcon,
} from '../components/common/Icons';
import {
  fetchCommodities,
  fetchMarketRates,
  fetchRateHistory,
  fetchBuyerDemands,
  fetchNotifications,
  fetchWhatsAppLogs,
  API_BASE_URL,
  MARKETPLACE_BASE_URL,
} from '../services/api';

export default function OverviewPage({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  // Metrics states - defaults to null / unavailable
  const [metrics, setMetrics] = useState({
    commoditiesCount: null,
    commoditiesStatus: 'unloaded',
    marketRatesCount: null,
    marketRatesStatus: 'unloaded',
    buyerDemandsCount: null,
    buyerDemandsStatus: 'unloaded',
    notificationsCount: null,
    notificationsStatus: 'unloaded',
    whatsAppLogsCount: null,
    whatsAppLogsStatus: 'unloaded',
  });

  const [rateHistoryData, setRateHistoryData] = useState([]);
  const [rateHistoryStatus, setRateHistoryStatus] = useState('unloaded');
  const [errors, setErrors] = useState({});

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    const newErrors = {};

    // 1. Fetch Commodities
    try {
      const data = await fetchCommodities({ useUpstreamDirect });
      const list = Array.isArray(data) ? data : [];
      setMetrics((prev) => ({
        ...prev,
        commoditiesCount: list.length,
        commoditiesStatus: 'available',
      }));
    } catch (err) {
      newErrors.commodities = err;
      setMetrics((prev) => ({
        ...prev,
        commoditiesCount: null,
        commoditiesStatus: err.status === 404 ? 'missing_mapping' : 'error',
      }));
    }

    // 2. Fetch Market Rates
    try {
      const data = await fetchMarketRates({ useUpstreamDirect });
      const list = Array.isArray(data) ? data : [];
      setMetrics((prev) => ({
        ...prev,
        marketRatesCount: list.length,
        marketRatesStatus: 'available',
      }));
    } catch (err) {
      newErrors.marketRates = err;
      setMetrics((prev) => ({
        ...prev,
        marketRatesCount: null,
        marketRatesStatus: err.status === 404 ? 'missing_mapping' : 'error',
      }));
    }

    // 3. Fetch Buyer Demands
    try {
      const data = await fetchBuyerDemands({ useUpstreamDirect });
      const list = Array.isArray(data) ? data : [];
      setMetrics((prev) => ({
        ...prev,
        buyerDemandsCount: list.length,
        buyerDemandsStatus: 'available',
      }));
    } catch (err) {
      newErrors.buyerDemands = err;
      setMetrics((prev) => ({
        ...prev,
        buyerDemandsCount: null,
        buyerDemandsStatus: err.status === 404 ? 'missing_mapping' : 'error',
      }));
    }

    // 4. Fetch Notifications
    try {
      const data = await fetchNotifications({ useUpstreamDirect });
      const list = Array.isArray(data) ? data : [];
      setMetrics((prev) => ({
        ...prev,
        notificationsCount: list.length,
        notificationsStatus: 'available',
      }));
    } catch (err) {
      newErrors.notifications = err;
      setMetrics((prev) => ({
        ...prev,
        notificationsCount: null,
        notificationsStatus: err.status === 404 ? 'missing_mapping' : 'error',
      }));
    }

    // 5. Fetch WhatsApp Logs
    try {
      const data = await fetchWhatsAppLogs({ useUpstreamDirect });
      const list = Array.isArray(data) ? data : [];
      setMetrics((prev) => ({
        ...prev,
        whatsAppLogsCount: list.length,
        whatsAppLogsStatus: 'available',
      }));
    } catch (err) {
      newErrors.whatsAppLogs = err;
      setMetrics((prev) => ({
        ...prev,
        whatsAppLogsCount: null,
        whatsAppLogsStatus: err.status === 404 ? 'missing_mapping' : 'error',
      }));
    }

    // 6. Fetch Rate History for Chart
    try {
      const history = await fetchRateHistory({ useUpstreamDirect });
      const list = Array.isArray(history) ? history : [];
      setRateHistoryData(list);
      setRateHistoryStatus(list.length > 0 ? 'available' : 'empty');
    } catch (err) {
      newErrors.rateHistory = err;
      setRateHistoryData([]);
      setRateHistoryStatus(err.status === 404 ? 'missing_mapping' : 'error');
    }

    setErrors(newErrors);
    setLoading(false);
  }, [useUpstreamDirect]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const hasMissingMappings = Object.values(errors).some((e) => e?.status === 404);

  return (
    <div className="overview-page">
      {/* Backend Architecture Notification Banner */}
      <div className="architecture-banner">
        <div className="banner-left">
          <ServerIcon size={18} />
          <div>
            <strong>Backend Connection: </strong>
            <span>Calling {useUpstreamDirect ? `Marketplace Backend (${MARKETPLACE_BASE_URL})` : `Commodity_Admin_AI (${API_BASE_URL})`}</span>
          </div>
        </div>
        <div className="banner-right">
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={() => setUseUpstreamDirect((prev) => !prev)}
            title="Toggle between port 9090 (Admin AI) and port 7070 (Marketplace Backend)"
          >
            {useUpstreamDirect ? "Switch to Port 9090 (Admin AI)" : "Test Upstream Direct (Port 7070)"}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={loadDashboardData}
            title="Reload metrics"
          >
            <RefreshIcon size={12} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Missing mapping notice if calling 9090 and 404 is encountered */}
      {!useUpstreamDirect && hasMissingMappings && (
        <div className="missing-mapping-alert">
          <div className="alert-content">
            <span className="alert-title">Notice on Port 9090 Controller Endpoints:</span>
            <p>
              In <code>Commodity_Admin_AI</code>, marketplace data is fetched by Spring Boot's internal <code>MarketplaceApiClient</code> from upstream port 7070.
              However, <code>Commodity_Admin_AI</code> does not currently have public controller endpoints (e.g. <code>/api/ai/*</code>) mapped on port 9090.
              Only <code>POST /api/admin/chat</code> is mapped on port 9090.
              As specified in the architecture instructions, metrics are reported as <strong>Unavailable</strong> rather than fabricating numbers.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stat Cards Grid */}
      <section className="stats-grid" aria-label="Dashboard Metrics">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Commodities"
              value={metrics.commoditiesCount}
              subtitle="Registered trade commodities"
              icon={CommodityIcon}
              isUnavailable={metrics.commoditiesStatus !== 'available'}
              unavailableReason={metrics.commoditiesStatus === 'missing_mapping' ? 'Port 9090 mapping pending' : 'API unavailable'}
              badgeText={metrics.commoditiesStatus === 'available' ? `${metrics.commoditiesCount} Items` : 'Unavailable'}
              badgeVariant={metrics.commoditiesStatus === 'available' ? 'success' : 'warning'}
              onClick={() => onNavigate('commodities')}
            />

            <StatCard
              title="Active Market Rates"
              value={metrics.marketRatesCount}
              subtitle="Latest published commodity rates"
              icon={RateIcon}
              isUnavailable={metrics.marketRatesStatus !== 'available'}
              unavailableReason={metrics.marketRatesStatus === 'missing_mapping' ? 'Port 9090 mapping pending' : 'API unavailable'}
              badgeText={metrics.marketRatesStatus === 'available' ? 'Live' : 'Unavailable'}
              badgeVariant={metrics.marketRatesStatus === 'available' ? 'info' : 'warning'}
              onClick={() => onNavigate('market-rates')}
            />

            <StatCard
              title="Buyer Demands"
              value={metrics.buyerDemandsCount}
              subtitle="Open buyer requirements"
              icon={DemandIcon}
              isUnavailable={metrics.buyerDemandsStatus !== 'available'}
              unavailableReason={metrics.buyerDemandsStatus === 'missing_mapping' ? 'Port 9090 mapping pending' : 'API unavailable'}
              badgeText={metrics.buyerDemandsStatus === 'available' ? 'Active Demands' : 'Unavailable'}
              badgeVariant={metrics.buyerDemandsStatus === 'available' ? 'success' : 'warning'}
              onClick={() => onNavigate('buyer-demands')}
            />

            <StatCard
              title="Notifications"
              value={metrics.notificationsCount}
              subtitle="System & rate alert events"
              icon={NotificationIcon}
              isUnavailable={metrics.notificationsStatus !== 'available'}
              unavailableReason={metrics.notificationsStatus === 'missing_mapping' ? 'Port 9090 mapping pending' : 'API unavailable'}
              badgeText={metrics.notificationsStatus === 'available' ? 'Recorded' : 'Unavailable'}
              badgeVariant={metrics.notificationsStatus === 'available' ? 'neutral' : 'warning'}
              onClick={() => onNavigate('notifications')}
            />

            <StatCard
              title="WhatsApp Activity"
              value={metrics.whatsAppLogsCount}
              subtitle="Dispatched message logs"
              icon={WhatsAppIcon}
              isUnavailable={metrics.whatsAppLogsStatus !== 'available'}
              unavailableReason={metrics.whatsAppLogsStatus === 'missing_mapping' ? 'Port 9090 mapping pending' : 'API unavailable'}
              badgeText={metrics.whatsAppLogsStatus === 'available' ? 'Dispatched' : 'Unavailable'}
              badgeVariant={metrics.whatsAppLogsStatus === 'available' ? 'success' : 'warning'}
              onClick={() => onNavigate('whatsapp-logs')}
            />
          </>
        )}
      </section>

      {/* Main Content Area: Chart and AI Quick Action */}
      <div className="overview-content-layout">
        <div className="overview-chart-column">
          <TrendChart
            data={rateHistoryData}
            title="Market Rate Historical Trend"
            emptyMessage={
              rateHistoryStatus === 'missing_mapping'
                ? "Rate history data unavailable from Commodity_Admin_AI (Port 9090). Controller mapping required."
                : "No historical rate records available to generate trend chart."
            }
          />
        </div>

        <div className="overview-side-column">
          <div className="ai-feature-card">
            <div className="ai-feature-header">
              <div className="ai-feature-icon">
                <SparklesIcon size={24} />
              </div>
              <div>
                <h4 className="ai-feature-title">AI Admin Assistant</h4>
                <p className="ai-feature-desc">
                  Ask natural language questions about rates, demands, listings, and logs.
                </p>
              </div>
            </div>

            <div className="ai-feature-status">
              <div className="status-row">
                <span className="status-label">Backend Endpoint:</span>
                <code>POST /api/admin/chat</code>
              </div>
              <div className="status-row">
                <span className="status-label">Endpoint Status:</span>
                <Badge variant="success" size="sm">Confirmed on Port 9090</Badge>
              </div>
              <div className="status-row">
                <span className="status-label">Capability:</span>
                <span>Gemini RAG + Conversational Context</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full ai-launch-btn"
              onClick={() => onNavigate('ai-assistant')}
            >
              <BotIcon size={18} />
              <span>Open AI Assistant</span>
            </button>
          </div>

          <div className="system-health-card">
            <h4 className="card-heading">API Architecture Map</h4>
            <div className="architecture-table">
              <div className="arch-row header">
                <span>Section</span>
                <span>Port 9090 Mapping</span>
              </div>
              <div className="arch-row">
                <span>Admin Chatbot</span>
                <span className="status-tag active">Confirmed (/api/admin/chat)</span>
              </div>
              <div className="arch-row">
                <span>Commodities</span>
                <span className="status-tag missing">Missing Controller</span>
              </div>
              <div className="arch-row">
                <span>Market Rates</span>
                <span className="status-tag missing">Missing Controller</span>
              </div>
              <div className="arch-row">
                <span>Rate History</span>
                <span className="status-tag missing">Missing Controller</span>
              </div>
              <div className="arch-row">
                <span>Buyer Demands</span>
                <span className="status-tag missing">Missing Controller</span>
              </div>
              <div className="arch-row">
                <span>Notifications</span>
                <span className="status-tag missing">Missing Controller</span>
              </div>
              <div className="arch-row">
                <span>WhatsApp Logs</span>
                <span className="status-tag missing">Missing Controller</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
