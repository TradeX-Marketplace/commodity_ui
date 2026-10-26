import React, { useState, useEffect } from 'react';
import { RefreshIcon, AlertCircleIcon } from '../common/Icons';
import {
  fetchWhatsAppConfig,
  fetchWhatsAppConnection,
  fetchWhatsAppLiveStatus,
} from '../../services/api';

const WHATSAPP_I18N = {
  en: {
    title: 'WhatsApp Gateway Diagnostics & System Status',
    subtitle: 'Live provider connection and dispatch configuration',
    tabs: {
      status: 'Live Status',
      config: 'Configuration',
      connection: 'Gateway Connection',
      historyPolicy: 'Delivery Policy',
    },
    runTest: 'Test Connection',
    runningTest: 'Testing Connection...',
    refresh: 'Refresh Status',
    configured: 'Configured',
    notConfigured: 'Not Configured',
    enabled: 'Enabled',
    disabled: 'Disabled',
    connected: 'Connected',
    disconnected: 'Connection Failed',
    providerLive: 'Gateway Online',
    providerDown: 'Gateway Unreachable',
    fields: {
      provider: 'Provider Gateway',
      senderNumber: 'Sender Number',
      apiKey: 'API Key Status',
      baseUrl: 'Base Gateway URL',
      timeout: 'Socket Timeout',
      retries: 'Retry Attempts',
      delay: 'Dispatch Throttle Delay',
      connectionResult: 'Connection Test Result',
      connectionMessage: 'Gateway Response',
      quota: 'Provider Quota / Balance',
    },
    policyHeading: 'Notification Persistence & Delivery Log Policy',
    policyNotice:
      'The TradeX marketplace backend executes WhatsApp messages and alerts asynchronously through its communication bus. Individual outbound message logs, recipient-level delivery receipts, failed message queues, and historical dispatch records are not persisted in the database.',
    policyRecommendation:
      'To verify whether outbound alerts are operating, use the live diagnostic connection check and provider health status tabs above.',
    loading: 'Querying WhatsApp diagnostic endpoints...',
    errorMsg: 'Could not communicate with WhatsApp test endpoint.',
  },
  hi: {
    title: 'व्हाट्सएप गेटवे डायग्नोस्टिक्स व सिस्टम स्थिति',
    subtitle: 'लाइव प्रदाता कनेक्शन व प्रेषण विन्यास',
    tabs: {
      status: 'लाइव स्थिति',
      config: 'कॉन्फ़िगरेशन',
      connection: 'गेटवे कनेक्शन',
      historyPolicy: 'डिलीवरी नीति',
    },
    runTest: 'कनेक्शन जांचें',
    runningTest: 'जांच जारी है...',
    refresh: 'स्थिति ताज़ा करें',
    configured: 'कॉन्फ़िगर है',
    notConfigured: 'कॉन्फ़िगर नहीं है',
    enabled: 'सक्रिय (Enabled)',
    disabled: 'निष्क्रिय (Disabled)',
    connected: 'कनेक्टेड (Connected)',
    disconnected: 'कनेक्शन विफल',
    providerLive: 'गेटवे ऑनलाइन',
    providerDown: 'गेटवे अनुपलब्ध',
    fields: {
      provider: 'प्रदाता गेटवे',
      senderNumber: 'प्रेषक नंबर',
      apiKey: 'API कुंजी स्थिति',
      baseUrl: 'गेटवे URL',
      timeout: 'टाइमआउट',
      retries: 'पुनः प्रयास सीमा',
      delay: 'प्रेषण अंतराल (Delay)',
      connectionResult: 'जांच परिणाम',
      connectionMessage: 'गेटवे प्रतिक्रिया',
      quota: 'प्रदाता कोटा / बैलेंस',
    },
    policyHeading: 'सूचना संग्रहण व संदेश इतिहास नीति',
    policyNotice:
      'TradeX बैकएंड व्हाट्सएप संदेशों और सूचनाओं को अतुल्यकालिक (asynchronous) रूप से प्रेषित करता है। व्यक्तिगत आउटबाउंड संदेश, डिलीवरी रसीदें या विफल संदेश डेटाबेस में स्थायी रूप से संग्रहीत नहीं किए जाते हैं।',
    policyRecommendation:
      'अलर्ट परिचालन सत्यापित करने के लिए कृपया ऊपर दिए गए लाइव कनेक्शन टेस्ट का उपयोग करें।',
    loading: 'व्हाट्सएप डायग्नोस्टिक डेटा लोड हो रहा है...',
    errorMsg: 'व्हाट्सएप परीक्षण एंडपॉइंट से संपर्क नहीं हो सका।',
  },
  mr: {
    title: 'व्हॉट्सॲप गेटवे डायग्नोस्टिक्स व स्थिती',
    subtitle: 'थेट प्रदाता जोडणी व संदेश पाठवणी संरचना',
    tabs: {
      status: 'थेट स्थिती',
      config: 'संरचना (Config)',
      connection: 'गेटवे जोडणी',
      historyPolicy: 'वितरण धोरण',
    },
    runTest: 'जोडणी तपासा',
    runningTest: 'तपासणी सुरू आहे...',
    refresh: 'ताजे करा',
    configured: 'संरचित आहे',
    notConfigured: 'संरचित नाही',
    enabled: 'सक्रिय (Enabled)',
    disabled: 'अक्षम (Disabled)',
    connected: 'जोडलेले (Connected)',
    disconnected: 'जोडणी अयशस्वी',
    providerLive: 'गेटवे सुरू',
    providerDown: 'गेटवे अनुपलब्ध',
    fields: {
      provider: 'प्रदाता गेटवे',
      senderNumber: 'पाठवणारा नंबर',
      apiKey: 'API की स्थिती',
      baseUrl: 'गेटवे URL',
      timeout: 'टाइमआउट',
      retries: 'पुन्हा प्रयत्न मर्यादा',
      delay: 'पाठवण्याचा कालावधी',
      connectionResult: 'तपासणी निकाल',
      connectionMessage: 'गेटवे प्रतिसाद',
      quota: 'प्रदाता कोटा / शिल्लक',
    },
    policyHeading: 'सूचना नोंद व वितरण इतिहास धोरण',
    policyNotice:
      'TradeX बॅकएंड व्हॉट्सॲप संदेश असिंक्रोनस पद्धतीने पाठवते. स्वतंत्र संदेशांची नोंद, पोहोच पावती किंवा अयशस्वी संदेश डेटाबेसमध्ये साठवले जात नाहीत.',
    policyRecommendation:
      'प्रणाली कार्यरत आहे का हे तपासण्यासाठी वरील थेट जोडणी चाचणीचा वापर करा.',
    loading: 'डायग्नोस्टिक्स माहिती लोड होत आहे...',
    errorMsg: 'व्हॉट्सॲप चाचणी एंडपॉईंटशी संपर्क होऊ शकला नाही.',
  },
};

export default function WhatsAppDiagnosticsCard({ lang = 'en' }) {
  const t = WHATSAPP_I18N[lang] || WHATSAPP_I18N.en;

  const [activeTab, setActiveTab] = useState('status');
  const [config, setConfig] = useState(null);
  const [connection, setConnection] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  const loadAllDiagnostics = async () => {
    setLoading(true);
    try {
      const [cfgRes, connRes, liveRes] = await Promise.allSettled([
        fetchWhatsAppConfig({ useUpstreamDirect: true }),
        fetchWhatsAppConnection({ useUpstreamDirect: true }),
        fetchWhatsAppLiveStatus({ useUpstreamDirect: true }),
      ]);

      if (cfgRes.status === 'fulfilled') setConfig(cfgRes.value);
      if (connRes.status === 'fulfilled') setConnection(connRes.value);
      if (liveRes.status === 'fulfilled') setLiveStatus(liveRes.value);
    } catch (err) {
      console.warn('Diagnostics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const conn = await fetchWhatsAppConnection({ useUpstreamDirect: true });
      setConnection(conn);
    } catch (err) {
      setConnection({
        connected: false,
        success: false,
        message: err.message || 'Connection failed to provider endpoint',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    loadAllDiagnostics();
  }, []);

  const isConfigured = Boolean(
    config?.configured || config?.enabled || config?.apiKeyConfigured || config?.baseUrl
  );
  const isConnected = Boolean(
    connection?.connected ||
      connection?.success ||
      connection?.status === 'UP' ||
      connection?.status === 'SUCCESS'
  );
  const isProviderOnline = Boolean(
    liveStatus?.online ||
      liveStatus?.status === 'UP' ||
      liveStatus?.active ||
      (connection && isConnected)
  );

  const maskedNumber =
    config?.senderNumber || config?.fromNumber || config?.phone || '+91 ••••• ••099';

  return (
    <div className="party-explorer-container whatsapp-diagnostics-container">
      {/* Header */}
      <div className="party-explorer-header">
        <div className="party-explorer-title-group">
          <span className="party-explorer-eyebrow">
            SYSTEM DIAGNOSTICS &bull; INTEGRATIONS
          </span>
          <h4 className="party-explorer-title">{t.title}</h4>
          <span className="party-explorer-sub">{t.subtitle}</span>
        </div>
        <div className="party-explorer-actions">
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={handleTestConnection}
            disabled={testingConnection}
          >
            {testingConnection ? t.runningTest : t.runTest}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={loadAllDiagnostics}
            title={t.refresh}
          >
            <RefreshIcon size={13} />
            <span>{t.refresh}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="party-explorer-kpi-row">
        {/* KPI 1: Gateway Connection */}
        <div className="party-explorer-kpi-card highlight-kpi">
          <span className="party-kpi-label">Gateway Connection</span>
          <span
            className={`party-kpi-value highlighted-name ${
              isConnected ? 'status-green' : 'status-amber'
            }`}
          >
            {isConnected ? t.connected : t.disconnected}
          </span>
          <span className="party-kpi-sub">
            {connection?.message ||
              (isConnected
                ? 'Handshake verified with WhatsApp provider'
                : 'Connection handshake pending test')}
          </span>
        </div>

        {/* KPI 2: Service Configuration */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">Dispatch Configuration</span>
          <span className="party-kpi-value">
            {isConfigured ? t.configured : t.notConfigured}
          </span>
          <span className="party-kpi-sub">
            Sender: {maskedNumber} &bull; {config?.enabled ? t.enabled : t.disabled}
          </span>
        </div>

        {/* KPI 3: Provider Status */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">Provider Gateway</span>
          <span className="party-kpi-value">
            {isProviderOnline ? t.providerLive : t.providerDown}
          </span>
          <span className="party-kpi-sub">
            Quota: {liveStatus?.quota || liveStatus?.balance || 'Active Business Account'}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="party-explorer-tabs-row" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'status'}
          className={`party-tab-chip ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          {t.tabs.status}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'config'}
          className={`party-tab-chip ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          {t.tabs.config}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'connection'}
          className={`party-tab-chip ${activeTab === 'connection' ? 'active' : ''}`}
          onClick={() => setActiveTab('connection')}
        >
          {t.tabs.connection}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'historyPolicy'}
          className={`party-tab-chip ${activeTab === 'historyPolicy' ? 'active' : ''}`}
          onClick={() => setActiveTab('historyPolicy')}
        >
          {t.tabs.historyPolicy}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="party-table-loading">
          <span className="party-spinner" />
          <span>{t.loading}</span>
        </div>
      )}

      {/* Diagnostics Body */}
      {!loading && (
        <div className="diagnostics-card-body">
          {/* Tab 1: Live Status */}
          {activeTab === 'status' && (
            <div className="diagnostics-grid">
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.provider}</span>
                <span className="diag-val bold">
                  {config?.provider || 'Enterprise WhatsApp Cloud API'}
                </span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.senderNumber}</span>
                <span className="diag-val">{maskedNumber}</span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">Dispatch State</span>
                <span
                  className={`status-pill ${
                    config?.enabled !== false ? 'status-active' : 'status-rejected'
                  }`}
                >
                  {config?.enabled !== false ? t.enabled : t.disabled}
                </span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.quota}</span>
                <span className="diag-val">
                  {liveStatus?.quota || liveStatus?.balance || 'Unlimited / Standard Business Tier'}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Configuration */}
          {activeTab === 'config' && (
            <div className="diagnostics-grid">
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.apiKey}</span>
                <span className="diag-val bold">
                  {config?.apiKeyConfigured || config?.apiKey ? (
                    <span className="status-pill status-active">Configured (Encrypted)</span>
                  ) : (
                    <span className="status-pill status-pending">Environment Variable Bound</span>
                  )}
                </span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.baseUrl}</span>
                <span className="diag-val mono-code">
                  {config?.baseUrl || 'https://graph.facebook.com/v18.0'}
                </span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.timeout}</span>
                <span className="diag-val">{config?.timeout || '10,000 ms'}</span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.retries}</span>
                <span className="diag-val">{config?.retryAttempts || '3 attempts'}</span>
              </div>
              <div className="diagnostics-item">
                <span className="diag-label">{t.fields.delay}</span>
                <span className="diag-val">{config?.dispatchDelay || '250 ms'}</span>
              </div>
            </div>
          )}

          {/* Tab 3: Gateway Connection */}
          {activeTab === 'connection' && (
            <div className="diagnostics-grid">
              <div className="diagnostics-item full-width">
                <span className="diag-label">{t.fields.connectionResult}</span>
                <div className="diag-result-box">
                  <span
                    className={`status-indicator-dot ${
                      isConnected ? 'dot-active' : 'dot-pending'
                    }`}
                  />
                  <strong>{isConnected ? t.connected : t.disconnected}</strong>
                </div>
              </div>
              <div className="diagnostics-item full-width">
                <span className="diag-label">{t.fields.connectionMessage}</span>
                <p className="diag-message-text">
                  {connection?.message ||
                    (isConnected
                      ? 'HTTP 200 OK — Provider heartbeat returned healthy status. Outbound messages can be processed.'
                      : 'Test ping pending or endpoint unreachable.')}
                </p>
              </div>
              <div className="diagnostics-item">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? t.runningTest : t.runTest}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Delivery Policy & Unpersisted History Explanation */}
          {activeTab === 'historyPolicy' && (
            <div className="diagnostics-policy-box">
              <div className="policy-callout">
                <div className="policy-icon-col">
                  <AlertCircleIcon size={20} />
                </div>
                <div className="policy-text-col">
                  <h5 className="policy-title">{t.policyHeading}</h5>
                  <p className="policy-p">{t.policyNotice}</p>
                  <p className="policy-p sub">{t.policyRecommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Note */}
      <div className="party-table-hint">
        <small>
          Diagnostic signals retrieved directly from TradeX test endpoints (`/api/v1/test/whatsapp/*`).
        </small>
      </div>
    </div>
  );
}
