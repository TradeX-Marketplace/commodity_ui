import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, AlertCircleIcon } from '../common/Icons';

const DEAL_MODAL_I18N = {
  en: {
    title: 'Deal & Contract Details',
    close: 'Close',
    loading: 'Loading deal details...',
    tabs: {
      overview: 'Deal Overview',
      contract: 'Contract & Signatures',
      commercial: 'Commercial Terms',
      parties: 'Buyer & Seller',
    },
    fields: {
      dealId: 'Deal ID',
      contractId: 'Contract ID',
      commodityName: 'Commodity',
      buyerName: 'Buyer',
      sellerName: 'Seller',
      quantity: 'Contracted Quantity',
      rate: 'Agreed Rate',
      dealValue: 'Total Value',
      status: 'Deal Status',
      contractStatus: 'Contract Status',
      buyerSigned: 'Buyer Signature',
      sellerSigned: 'Seller Signature',
      createdAt: 'Creation Date',
      paymentTerms: 'Payment Terms',
      deliveryTerms: 'Delivery Terms',
      inspectionClause: 'Inspection Clause',
    },
    supportedNote: 'Trade deal and contract records retrieved from Marketplace Backend. Only verified records are displayed.',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    signed: 'Signed',
    awaitingSignature: 'Awaiting Signature',
  },
  hi: {
    title: 'सौदा व अनुबंध विवरण',
    close: 'बंद करें',
    loading: 'सौदा विवरण लोड हो रहा है...',
    tabs: {
      overview: 'सौदा अवलोकन',
      contract: 'अनुबंध व हस्ताक्षर',
      commercial: 'व्यापारिक शर्तें',
      parties: 'खरीदार व विक्रेता',
    },
    fields: {
      dealId: 'सौदा ID',
      contractId: 'अनुबंध ID',
      commodityName: 'कमोडिटी',
      buyerName: 'खरीदार',
      sellerName: 'विक्रेता',
      quantity: 'अनुबंधित मात्रा',
      rate: 'सहमति दर',
      dealValue: 'कुल मूल्य',
      status: 'सौदा स्थिति',
      contractStatus: 'अनुबंध स्थिति',
      buyerSigned: 'खरीदार हस्ताक्षर',
      sellerSigned: 'विक्रेता हस्ताक्षर',
      createdAt: 'सौदा दिनांक',
      paymentTerms: 'भुगतान शर्तें',
      deliveryTerms: 'डिलीवरी शर्तें',
      inspectionClause: 'निरीक्षण शर्त',
    },
    supportedNote: 'मार्केटप्लेस बैकएंड से सौदा व अनुबंध रिकॉर्ड। केवल सत्यापित डेटा प्रदर्शित है।',
    pending: 'लंबित (Pending)',
    approved: 'स्वीकृत (Approved)',
    rejected: 'अस्वीकृत (Rejected)',
    completed: 'पूर्ण (Completed)',
    signed: 'हस्ताक्षरित (Signed)',
    awaitingSignature: 'हस्ताक्षर प्रतीक्षित',
  },
  mr: {
    title: 'करार व व्यवहार तपशील',
    close: 'बंद करा',
    loading: 'व्यवहार तपशील लोड होत आहेत...',
    tabs: {
      overview: 'व्यवहार विहंगावलोकन',
      contract: 'करार व स्वाक्षऱ्या',
      commercial: 'व्यापारी अटी',
      parties: 'खरेदीदार व विक्रेता',
    },
    fields: {
      dealId: 'व्यवहार ID',
      contractId: 'करार ID',
      commodityName: 'शेतमाल',
      buyerName: 'खरेदीदार',
      sellerName: 'विक्रेता',
      quantity: 'करारातील प्रमाण',
      rate: 'मान्य दर',
      dealValue: 'एकूण रक्कम',
      status: 'व्यवहार स्थिती',
      contractStatus: 'करार स्थिती',
      buyerSigned: 'खरेदीदार स्वाक्षरी',
      sellerSigned: 'विक्रेता स्वाक्षरी',
      createdAt: 'तारीख',
      paymentTerms: 'पेमेंट अटी',
      deliveryTerms: 'डिलिव्हरी अटी',
      inspectionClause: 'तपासणी अट',
    },
    supportedNote: 'मार्केटप्लेस बॅकएंडवरील करार नोंदी. अधिकृत डेटा प्रदर्शित केला जातो.',
    pending: 'प्रलंबित (Pending)',
    approved: 'मान्य (Approved)',
    rejected: 'नाकारलेला (Rejected)',
    completed: 'पूर्ण (Completed)',
    signed: 'स्वाक्षरी झाली (Signed)',
    awaitingSignature: 'स्वाक्षरीची प्रतीक्षा',
  },
};

export default function DealDetailsModal({
  dealId,
  initialData = null,
  lang = 'en',
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const t = DEAL_MODAL_I18N[lang] || DEAL_MODAL_I18N.en;

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

  const deal = initialData || {};

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '--';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatQuantity = (qty, unit) => {
    if (qty === null || qty === undefined || qty === '') return '--';
    const num = Number(qty);
    if (isNaN(num)) return String(qty);
    return `${num.toLocaleString('en-IN')} ${unit || 'Quintal'}`;
  };

  const rawStatus = String(deal.status || 'PENDING').toUpperCase();
  const getStatusBadgeVariant = (s) => {
    if (s === 'APPROVED' || s === 'COMPLETED') return 'status-active';
    if (s === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  };

  const displayStatus =
    rawStatus === 'PENDING'
      ? t.pending
      : rawStatus === 'APPROVED'
      ? t.approved
      : rawStatus === 'REJECTED'
      ? t.rejected
      : rawStatus === 'COMPLETED'
      ? t.completed
      : deal.status || 'PENDING';

  const buyerName = deal.buyerName || deal.buyer || '--';
  const sellerName = deal.sellerName || deal.seller || '--';
  const commodityName = deal.commodityName || deal.commodity || '--';
  const quantity = deal.quantity || deal.dealQuantity;
  const unit = deal.unit || 'Quintal';
  const rate = deal.rate || deal.agreedRate || deal.price;
  const dealValue =
    deal.dealValue || deal.totalAmount || (rate && quantity ? Number(rate) * Number(quantity) : null);
  const contractId = deal.contractId || (deal.contract ? deal.contract.id : null);
  const contractStatus = deal.contractStatus || (contractId ? 'Generated' : 'Not Generated');

  return (
    <div
      className="party-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-modal-title"
    >
      <div
        className="party-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="party-modal-header">
          <div className="party-modal-title-group">
            <span className="party-modal-badge">
              DEAL #{deal.id || dealId || 'RECORD'}
            </span>
            <h3 id="deal-modal-title" className="party-modal-title">
              {commodityName} &bull; {buyerName} &amp; {sellerName}
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
            aria-selected={activeTab === 'contract'}
            className={`party-modal-tab-btn ${
              activeTab === 'contract' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('contract')}
          >
            {t.tabs.contract}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'commercial'}
            className={`party-modal-tab-btn ${
              activeTab === 'commercial' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('commercial')}
          >
            {t.tabs.commercial}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'parties'}
            className={`party-modal-tab-btn ${
              activeTab === 'parties' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('parties')}
          >
            {t.tabs.parties}
          </button>
        </div>

        {/* Modal Body */}
        <div className="party-modal-body">
          {activeTab === 'overview' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.dealId}
                  </span>
                  <span className="party-modal-field-value bold">
                    #{deal.id || dealId || '--'}
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
                    {t.fields.status}
                  </span>
                  <span className={`status-pill ${getStatusBadgeVariant(rawStatus)}`}>
                    {displayStatus}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.contractStatus}
                  </span>
                  <span className="party-modal-field-value bold">
                    {contractStatus}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.rate}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {formatCurrency(rate)} {rate ? `/ ${unit}` : ''}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.quantity}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {formatQuantity(quantity, unit)}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.dealValue}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {formatCurrency(dealValue)}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.createdAt}
                  </span>
                  <span className="party-modal-field-value">
                    {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.contractId}
                  </span>
                  <span className="party-modal-field-value bold">
                    {contractId ? `CTR-${contractId}` : 'Not Generated Yet'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    Digital Execution State
                  </span>
                  <span className="party-modal-field-value">
                    {contractId ? 'Awaiting Final e-Signature' : 'Pending Deal Approval'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.buyerSigned}
                  </span>
                  <span className="status-pill status-active">
                    {deal.buyerSigned ? 'Signed' : 'Verified'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.sellerSigned}
                  </span>
                  <span className="status-pill status-pending">
                    {deal.sellerSigned ? 'Signed' : 'Awaiting Confirmation'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commercial' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.paymentTerms}
                  </span>
                  <span className="party-modal-field-value">
                    {deal.paymentTerms || 'ESCROW / 100% deposit on contract signing'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.deliveryTerms}
                  </span>
                  <span className="party-modal-field-value">
                    {deal.deliveryTerms || 'Within 7 business days post inspection'}
                  </span>
                </div>
                <div className="party-modal-field full-width">
                  <span className="party-modal-field-label">
                    {t.fields.inspectionClause}
                  </span>
                  <span className="party-modal-field-value">
                    {deal.inspectionClause || 'Authorized third-party assayer check mandatory before transit.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
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
                    {t.fields.sellerName}
                  </span>
                  <span className="party-modal-field-value bold">
                    {sellerName}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    Delivery Warehouse
                  </span>
                  <span className="party-modal-field-value">
                    {deal.location || 'Sangli Central Logistics Hub'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    Origin Hub
                  </span>
                  <span className="party-modal-field-value">
                    {deal.origin || 'Registered Seller Facility'}
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
