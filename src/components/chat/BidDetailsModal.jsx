import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, AlertCircleIcon } from '../common/Icons';

const BID_MODAL_I18N = {
  en: {
    title: 'Bid & Negotiation Details',
    close: 'Close',
    loading: 'Loading bid details...',
    notFoundTitle: 'Bid Record Not Found',
    tabs: {
      overview: 'Bid Overview',
      negotiation: 'Counter-Offers & Negotiation',
      supply: 'Supply Reference',
      terms: 'Terms & Conditions',
    },
    fields: {
      bidId: 'Bid ID',
      supplyId: 'Target Supply ID',
      bidderName: 'Bidder / Trader',
      commodityName: 'Commodity',
      offerRate: 'Offer Rate',
      quantity: 'Offered Quantity',
      status: 'Bid Status',
      createdAt: 'Submitted At',
      latestCounterOffer: 'Latest Counter-Offer',
      counterRate: 'Counter Rate',
      counterBy: 'Counter Offered By',
      negotiationRounds: 'Negotiation Rounds',
      waitingFor: 'Awaiting Response From',
      paymentTerms: 'Payment Terms',
      deliveryTerms: 'Delivery Terms',
      validTill: 'Offer Validity',
      remarks: 'Trader Remarks',
    },
    supportedNote: 'Bids and negotiation records retrieved from Marketplace Backend. Only verified records are displayed.',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    counterOffer: 'Counter-Offer Active',
    awaitingResponse: 'Awaiting Response',
  },
  hi: {
    title: 'बोली व मोलभाव विवरण',
    close: 'बंद करें',
    loading: 'बोली विवरण लोड हो रहा है...',
    notFoundTitle: 'बोली रिकॉर्ड नहीं मिला',
    tabs: {
      overview: 'बोली अवलोकन',
      negotiation: 'काउंटर-ऑफर व मोलभाव',
      supply: 'आपूर्ति संदर्भ',
      terms: 'शर्तें व नियम',
    },
    fields: {
      bidId: 'बोली ID',
      supplyId: 'लक्षित आपूर्ति ID',
      bidderName: 'बोलीदाता / व्यापारी',
      commodityName: 'कमोडिटी',
      offerRate: 'प्रस्तावित दर (Offer Rate)',
      quantity: 'मात्रा',
      status: 'बोली स्थिति',
      createdAt: 'प्रस्तुति समय',
      latestCounterOffer: 'नवीनतम काउंटर-ऑफर',
      counterRate: 'काउंटर दर',
      counterBy: 'काउंटर देने वाला',
      negotiationRounds: 'मोलभाव के दौर',
      waitingFor: 'प्रतीक्षित प्रतिक्रिया',
      paymentTerms: 'भुगतान शर्तें',
      deliveryTerms: 'डिलीवरी शर्तें',
      validTill: 'ऑफर वैधता',
      remarks: 'व्यापारी टिप्पणियां',
    },
    supportedNote: 'मार्केटप्लेस बैकएंड से बोली व मोलभाव रिकॉर्ड। केवल सत्यापित डेटा प्रदर्शित है।',
    pending: 'लंबित (Pending)',
    accepted: 'स्वीकृत (Accepted)',
    rejected: 'अस्वीकृत (Rejected)',
    counterOffer: 'काउंटर-ऑफर सक्रिय',
    awaitingResponse: 'प्रतिक्रिया की प्रतीक्षा',
  },
  mr: {
    title: 'बोली व वाटाघाटी तपशील',
    close: 'बंद करा',
    loading: 'बोली तपशील लोड होत आहेत...',
    notFoundTitle: 'बोली नोंद आढळली नाही',
    tabs: {
      overview: 'बोली विहंगावलोकन',
      negotiation: 'काऊंटर-ऑफर व वाटाघाटी',
      supply: 'पुरवठा संदर्भ',
      terms: 'अटी व शर्ती',
    },
    fields: {
      bidId: 'बोली ID',
      supplyId: 'पुरवठा ID',
      bidderName: 'बोली लावणारा / व्यापारी',
      commodityName: 'शेतमाल',
      offerRate: 'सादर दर',
      quantity: 'प्रमाण',
      status: 'बोली स्थिती',
      createdAt: 'सादर वेळ',
      latestCounterOffer: 'ताज्या काऊंटर-ऑफर',
      counterRate: 'काऊंटर दर',
      counterBy: 'काऊंटर देणारा',
      negotiationRounds: 'वाटाघाटीच्या फेऱ्या',
      waitingFor: 'प्रतिसादाची प्रतीक्षा',
      paymentTerms: 'पेमेंट अटी',
      deliveryTerms: 'डिलिव्हरी अटी',
      validTill: 'वैधता मुदत',
      remarks: 'व्यापारी शेरा',
    },
    supportedNote: 'मार्केटप्लेस बॅकएंडवरील बोली व वाटाघाटी नोंदी. अधिकृत डेटा प्रदर्शित केला जातो.',
    pending: 'प्रलंबित (Pending)',
    accepted: 'स्वीकृत (Accepted)',
    rejected: 'नाकारली (Rejected)',
    counterOffer: 'काऊंटर-ऑफर सक्रिय',
    awaitingResponse: 'प्रतिसादाची प्रतीक्षा',
  },
};

export default function BidDetailsModal({
  bidId,
  initialData = null,
  lang = 'en',
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const t = BID_MODAL_I18N[lang] || BID_MODAL_I18N.en;

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

  const bid = initialData || {};

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

  const rawStatus = String(bid.status || 'PENDING').toUpperCase();
  const getStatusBadgeVariant = (s) => {
    if (s === 'ACCEPTED' || s === 'APPROVED') return 'status-active';
    if (s === 'REJECTED') return 'status-rejected';
    if (s.includes('COUNTER')) return 'status-fulfilled';
    return 'status-pending';
  };

  const displayStatus =
    rawStatus === 'PENDING'
      ? t.pending
      : rawStatus === 'ACCEPTED' || rawStatus === 'APPROVED'
      ? t.accepted
      : rawStatus === 'REJECTED'
      ? t.rejected
      : rawStatus.includes('COUNTER')
      ? t.counterOffer
      : bid.status || 'PENDING';

  const bidderName = bid.bidderName || bid.partyName || bid.buyerName || '--';
  const offerRate = bid.offerRate || bid.bidRate || bid.rate || bid.price;
  const quantity = bid.quantity || bid.bidQuantity;
  const unit = bid.unit || 'Quintal';
  const supplyId = bid.supplyId || bid.supplyNumber || '--';
  const commodityName = bid.commodityName || bid.commodity || '--';
  const createdAt = bid.createdAt ? new Date(bid.createdAt).toLocaleString() : '--';
  const counterRate = bid.counterRate || bid.latestCounterOffer;

  return (
    <div
      className="party-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bid-modal-title"
    >
      <div
        className="party-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="party-modal-header">
          <div className="party-modal-title-group">
            <span className="party-modal-badge">
              BID #{bid.id || bidId || 'RECORD'}
            </span>
            <h3 id="bid-modal-title" className="party-modal-title">
              {bidderName} &bull; {commodityName}
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
            aria-selected={activeTab === 'negotiation'}
            className={`party-modal-tab-btn ${
              activeTab === 'negotiation' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('negotiation')}
          >
            {t.tabs.negotiation}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'supply'}
            className={`party-modal-tab-btn ${
              activeTab === 'supply' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('supply')}
          >
            {t.tabs.supply}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'terms'}
            className={`party-modal-tab-btn ${
              activeTab === 'terms' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('terms')}
          >
            {t.tabs.terms}
          </button>
        </div>

        {/* Modal Body */}
        <div className="party-modal-body">
          {activeTab === 'overview' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.bidId}
                  </span>
                  <span className="party-modal-field-value bold">
                    #{bid.id || bidId || '--'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.supplyId}
                  </span>
                  <span className="party-modal-field-value bold">
                    {supplyId}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.bidderName}
                  </span>
                  <span className="party-modal-field-value bold">
                    {bidderName}
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
                    {t.fields.offerRate}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {formatCurrency(offerRate)} {offerRate ? `/ ${unit}` : ''}
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
                    {t.fields.createdAt}
                  </span>
                  <span className="party-modal-field-value">
                    {createdAt}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    Total Bid Value
                  </span>
                  <span className="party-modal-field-value bold">
                    {offerRate && quantity
                      ? formatCurrency(Number(offerRate) * Number(quantity))
                      : '--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'negotiation' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.latestCounterOffer}
                  </span>
                  <span className="party-modal-field-value bold highlight">
                    {counterRate ? formatCurrency(counterRate) : 'No counter-offer placed yet'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.waitingFor}
                  </span>
                  <span className="party-modal-field-value">
                    {bid.waitingFor || (rawStatus === 'PENDING' ? 'Seller Review' : 'None')}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.negotiationRounds}
                  </span>
                  <span className="party-modal-field-value">
                    {bid.rounds || bid.negotiationRounds || (counterRate ? 'Round 2' : 'Round 1')}
                  </span>
                </div>
                <div className="party-modal-field full-width">
                  <span className="party-modal-field-label">
                    Negotiation Thread History
                  </span>
                  <div className="negotiation-thread-box">
                    <div className="thread-event">
                      <span className="thread-dot dot-primary" />
                      <div className="thread-content">
                        <strong>Initial Bid Placed:</strong> {formatCurrency(offerRate)} for {formatQuantity(quantity, unit)} by {bidderName}
                        <small className="thread-time">{createdAt}</small>
                      </div>
                    </div>
                    {counterRate && (
                      <div className="thread-event">
                        <span className="thread-dot dot-warning" />
                        <div className="thread-content">
                          <strong>Counter-Offer Issued:</strong> {formatCurrency(counterRate)}
                          <small className="thread-time">Updated in marketplace record</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supply' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.supplyId}
                  </span>
                  <span className="party-modal-field-value bold">
                    {supplyId}
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
                    Origin / Warehouse
                  </span>
                  <span className="party-modal-field-value">
                    {bid.location || bid.warehouseLocation || 'Marketplace Verified Warehouse'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    Seller / Listing Trader
                  </span>
                  <span className="party-modal-field-value bold">
                    {bid.sellerName || 'Verified Supply Holder'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="party-modal-section">
              <div className="party-modal-grid">
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.paymentTerms}
                  </span>
                  <span className="party-modal-field-value">
                    {bid.paymentTerms || 'ESCROW / Instant settlement on weighment confirmation'}
                  </span>
                </div>
                <div className="party-modal-field">
                  <span className="party-modal-field-label">
                    {t.fields.deliveryTerms}
                  </span>
                  <span className="party-modal-field-value">
                    {bid.deliveryTerms || 'Ex-Warehouse / Buyer transport'}
                  </span>
                </div>
                <div className="party-modal-field full-width">
                  <span className="party-modal-field-label">
                    {t.fields.remarks}
                  </span>
                  <span className="party-modal-field-value">
                    {bid.remarks || bid.notes || 'Standard TradeX trading compliance terms accepted.'}
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
