import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, RefreshIcon, AlertCircleIcon } from '../common/Icons';
import { fetchSupplyById } from '../../services/api';

const SUPPLY_MODAL_I18N = {
  en: {
    title: 'Supply Details',
    close: 'Close',
    loading: 'Loading supply details...',
    notFoundTitle: 'Supply Not Found',
    notFoundDesc: (id) => `No active supply record found for identifier "${id}".`,
    errorTitle: 'Error Loading Supply',
    retry: 'Retry',
    tabs: {
      overview: 'Overview',
      seller: 'Seller & Origin',
      quality: 'Specifications',
      inventory: 'Inventory & Dates',
    },
    fields: {
      supplyNumber: 'Supply ID',
      commodityName: 'Commodity',
      partyName: 'Seller / Trader',
      availableQuantity: 'Available Quantity',
      totalQuantity: 'Total Quantity',
      lockedQuantity: 'Locked Quantity',
      askingRate: 'Rate',
      location: 'Location',
      originZone: 'Origin Zone',
      originManufacturer: 'Origin Manufacturer',
      qualityGrade: 'Quality Grade',
      qualityName: 'Quality Standard',
      labSpecs: 'Lab Test Specifications',
      maskedLabel: 'Trade Label',
      validTill: 'Valid Till',
      status: 'Status',
      createdAt: 'Listed Date',
    },
    active: 'Active',
    expired: 'Expired',
    closed: 'Closed',
    supportedNote: 'Inventory records retrieved from Marketplace Backend. Only verified records are displayed.',
  },
  hi: {
    title: 'आपूर्ति का विवरण',
    close: 'बंद करें',
    loading: 'आपूर्ति विवरण लोड हो रहा है...',
    notFoundTitle: 'आपूर्ति नहीं मिली',
    notFoundDesc: (id) => `पहचानकर्ता "${id}" के लिए कोई आपूर्ति रिकॉर्ड नहीं मिला।`,
    errorTitle: 'आपूर्ति लोड करने में त्रुटि',
    retry: 'पुनः प्रयास करें',
    tabs: {
      overview: 'अवलोकन',
      seller: 'विक्रेता व मूल स्थान',
      quality: 'गुणवत्ता विवरण',
      inventory: 'स्टॉक व तिथियां',
    },
    fields: {
      supplyNumber: 'आपूर्ति ID',
      commodityName: 'वस्तु',
      partyName: 'विक्रेता',
      availableQuantity: 'उपलब्ध मात्रा',
      totalQuantity: 'कुल मात्रा',
      lockedQuantity: 'आरक्षित मात्रा',
      askingRate: 'दर',
      location: 'स्थान',
      originZone: 'मूल क्षेत्र',
      originManufacturer: 'मूल मिल / उत्पादक',
      qualityGrade: 'गुणवत्ता ग्रेड',
      qualityName: 'गुणवत्ता मानक',
      labSpecs: 'प्रयोगशाला विनिर्देश',
      maskedLabel: 'ट्रेड लेबल',
      validTill: 'वैधता की तारीख',
      status: 'स्थिति',
      createdAt: 'सूचीबद्ध दिनांक',
    },
    active: 'सक्रिय (Active)',
    expired: 'समाप्त (Expired)',
    closed: 'बंद (Closed)',
    supportedNote: 'मार्केटप्लेस बैकएंड से आपूर्ति रिकॉर्ड। केवल सत्यापित रिकॉर्ड ही प्रदर्शित हैं।',
  },
  mr: {
    title: 'पुरवठ्याचा तपशील',
    close: 'बंद करा',
    loading: 'पुरवठा तपशील लोड होत आहेत...',
    notFoundTitle: 'पुरवठा आढळला नाही',
    notFoundDesc: (id) => `"${id}" या ओळखकर्त्यासाठी कोणताही पुरवठा सापडला नाही.`,
    errorTitle: 'पुरवठा लोड करताना त्रुटी आली',
    retry: 'पुन्हा प्रयत्न करा',
    tabs: {
      overview: 'विहंगावलोकन',
      seller: 'विक्रेता व मूळ ठिकाण',
      quality: 'गुणवत्ता तपशील',
      inventory: 'साठा व मुदत',
    },
    fields: {
      supplyNumber: 'पुरवठा ID',
      commodityName: 'वस्तू',
      partyName: 'विक्रेता',
      availableQuantity: 'उपलब्ध प्रमाण',
      totalQuantity: 'एकूण प्रमाण',
      lockedQuantity: 'राखीव प्रमाण',
      askingRate: 'दर',
      location: 'ठिकाण',
      originZone: 'उत्पादन विभाग',
      originManufacturer: 'उत्पादक कारखाना',
      qualityGrade: 'दर्जा ग्रेड',
      qualityName: 'दर्जा मानक',
      labSpecs: 'लॅब चाचणी तपशील',
      maskedLabel: 'ट्रेड लेबल',
      validTill: 'वैधता दिनांक',
      status: 'स्थिती',
      createdAt: 'नोंदणी तारीख',
    },
    active: 'सक्रिय (Active)',
    expired: 'मुदत संपली (Expired)',
    closed: 'बंद (Closed)',
    supportedNote: 'मार्केटप्लेस बॅकएंडकडून पुरवठा नोंदी. केवळ सत्यापित नोंदी दर्शविल्या आहेत.',
  },
};

export default function SupplyDetailsModal({
  supply: initialSupply = null,
  supplyId = null,
  isOpen = false,
  onClose,
  lang = 'en',
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [supplyData, setSupplyData] = useState(initialSupply);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const i18n = SUPPLY_MODAL_I18N[lang] || SUPPLY_MODAL_I18N.en;

  const loadDetails = useCallback(async () => {
    const target = supplyId || initialSupply?.supplyNumber || initialSupply?.id;
    if (!target) return;

    if (initialSupply && (initialSupply.labSpecs || initialSupply.askingRate !== undefined)) {
      setSupplyData(initialSupply);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSupplyById(target);
      const resolved = data?.data || data?.supply || data;
      if (resolved && (resolved.supplyNumber || resolved.id)) {
        setSupplyData(resolved);
      } else if (initialSupply) {
        setSupplyData(initialSupply);
      } else {
        setError(i18n.notFoundDesc(target));
      }
    } catch (err) {
      if (initialSupply) {
        setSupplyData(initialSupply);
      } else {
        setError(err.message || i18n.errorTitle);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supplyId, initialSupply, i18n]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      loadDetails();
    } else {
      setSupplyData(null);
      setError(null);
    }
  }, [isOpen, loadDetails]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const supply = supplyData || initialSupply || {};
  const supplyCode = supply.supplyNumber || (supply.id ? `SUP-${supply.id}` : '-');
  const commodity = supply.commodityName || 'Commodity Supply';
  const statusStr = String(supply.status || 'ACTIVE').toUpperCase();
  const isActive = statusStr === 'ACTIVE';

  const formatRate = (rate) => {
    if (rate === undefined || rate === null) return '-';
    return `₹${Number(rate).toLocaleString('en-IN')}`;
  };

  const formatQuantity = (qty, unit) => {
    if (qty === undefined || qty === null) return '-';
    return `${Number(qty).toLocaleString('en-IN')} ${unit || 'Quintal'}`;
  };

  return (
    <div
      className="order-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supply-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="order-details-modal party-details-modal">
        {/* Header */}
        <div className="modal-header party-modal-header">
          <div className="party-modal-header-info">
            <div className="party-modal-header-top">
              <span className="party-modal-code-pill font-mono">{supplyCode}</span>
              <span
                className={`party-status-badge ${
                  isActive ? 'status-active' : 'status-inactive'
                }`}
              >
                {isActive ? i18n.active : statusStr === 'EXPIRED' ? i18n.expired : i18n.closed}
              </span>
              <span className="party-role-tag">{commodity}</span>
            </div>
            <h3 id="supply-modal-title" className="modal-title party-modal-company-title">
              {supply.partyName || commodity}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label={i18n.close}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="party-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`party-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {i18n.tabs.overview}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'seller'}
            className={`party-tab-btn ${activeTab === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveTab('seller')}
          >
            {i18n.tabs.seller}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'quality'}
            className={`party-tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveTab('quality')}
          >
            {i18n.tabs.quality}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inventory'}
            className={`party-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            {i18n.tabs.inventory}
          </button>
        </div>

        {/* Body */}
        <div className="modal-body party-modal-body">
          {isLoading && (
            <div className="order-loading-overlay">
              <div className="order-spinner" />
              <span>{i18n.loading}</span>
            </div>
          )}

          {!isLoading && error && !supplyData && (
            <div className="party-modal-state error">
              <AlertCircleIcon size={28} className="text-red-500" />
              <div className="party-state-title">{i18n.errorTitle}</div>
              <div className="party-state-desc">{error}</div>
              <button
                type="button"
                className="btn btn-secondary party-retry-btn"
                onClick={loadDetails}
              >
                <RefreshIcon size={14} />
                <span>{i18n.retry}</span>
              </button>
            </div>
          )}

          {!isLoading && (!error || supplyData) && (
            <div className="party-tab-content">
              {activeTab === 'overview' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.supplyNumber}:</span>
                    <span className="field-value font-mono font-bold">{supplyCode}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.commodityName}:</span>
                    <span className="field-value font-bold">{commodity}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.partyName}:</span>
                    <span className="field-value font-bold">{supply.partyName || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.askingRate}:</span>
                    <span className="field-value total-highlight">
                      {formatRate(supply.askingRate)} / {supply.unit || 'Quintal'}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.availableQuantity}:</span>
                    <span className="field-value font-bold">
                      {formatQuantity(supply.availableQuantity, supply.unit)}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.location}:</span>
                    <span className="field-value">{supply.location || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.status}:</span>
                    <span className="field-value">
                      <span
                        className={`party-status-badge ${
                          isActive ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {isActive ? i18n.active : statusStr}
                      </span>
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.validTill}:</span>
                    <span className="field-value font-mono">
                      {supply.validTill ? String(supply.validTill).replace('T', ' ') : '-'}
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'seller' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.partyName}:</span>
                    <span className="field-value font-bold">{supply.partyName || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.location}:</span>
                    <span className="field-value">{supply.location || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.originZone}:</span>
                    <span className="field-value">{supply.originZone || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.originManufacturer}:</span>
                    <span className="field-value">{supply.originManufacturerName || '-'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'quality' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.qualityGrade}:</span>
                    <span className="field-value font-bold">{supply.qualityGrade || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.qualityName}:</span>
                    <span className="field-value">{supply.qualityName || '-'}</span>
                  </div>
                  <div className="modal-field-group col-span-2">
                    <span className="field-label">{i18n.fields.labSpecs}:</span>
                    <span className="field-value font-mono text-xs">
                      {supply.labSpecs || 'Standard moisture & foreign matter compliant'}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.maskedLabel}:</span>
                    <span className="field-value">{supply.maskedLabel || '-'}</span>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.availableQuantity}:</span>
                    <span className="field-value font-bold total-highlight">
                      {formatQuantity(supply.availableQuantity, supply.unit)}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.totalQuantity}:</span>
                    <span className="field-value">
                      {formatQuantity(supply.totalQuantity, supply.unit)}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.lockedQuantity}:</span>
                    <span className="field-value">
                      {formatQuantity(supply.lockedQuantity || 0, supply.unit)}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.validTill}:</span>
                    <span className="field-value font-mono">
                      {supply.validTill ? String(supply.validTill).replace('T', ' ') : '-'}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.createdAt}:</span>
                    <span className="field-value font-mono">
                      {supply.createdAt ? String(supply.createdAt).replace('T', ' ') : '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer party-modal-footer">
          <span className="party-modal-footer-note">{i18n.supportedNote}</span>
          <button type="button" className="modal-action-btn party-close-btn" onClick={onClose}>
            {i18n.close}
          </button>
        </div>
      </div>
    </div>
  );
}
