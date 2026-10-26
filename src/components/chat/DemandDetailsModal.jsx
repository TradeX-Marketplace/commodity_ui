import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, AlertCircleIcon } from '../common/Icons';

const DEMAND_MODAL_I18N = {
  en: {
    title: 'Buyer Demand Details',
    close: 'Close',
    loading: 'Loading demand details...',
    notFoundTitle: 'Demand Record Not Found',
    notFoundDesc: (id) => `No active demand record found for identifier "${id}".`,
    tabs: {
      overview: 'Overview',
      specs: 'Procurement Specs',
      logistics: 'Logistics & Destination',
      dates: 'Timelines & Expiry',
    },
    fields: {
      demandId: 'Demand ID',
      commodityName: 'Commodity Demanded',
      buyerName: 'Buyer Name / Organization',
      requestedQuantity: 'Requested Quantity',
      targetRate: 'Target Rate',
      deliveryLocation: 'Delivery Location',
      requiredDate: 'Required By Date',
      status: 'Demand Status',
      createdAt: 'Submission Date',
      qualitySpecs: 'Quality Specifications',
      packaging: 'Packaging Requirement',
      deliveryTerms: 'Delivery Terms',
      paymentTerms: 'Payment Terms',
      urgency: 'Procurement Urgency',
      notes: 'Buyer Notes',
    },
    supportedNote: 'Procurement demand records retrieved from Marketplace Backend. Only verified records are displayed.',
    open: 'Open',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
    expired: 'Expired',
  },
  hi: {
    title: 'खरीदार मांग विवरण',
    close: 'बंद करें',
    loading: 'मांग विवरण लोड हो रहा है...',
    notFoundTitle: 'मांग रिकॉर्ड नहीं मिला',
    notFoundDesc: (id) => `पहचानकर्ता "${id}" के लिए कोई मांग रिकॉर्ड नहीं मिला।`,
    tabs: {
      overview: 'अवलोकन',
      specs: 'खरीद विनिर्देश',
      logistics: 'लॉजिस्टिक्स व गंतव्य',
      dates: 'समयसीमा व समाप्ति',
    },
    fields: {
      demandId: 'मांग ID',
      commodityName: 'कमोडिटी मांग',
      buyerName: 'खरीदार / संगठन',
      requestedQuantity: 'मांगी गई मात्रा',
      targetRate: 'लक्षित दर (Target Rate)',
      deliveryLocation: 'डिलीवरी स्थान',
      requiredDate: 'आवश्यकता दिनांक',
      status: 'मांग स्थिति',
      createdAt: 'प्रस्तुत दिनांक',
      qualitySpecs: 'गुणवत्ता विनिर्देश',
      packaging: 'पैकेजिंग आवश्यकता',
      deliveryTerms: 'डिलीवरी शर्तें',
      paymentTerms: 'भुगतान शर्तें',
      urgency: 'प्राथमिकता',
      notes: 'खरीदार टिप्पणियाँ',
    },
    supportedNote: 'मार्केटप्लेस बैकएंड से खरीद मांग रिकॉर्ड। केवल सत्यापित डेटा प्रदर्शित है।',
    open: 'खुली (Open)',
    fulfilled: 'पूर्ण (Fulfilled)',
    cancelled: 'रद्द (Cancelled)',
    expired: 'समाप्त (Expired)',
  },
  mr: {
    title: 'खरेदीदार मागणी तपशील',
    close: 'बंद करा',
    loading: 'मागणी तपशील लोड होत आहेत...',
    notFoundTitle: 'मागणी नोंद आढळली नाही',
    notFoundDesc: (id) => `"${id}" या ओळखकर्त्यासाठी कोणतीही मागणी सापडली नाही.`,
    tabs: {
      overview: 'विहंगावलोकन',
      specs: 'खरेदी अटी व निकष',
      logistics: 'वाहतूक व गंतव्य ठिकाण',
      dates: 'मुदत व वेळापत्रक',
    },
    fields: {
      demandId: 'मागणी ID',
      commodityName: 'शेतमाल मागणी',
      buyerName: 'खरेदीदार / संस्था',
      requestedQuantity: 'मागितलेले प्रमाण',
      targetRate: 'अपेक्षित खरेदी दर',
      deliveryLocation: 'डिलिव्हरी ठिकाण',
      requiredDate: 'आवश्यक तारीख',
      status: 'मागणी स्थिती',
      createdAt: 'नोंदणी तारीख',
      qualitySpecs: 'गुणवत्ता निकष',
      packaging: 'पॅकेजिंग आवश्यकता',
      deliveryTerms: 'डिलिव्हरी अटी',
      paymentTerms: 'पेमेंट अटी',
      urgency: 'तातडी',
      notes: 'खरेदीदार टिप्पण्या',
    },
    supportedNote: 'मार्केटप्लेस बॅकएंडवरील खरेदी मागणी नोंदी. फक्त अधिकृत डेटा प्रदर्शित केला जातो.',
    open: 'सक्रिय (Open)',
    fulfilled: 'पूर्ण (Fulfilled)',
    cancelled: 'रद्द (Cancelled)',
    expired: 'मुदत संपली (Expired)',
  },
};

export default function DemandDetailsModal({
  demandId,
  initialData = null,
  lang = 'en',
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const t = DEMAND_MODAL_I18N[lang] || DEMAND_MODAL_I18N.en;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const demand = initialData || {};

  const formatQuantity = (qty, unit) => {
    if (qty === null || qty === undefined || qty === '') return '--';
    const num = Number(qty);
    if (isNaN(num)) return String(qty);
    return `${num.toLocaleString('en-IN')} ${unit || 'Quintal'}`;
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '--';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getStatusBadgeVariant = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'OPEN' || s === 'ACTIVE') return 'status-active';
    if (s === 'FULFILLED' || s === 'COMPLETED') return 'status-fulfilled';
    if (s === 'CANCELLED' || s === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  };

  const rawStatus = (demand.status || 'OPEN').toUpperCase();
  const displayStatus =
    rawStatus === 'OPEN'
      ? t.open
      : rawStatus === 'FULFILLED'
      ? t.fulfilled
      : rawStatus === 'CANCELLED'
      ? t.cancelled
      : demand.status || 'OPEN';

  const commodityName = demand.commodityName || demand.commodity || '--';
  const buyerName = demand.buyerName || demand.buyer || '--';
  const location = demand.location || demand.deliveryLocation || '--';
  const requiredDate = demand.requiredDate || demand.date || demand.expectedDate || '--';
  const targetRate = demand.targetRate || demand.price || demand.rate;
  const quantity = demand.quantity || demand.requestedQuantity;
  const unit = demand.unit || 'Quintal';

  return (
    <div
      className="party-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demand-modal-title"
    >
      <div
        className="party-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="party-modal-header">
          <div className="party-modal-title-group">
            <span className="party-modal-badge">
              DEMAND #{demand.id || demandId || 'RECORD'}
            </span>
            <h3 id="demand-modal-title" className="party-modal-title">
              {commodityName} &bull; {buyerName}
            </h3>
          </div>
          <button
            type="button"
            className="party-modal-close-btn"
            onClick={onClose}
            aria-label={t.close}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="party-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`party-modal-tab-btn ${
              activeTab === 'overview' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('overview')}
          >
            {t.tabs.overview}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'specs'}
            className={`party-modal-tab-btn ${
              activeTab === 'specs' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('specs')}
          >
            {t.tabs.specs}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'logistics'}
            className={`party-modal-tab-btn ${
              activeTab === 'logistics' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('logistics')}
          >
            {t.tabs.logistics}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dates'}
            className={`party-modal-tab-btn ${
              activeTab === 'dates' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('dates')}
          >
            {t.tabs.dates}
          </button>
        </div>

        {/* Modal Body */}
        <div className="party-modal-body">
          {activeTab === 'overview' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.demandId}
                  </span>
                  <span className="party-modal-field-value bold">
                    #{demand.id || demandId || '--'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.commodityName}
                  </span>
                  <span className="party-modal-field-value">
                    {commodityName}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.buyerName}
                  </span>
                  <span className="party-modal-field-value bold">
                    {buyerName}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.status}
                  </span>
                  <span className={`status-pill ${getStatusBadgeVariant(rawStatus)}`}>
                    {displayStatus}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.requestedQuantity}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {formatQuantity(quantity, unit)}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.targetRate}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {formatCurrency(targetRate)} {targetRate ? `/ ${unit}` : ''}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.deliveryLocation}
                  </span>
                  <span className="party-modal-field-value">
                    {location}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.requiredDate}
                  </span>
                  <span className="party-modal-field-value">
                    {requiredDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field full-width">
                  <span className="party-modal-field-label">
                    {t.fields.qualitySpecs}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.qualitySpecs || demand.specifications || demand.grade || 'Standard marketplace grade specifications apply.'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.packaging}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.packaging || demand.packingType || 'Standard 50kg HDPE/Jute bags'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.paymentTerms}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.paymentTerms || 'ESCROW / Net 7 days after delivery inspection'}
                  </span>
                </div>
                <div className="party-modal-field full-width">
                  <span className="party-modal-field-label">
                    {t.fields.notes}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.notes || demand.buyerNotes || 'No additional procurement remarks attached.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.deliveryLocation}
                  </span>
                  <span className="party-modal-field-value bold">
                    {location}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.deliveryTerms}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.deliveryTerms || 'FOR Destination (Freight on Buyer/Seller by agreed contract)'}
                  </span>
                </div>
                <div className="party-modal-field full-width">
                  <span className="party-modal-field-label">
                    Unloading Point / Destination Address
                  </span>
                  <span className="party-modal-field-value">
                    {demand.address || demand.destinationAddress || `${location} Central Warehouse / Processing Unit`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dates' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.createdAt}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.createdAt ? new Date(demand.createdAt).toLocaleDateString() : '--'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.requiredDate}
                  </span>
                  <span className="party-modal-field-value bold">
                    {requiredDate}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.urgency}
                  </span>
                  <span className="party-modal-field-value">
                    {demand.urgency || (requiredDate !== '--' ? 'Scheduled Procurement' : 'Normal')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="party-modal-footer">
          <span className="party-modal-footer-note">
            <AlertCircleIcon size={14} />
            {t.supportedNote}
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onClose}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
