import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, CloseIcon, RefreshIcon, EyeIcon } from '../common/Icons';
import { fetchBids } from '../../services/api';
import BidDetailsModal from './BidDetailsModal';

const BID_I18N = {
  en: {
    title: 'Bids & Negotiations Explorer',
    searchPlaceholder: 'Search by bid ID, supply ID, bidder, status...',
    searchAriaLabel: 'Search bids and negotiations',
    clearSearch: 'Clear search',
    tabs: {
      all: 'All Bids',
      pending: 'Pending Bids',
      negotiations: 'Active Negotiations',
      awaiting: 'Awaiting Response',
      rejected: 'Rejected',
    },
    idCol: 'Bid ID',
    supplyCol: 'Supply ID',
    commodityCol: 'Commodity',
    bidderCol: 'Bidder / Trader',
    rateCol: 'Offer Rate',
    qtyCol: 'Quantity',
    statusCol: 'Status',
    counterCol: 'Latest Counter',
    dateCol: 'Date',
    actionCol: 'Action',
    viewDetails: 'View Details',
    noBidsFound: 'No bids or negotiations found',
    matchingCount: (count) => `${count} matching bids`,
    pendingBidsBadge: (count) => `${count} Pending Bids`,
    activeNegBadge: (count) => `${count} Active Negotiations`,
    highestBidTitle: 'Highest Offer Rate',
    highestBidSubtitle: (bidder, rate, unit, supply) => `${bidder} offers ₹${Number(rate).toLocaleString('en-IN')}/${unit || 'Quintal'} on ${supply}`,
    tiedBids: (count) => `(${count} bids tied at this top rate)`,
    loading: 'Loading bids and negotiations records...',
    apiError: 'Could not retrieve bids from marketplace backend. Please try again.',
    retry: 'Retry',
    pageText: (curr, total, count) => `Page ${curr} of ${total} (${count} total bids)`,
    prev: 'Previous',
    next: 'Next',
    pageSize: 'Per page:',
    doubleClickHint: 'Tip: Click any Bid ID, bidder name or View Details to examine negotiation threads.',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    counterOffer: 'Counter-Offer',
    awaitingResponse: 'Awaiting Response',
  },
  hi: {
    title: 'बोली व मोलभाव एक्सप्लोरर',
    searchPlaceholder: 'बोली ID, आपूर्ति ID, बोलीदाता से खोजें...',
    searchAriaLabel: 'बोली खोजें',
    clearSearch: 'खोज हटाएं',
    tabs: {
      all: 'सभी बोलियां',
      pending: 'लंबित बोलियां',
      negotiations: 'सक्रिय मोलभाव',
      awaiting: 'प्रतिक्रिया प्रतीक्षित',
      rejected: 'अस्वीकृत',
    },
    idCol: 'बोली ID',
    supplyCol: 'आपूर्ति ID',
    commodityCol: 'कमोडिटी',
    bidderCol: 'बोलीदाता',
    rateCol: 'प्रस्तावित दर',
    qtyCol: 'मात्रा',
    statusCol: 'स्थिति',
    counterCol: 'नवीनतम काउंटर',
    dateCol: 'दिनांक',
    actionCol: 'कार्य',
    viewDetails: 'विवरण देखें',
    noBidsFound: 'कोई बोली या मोलभाव नहीं मिला',
    matchingCount: (count) => `${count} मेल खाती बोलियां`,
    pendingBidsBadge: (count) => `${count} लंबित बोलियां`,
    activeNegBadge: (count) => `${count} सक्रिय मोलभाव`,
    highestBidTitle: 'सर्वोच्च बोली दर',
    highestBidSubtitle: (bidder, rate, unit, supply) => `${bidder} ने ${supply} पर ₹${Number(rate).toLocaleString('en-IN')}/${unit || 'क्विंटल'} की बोली लगाई`,
    tiedBids: (count) => `(${count} बोलियां समान शीर्ष दर पर)`,
    loading: 'बोली व मोलभाव रिकॉर्ड लोड हो रहे हैं...',
    apiError: 'मार्केटप्लेस बैकएंड से बोलियां प्राप्त नहीं की जा सकीं।',
    retry: 'पुनः प्रयास करें',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (कुल ${count} बोलियां)`,
    prev: 'पिछला',
    next: 'अगला',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'सुझाव: मोलभाव इतिहास देखने के लिए पंक्ति पर क्लिक करें।',
    pending: 'लंबित (Pending)',
    accepted: 'स्वीकृत (Accepted)',
    rejected: 'अस्वीकृत (Rejected)',
    counterOffer: 'काउंटर-ऑफर',
    awaitingResponse: 'प्रतीक्षित',
  },
  mr: {
    title: 'बोली व वाटाघाटी एक्सप्लोरर',
    searchPlaceholder: 'बोली ID, पुरवठा ID, बोलीदारावरून शोधा...',
    searchAriaLabel: 'बोली शोधा',
    clearSearch: 'शोध साफ करा',
    tabs: {
      all: 'सर्व बोली',
      pending: 'प्रलंबित बोली',
      negotiations: 'सक्रिय वाटाघाटी',
      awaiting: 'प्रतिसादाची प्रतीक्षा',
      rejected: 'नाकारलेल्या',
    },
    idCol: 'बोली ID',
    supplyCol: 'पुरवठा ID',
    commodityCol: 'शेतमाल',
    bidderCol: 'बोलीदार',
    rateCol: 'सादर दर',
    qtyCol: 'प्रमाण',
    statusCol: 'स्थिती',
    counterCol: 'ताज्या काऊंटर',
    dateCol: 'तारीख',
    actionCol: 'कृती',
    viewDetails: 'तपशील पहा',
    noBidsFound: 'कोणतीही बोली किंवा वाटाघाटी आढळली नाही',
    matchingCount: (count) => `${count} जुळणाऱ्या बोली`,
    pendingBidsBadge: (count) => `${count} प्रलंबित बोली`,
    activeNegBadge: (count) => `${count} सक्रिय वाटाघाटी`,
    highestBidTitle: 'सर्वोच्च बोली दर',
    highestBidSubtitle: (bidder, rate, unit, supply) => `${bidder} यांनी ${supply} वर ₹${Number(rate).toLocaleString('en-IN')}/${unit || 'क्विंटल'} सादर केली`,
    tiedBids: (count) => `(${count} बोली समान कमाल दरावर)`,
    loading: 'बोली व वाटाघाटी नोंदी लोड होत आहेत...',
    apiError: 'मार्केटप्लेस बॅकएंडवरून नोंदी मिळवता आल्या नाहीत.',
    retry: 'पुन्हा प्रयत्न करा',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (एकूण ${count} बोली)`,
    prev: 'मागे',
    next: 'पुढे',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'टीप: वाटाघाटी पाहण्यासाठी ओळीवर क्लिक करा.',
    pending: 'प्रलंबित (Pending)',
    accepted: 'स्वीकृत (Accepted)',
    rejected: 'नाकारली (Rejected)',
    counterOffer: 'काऊंटर-ऑफर',
    awaitingResponse: 'प्रतीक्षा',
  },
};

export default function BidExplorer({ message, lang = 'en' }) {
  const t = BID_I18N[lang] || BID_I18N.en;

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab filter: 'ALL', 'PENDING', 'NEGOTIATION', 'AWAITING', 'REJECTED'
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal
  const [selectedBidModal, setSelectedBidModal] = useState(null);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBids({ page: 0, size: 50, useUpstreamDirect: true });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setBids(list);
    } catch (err) {
      console.warn('Failed to load bids from backend:', err);
      setError(err);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  // Pre-seed active tab or search based on question
  useEffect(() => {
    const q = (message?.userQuestion || '').toLowerCase();
    if (q.includes('pending')) {
      setActiveTab('PENDING');
    } else if (q.includes('rejected')) {
      setActiveTab('REJECTED');
    } else if (q.includes('waiting') || q.includes('response')) {
      setActiveTab('AWAITING');
    } else if (q.includes('negotiat') || q.includes('counter')) {
      setActiveTab('NEGOTIATION');
    }

    // Supply specific query check: "Show the bids for a particular supply" or "SUP-..."
    const supplyMatch = (message?.userQuestion || '').match(/SUP-\d+/i);
    if (supplyMatch) {
      setSearchTerm(supplyMatch[0]);
    }
  }, [message?.userQuestion]);

  // Tab-filtered & search-filtered dataset
  const filteredBids = useMemo(() => {
    return bids.filter((b) => {
      const rawStatus = String(b.status || 'PENDING').toUpperCase();

      // Tab filtering
      if (activeTab === 'PENDING') {
        if (rawStatus !== 'PENDING') return false;
      } else if (activeTab === 'NEGOTIATION') {
        const hasCounter = b.counterRate || b.latestCounterOffer || rawStatus.includes('COUNTER');
        if (!hasCounter && rawStatus !== 'NEGOTIATION') return false;
      } else if (activeTab === 'AWAITING') {
        const isWaiting =
          b.waitingFor ||
          rawStatus === 'AWAITING_RESPONSE' ||
          (rawStatus === 'PENDING' && !b.counterRate);
        if (!isWaiting) return false;
      } else if (activeTab === 'REJECTED') {
        if (rawStatus !== 'REJECTED') return false;
      }

      // Search filtering
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const idMatch = String(b.id || '').toLowerCase().includes(term);
        const supplyMatch = String(b.supplyId || b.supplyNumber || '').toLowerCase().includes(term);
        const bidderMatch = String(b.bidderName || b.partyName || b.buyerName || '').toLowerCase().includes(term);
        const commMatch = String(b.commodityName || b.commodity || '').toLowerCase().includes(term);
        const statusMatch = rawStatus.toLowerCase().includes(term);
        if (!idMatch && !supplyMatch && !bidderMatch && !commMatch && !statusMatch) {
          return false;
        }
      }

      return true;
    });
  }, [bids, activeTab, searchTerm]);

  // Sorting
  const sortedBids = useMemo(() => {
    const list = [...filteredBids];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'id') {
        aVal = Number(a.id) || a.id || 0;
        bVal = Number(b.id) || b.id || 0;
      } else if (sortField === 'offerRate') {
        aVal = Number(a.offerRate || a.bidRate || a.rate || 0);
        bVal = Number(b.offerRate || b.bidRate || b.rate || 0);
      } else if (sortField === 'quantity') {
        aVal = Number(a.quantity || a.bidQuantity || 0);
        bVal = Number(b.quantity || b.bidQuantity || 0);
      } else if (sortField === 'bidder') {
        aVal = String(a.bidderName || a.partyName || '').toLowerCase();
        bVal = String(b.bidderName || b.partyName || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredBids, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedBids.length / pageSize) || 1;
  const pagedBids = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBids.slice(start, start + pageSize);
  }, [sortedBids, currentPage, pageSize]);

  // KPI 1: Pending Bids count
  const pendingBidsCount = useMemo(() => {
    return bids.filter((b) => (b.status || 'PENDING').toUpperCase() === 'PENDING').length;
  }, [bids]);

  // KPI 2: Active Negotiations count
  const activeNegotiationsCount = useMemo(() => {
    return bids.filter(
      (b) =>
        b.counterRate ||
        b.latestCounterOffer ||
        String(b.status || '').toUpperCase().includes('COUNTER')
    ).length;
  }, [bids]);

  // KPI 3: Highest Offer Rate (with tie handling)
  const highestOfferRateInfo = useMemo(() => {
    if (!bids || bids.length === 0) return null;
    let maxBid = null;
    let maxRate = -1;

    bids.forEach((b) => {
      const rate = Number(b.offerRate || b.bidRate || b.rate || 0);
      if (!isNaN(rate) && rate > maxRate) {
        maxRate = rate;
        maxBid = b;
      }
    });

    if (!maxBid || maxRate <= 0) return null;

    const tiedBids = bids.filter((b) => {
      const r = Number(b.offerRate || b.bidRate || b.rate || 0);
      return r === maxRate && b.id !== maxBid.id;
    });

    return {
      rate: maxRate,
      bidder: maxBid.bidderName || maxBid.partyName || 'Marketplace Trader',
      supplyId: maxBid.supplyId || maxBid.supplyNumber || 'SUP-RECORD',
      commodity: maxBid.commodityName || maxBid.commodity || 'Commodity',
      unit: maxBid.unit || 'Quintal',
      tiedCount: tiedBids.length,
    };
  }, [bids]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="party-explorer-container bid-explorer-container">
      {/* Top Banner */}
      <div className="party-explorer-header">
        <div className="party-explorer-title-group">
          <span className="party-explorer-eyebrow">TradeX &bull; TRADING DESK</span>
          <h4 className="party-explorer-title">{t.title}</h4>
        </div>
        <div className="party-explorer-actions">
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={loadBids}
            title={t.retry}
          >
            <RefreshIcon size={13} />
            <span>{t.retry}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="party-explorer-kpi-row">
        {/* KPI 1: Pending Bids */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">{t.pendingBidsBadge(pendingBidsCount)}</span>
          <span className="party-kpi-value">{pendingBidsCount}</span>
          <span className="party-kpi-sub">Bids awaiting review or confirmation</span>
        </div>

        {/* KPI 2: Highest Offer Rate */}
        {highestOfferRateInfo && (
          <div className="party-explorer-kpi-card highlight-kpi">
            <span className="party-kpi-label">{t.highestBidTitle}</span>
            <span className="party-kpi-value highlighted-name">
              ₹{Number(highestOfferRateInfo.rate).toLocaleString('en-IN')}{' '}
              <small style={{ fontSize: '0.65em', color: '#64748b' }}>
                / {highestOfferRateInfo.unit}
              </small>
            </span>
            <span className="party-kpi-sub">
              {t.highestBidSubtitle(
                highestOfferRateInfo.bidder,
                highestOfferRateInfo.rate,
                highestOfferRateInfo.unit,
                highestOfferRateInfo.supplyId
              )}
              {highestOfferRateInfo.tiedCount > 0 && (
                <span className="tied-pill">
                  {' '}
                  {t.tiedBids(highestOfferRateInfo.tiedCount)}
                </span>
              )}
            </span>
          </div>
        )}

        {/* KPI 3: Active Negotiations */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">{t.activeNegBadge(activeNegotiationsCount)}</span>
          <span className="party-kpi-value">{activeNegotiationsCount}</span>
          <span className="party-kpi-sub">Active counter-offer discussion threads</span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="party-explorer-tabs-row" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ALL'}
          className={`party-tab-chip ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('ALL');
            setCurrentPage(1);
          }}
        >
          {t.tabs.all}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'PENDING'}
          className={`party-tab-chip ${activeTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('PENDING');
            setCurrentPage(1);
          }}
        >
          {t.tabs.pending}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'NEGOTIATION'}
          className={`party-tab-chip ${activeTab === 'NEGOTIATION' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('NEGOTIATION');
            setCurrentPage(1);
          }}
        >
          {t.tabs.negotiations}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'AWAITING'}
          className={`party-tab-chip ${activeTab === 'AWAITING' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('AWAITING');
            setCurrentPage(1);
          }}
        >
          {t.tabs.awaiting}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'REJECTED'}
          className={`party-tab-chip ${activeTab === 'REJECTED' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('REJECTED');
            setCurrentPage(1);
          }}
        >
          {t.tabs.rejected}
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="party-explorer-toolbar">
        <div className="party-search-box">
          <SearchIcon size={14} className="party-search-icon" />
          <input
            type="text"
            className="party-search-input"
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAriaLabel}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="party-search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label={t.clearSearch}
            >
              <CloseIcon size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="party-table-loading">
          <span className="party-spinner" />
          <span>{t.loading}</span>
        </div>
      )}

      {!loading && error && (
        <div className="party-table-error">
          <span className="party-error-icon">⚠️</span>
          <div className="party-error-msg">
            <p>{t.apiError}</p>
            <small>{error.message}</small>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={loadBids}
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Bids Table */}
      {!loading && !error && (
        <>
          <div className="party-table-wrapper table-responsive">
            <table className="party-data-table" role="table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="sortable"
                    aria-sort={
                      sortField === 'id'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.idCol}{' '}
                    {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>{t.supplyCol}</th>
                  <th>{t.commodityCol}</th>
                  <th
                    onClick={() => handleSort('bidder')}
                    className="sortable"
                    aria-sort={
                      sortField === 'bidder'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.bidderCol}{' '}
                    {sortField === 'bidder' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('offerRate')}
                    className="sortable text-right"
                    aria-sort={
                      sortField === 'offerRate'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.rateCol}{' '}
                    {sortField === 'offerRate' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('quantity')}
                    className="sortable text-right"
                    aria-sort={
                      sortField === 'quantity'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.qtyCol}{' '}
                    {sortField === 'quantity' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>{t.counterCol}</th>
                  <th>{t.statusCol}</th>
                  <th className="text-center">{t.actionCol}</th>
                </tr>
              </thead>
              <tbody>
                {pagedBids.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="party-empty-cell">
                      <div className="party-empty-state">
                        <span className="party-empty-icon">🤝</span>
                        <p className="party-empty-title">{t.noBidsFound}</p>
                        <p className="party-empty-desc">
                          {searchTerm
                            ? `0 matching bids found for "${searchTerm}".`
                            : 'No bids found in this category.'}
                        </p>
                        {(searchTerm || activeTab !== 'ALL') && (
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => {
                              setSearchTerm('');
                              setActiveTab('ALL');
                              setCurrentPage(1);
                            }}
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedBids.map((row) => {
                    const rawStatus = String(row.status || 'PENDING').toUpperCase();
                    const statusClass =
                      rawStatus === 'ACCEPTED' || rawStatus === 'APPROVED'
                        ? 'status-active'
                        : rawStatus === 'REJECTED'
                        ? 'status-rejected'
                        : rawStatus.includes('COUNTER')
                        ? 'status-fulfilled'
                        : 'status-pending';

                    const bidder = row.bidderName || row.partyName || row.buyerName || '--';
                    const supply = row.supplyId || row.supplyNumber || '--';
                    const comm = row.commodityName || row.commodity || '--';
                    const rate = row.offerRate || row.bidRate || row.rate;
                    const qty = row.quantity || row.bidQuantity;
                    const counter = row.counterRate || row.latestCounterOffer;

                    return (
                      <tr
                        key={row.id || Math.random()}
                        className="party-table-row"
                        onDoubleClick={() => setSelectedBidModal(row)}
                      >
                        <td>
                          <button
                            type="button"
                            className="party-id-link"
                            onClick={() => setSelectedBidModal(row)}
                            title="View bid and negotiation details"
                          >
                            #{row.id || '--'}
                          </button>
                        </td>
                        <td>
                          <span className="mono-code">{supply}</span>
                        </td>
                        <td>
                          <span className="commodity-tag">{comm}</span>
                        </td>
                        <td>
                          <strong
                            className="party-name-clickable"
                            onClick={() => setSelectedBidModal(row)}
                          >
                            {bidder}
                          </strong>
                        </td>
                        <td className="text-right">
                          <span className="rate-bold">
                            {rate ? `₹${Number(rate).toLocaleString('en-IN')}` : '--'}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="qty-bold">
                            {qty !== undefined && qty !== null
                              ? Number(qty).toLocaleString('en-IN')
                              : '--'}{' '}
                            <small>{row.unit || 'Quintal'}</small>
                          </span>
                        </td>
                        <td>
                          {counter ? (
                            <span className="counter-tag">
                              ₹{Number(counter).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-muted">--</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>
                            {rawStatus === 'PENDING'
                              ? t.pending
                              : rawStatus === 'ACCEPTED'
                              ? t.accepted
                              : rawStatus === 'REJECTED'
                              ? t.rejected
                              : rawStatus}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedBidModal(row)}
                            title={t.viewDetails}
                          >
                            <EyeIcon size={12} />
                            <span>{t.viewDetails}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="party-table-footer">
            <span className="party-footer-info">
              {pagedBids.length > 0 &&
                t.pageText(currentPage, totalPages, sortedBids.length)}
              {sortedBids.length !== bids.length &&
                ` (${t.matchingCount(sortedBids.length)})`}
            </span>

            {/* Pagination Controls */}
            {sortedBids.length > 0 && (
              <div className="party-pagination-controls">
                <label className="party-pagesize-label">
                  <span>{t.pageSize}</span>
                  <select
                    className="party-pagesize-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  {t.prev}
                </button>
                <span className="party-page-current">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  {t.next}
                </button>
              </div>
            )}
          </div>

          {/* Hint */}
          <div className="party-table-hint">
            <small>{t.doubleClickHint}</small>
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedBidModal && (
        <BidDetailsModal
          bidId={selectedBidModal.id}
          initialData={selectedBidModal}
          lang={lang}
          onClose={() => setSelectedBidModal(null)}
        />
      )}
    </div>
  );
}
