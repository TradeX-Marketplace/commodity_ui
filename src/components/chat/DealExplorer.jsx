import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, CloseIcon, RefreshIcon, EyeIcon } from '../common/Icons';
import { fetchDeals } from '../../services/api';
import DealDetailsModal from './DealDetailsModal';

const DEAL_I18N = {
  en: {
    title: 'Deals & Contracts Explorer',
    searchPlaceholder: 'Search by deal ID, contract ID, buyer, seller, commodity...',
    searchAriaLabel: 'Search deals and contracts',
    clearSearch: 'Clear search',
    tabs: {
      all: 'All Deals',
      pending: 'Pending Deals',
      approved: 'Approved Deals',
      rejected: 'Rejected Deals',
      contractsAwaiting: 'Awaiting Signatures',
      completed: 'Completed Contracts',
    },
    idCol: 'Deal ID',
    refCol: 'Reference ID',
    commodityCol: 'Commodity',
    buyerCol: 'Buyer',
    sellerCol: 'Seller',
    qtyCol: 'Quantity',
    rateCol: 'Agreed Rate',
    valueCol: 'Deal Value',
    statusCol: 'Status',
    contractCol: 'Contract',
    actionCol: 'Action',
    viewDetails: 'View Details',
    noDealsFound: 'No deals or contracts found',
    matchingCount: (count) => `${count} matching deals`,
    totalDealsBadge: (count) => `${count} Total Deals`,
    contractsBadge: (count) => `${count} Contracts Generated`,
    completedBadge: (count) => `${count} Completed Deals`,
    loading: 'Loading deals and contracts records...',
    apiError: 'Could not retrieve deals from marketplace backend. Please try again.',
    retry: 'Retry',
    pageText: (curr, total, count) => `Page ${curr} of ${total} (${count} total deals)`,
    prev: 'Previous',
    next: 'Next',
    pageSize: 'Per page:',
    doubleClickHint: 'Tip: Click any Deal ID, buyer/seller name or View Details to examine contract terms.',
    authNote: 'Note: Deal execution in TradeX is role-governed. Only authenticated trading participants or administrator-approved records are visible.',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
  },
  hi: {
    title: 'सौदा व अनुबंध एक्सप्लोरर',
    searchPlaceholder: 'सौदा ID, अनुबंध ID, खरीदार, विक्रेता से खोजें...',
    searchAriaLabel: 'सौदा खोजें',
    clearSearch: 'खोज हटाएं',
    tabs: {
      all: 'सभी सौदे',
      pending: 'लंबित सौदे',
      approved: 'स्वीकृत सौदे',
      rejected: 'अस्वीकृत सौदे',
      contractsAwaiting: 'हस्ताक्षर प्रतीक्षित',
      completed: 'पूर्ण अनुबंध',
    },
    idCol: 'सौदा ID',
    refCol: 'संदर्भ ID',
    commodityCol: 'कमोडिटी',
    buyerCol: 'खरीदार',
    sellerCol: 'विक्रेता',
    qtyCol: 'मात्रा',
    rateCol: 'सहमति दर',
    valueCol: 'सौदा मूल्य',
    statusCol: 'स्थिति',
    contractCol: 'अनुबंध',
    actionCol: 'कार्य',
    viewDetails: 'विवरण देखें',
    noDealsFound: 'कोई सौदा या अनुबंध नहीं मिला',
    matchingCount: (count) => `${count} मेल खाते सौदे`,
    totalDealsBadge: (count) => `${count} कुल सौदे`,
    contractsBadge: (count) => `${count} अनुबंध जनरेट`,
    completedBadge: (count) => `${count} पूर्ण सौदे`,
    loading: 'सौदा व अनुबंध रिकॉर्ड लोड हो रहे हैं...',
    apiError: 'मार्केटप्लेस बैकएंड से सौदे प्राप्त नहीं किए जा सके।',
    retry: 'पुनः प्रयास करें',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (कुल ${count} सौदे)`,
    prev: 'पिछला',
    next: 'अगला',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'सुझाव: अनुबंध शर्तें देखने के लिए पंक्ति पर क्लिक करें।',
    authNote: 'नोट: TradeX में सौदा निष्पादन भूमिका-आधारित है। केवल अधिकृत व्यापार रिकॉर्ड ही दृश्यमान हैं।',
    pending: 'लंबित (Pending)',
    approved: 'स्वीकृत (Approved)',
    rejected: 'अस्वीकृत (Rejected)',
    completed: 'पूर्ण (Completed)',
  },
  mr: {
    title: 'करार व व्यवहार एक्सप्लोरर',
    searchPlaceholder: 'व्यवहार ID, करार ID, खरेदीदार, विक्रेत्यानुसार शोधा...',
    searchAriaLabel: 'व्यवहार शोधा',
    clearSearch: 'शोध साफ करा',
    tabs: {
      all: 'सर्व व्यवहार',
      pending: 'प्रलंबित व्यवहार',
      approved: 'मान्य झालेले',
      rejected: 'नाकारलेले',
      contractsAwaiting: 'स्वाक्षरीची प्रतीक्षा',
      completed: 'पूर्ण झालेले करार',
    },
    idCol: 'व्यवहार ID',
    refCol: 'संदर्भ ID',
    commodityCol: 'शेतमाल',
    buyerCol: 'खरेदीदार',
    sellerCol: 'विक्रेता',
    qtyCol: 'प्रमाण',
    rateCol: 'मान्य दर',
    valueCol: 'एकूण रक्कम',
    statusCol: 'स्थिती',
    contractCol: 'करार',
    actionCol: 'कृती',
    viewDetails: 'तपशील पहा',
    noDealsFound: 'कोणताही व्यवहार किंवा करार आढळला नाही',
    matchingCount: (count) => `${count} जुळणारे व्यवहार`,
    totalDealsBadge: (count) => `${count} एकूण व्यवहार`,
    contractsBadge: (count) => `${count} तयार झालेले करार`,
    completedBadge: (count) => `${count} पूर्ण व्यवहार`,
    loading: 'व्यवहार व करार नोंदी लोड होत आहेत...',
    apiError: 'मार्केटप्लेस बॅकएंडवरून नोंदी मिळवता आल्या नाहीत.',
    retry: 'पुन्हा प्रयत्न करा',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (एकूण ${count} व्यवहार)`,
    prev: 'मागे',
    next: 'पुढे',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'टीप: कराराच्या अटी पाहण्यासाठी ओळीवर क्लिक करा.',
    authNote: 'टीप: TradeX मध्ये व्यवहार पूर्तता अधिकार-आधारित असते.',
    pending: 'प्रलंबित (Pending)',
    approved: 'मान्य (Approved)',
    rejected: 'नाकारलेला (Rejected)',
    completed: 'पूर्ण (Completed)',
  },
};

export default function DealExplorer({ message, lang = 'en' }) {
  const t = DEAL_I18N[lang] || DEAL_I18N.en;

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab filter: 'ALL', 'PENDING', 'APPROVED', 'REJECTED', 'AWAITING_SIG', 'COMPLETED'
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal
  const [selectedDealModal, setSelectedDealModal] = useState(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try fetching buyer role deals, and fallback gracefully
      const data = await fetchDeals({ role: 'BUYER', useUpstreamDirect: true });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setDeals(list);
    } catch (err) {
      console.warn('Failed to load deals from backend:', err);
      setError(err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Pre-seed active tab based on question
  useEffect(() => {
    const q = (message?.userQuestion || '').toLowerCase();
    if (q.includes('pending')) {
      setActiveTab('PENDING');
    } else if (q.includes('approved')) {
      setActiveTab('APPROVED');
    } else if (q.includes('rejected')) {
      setActiveTab('REJECTED');
    } else if (q.includes('signature') || q.includes('awaiting')) {
      setActiveTab('AWAITING_SIG');
    } else if (q.includes('completed')) {
      setActiveTab('COMPLETED');
    }
  }, [message?.userQuestion]);

  // Tab-filtered & search-filtered dataset
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      const rawStatus = String(d.status || 'PENDING').toUpperCase();
      const contractId = d.contractId || (d.contract ? d.contract.id : null);
      const isSigned = d.buyerSigned && d.sellerSigned;

      // Tab filtering
      if (activeTab === 'PENDING') {
        if (rawStatus !== 'PENDING') return false;
      } else if (activeTab === 'APPROVED') {
        if (rawStatus !== 'APPROVED' && rawStatus !== 'COMPLETED') return false;
      } else if (activeTab === 'REJECTED') {
        if (rawStatus !== 'REJECTED') return false;
      } else if (activeTab === 'AWAITING_SIG') {
        if (!contractId || isSigned) return false;
      } else if (activeTab === 'COMPLETED') {
        if (rawStatus !== 'COMPLETED' && !isSigned) return false;
      }

      // Search filtering
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const idMatch = String(d.id || '').toLowerCase().includes(term);
        const contractMatch = String(contractId || '').toLowerCase().includes(term);
        const buyerMatch = String(d.buyerName || d.buyer || '').toLowerCase().includes(term);
        const sellerMatch = String(d.sellerName || d.seller || '').toLowerCase().includes(term);
        const commMatch = String(d.commodityName || d.commodity || '').toLowerCase().includes(term);
        const statusMatch = rawStatus.toLowerCase().includes(term);
        if (!idMatch && !contractMatch && !buyerMatch && !sellerMatch && !commMatch && !statusMatch) {
          return false;
        }
      }

      return true;
    });
  }, [deals, activeTab, searchTerm]);

  // Sorting
  const sortedDeals = useMemo(() => {
    const list = [...filteredDeals];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'id') {
        aVal = Number(a.id) || a.id || 0;
        bVal = Number(b.id) || b.id || 0;
      } else if (sortField === 'rate') {
        aVal = Number(a.rate || a.agreedRate || a.price || 0);
        bVal = Number(b.rate || b.agreedRate || b.price || 0);
      } else if (sortField === 'quantity') {
        aVal = Number(a.quantity || a.dealQuantity || 0);
        bVal = Number(b.quantity || b.dealQuantity || 0);
      } else if (sortField === 'buyer') {
        aVal = String(a.buyerName || a.buyer || '').toLowerCase();
        bVal = String(b.buyerName || b.buyer || '').toLowerCase();
      } else if (sortField === 'seller') {
        aVal = String(a.sellerName || a.seller || '').toLowerCase();
        bVal = String(b.sellerName || b.seller || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredDeals, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedDeals.length / pageSize) || 1;
  const pagedDeals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDeals.slice(start, start + pageSize);
  }, [sortedDeals, currentPage, pageSize]);

  // KPI 1: Total Deals
  const totalDealsCount = deals.length;

  // KPI 2: Contracts Generated
  const contractsGeneratedCount = useMemo(() => {
    return deals.filter((d) => d.contractId || d.contract).length;
  }, [deals]);

  // KPI 3: Completed / Approved Deals
  const completedDealsCount = useMemo(() => {
    return deals.filter((d) => {
      const s = String(d.status || '').toUpperCase();
      return s === 'COMPLETED' || s === 'APPROVED';
    }).length;
  }, [deals]);

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
    <div className="party-explorer-container deal-explorer-container">
      {/* Top Banner */}
      <div className="party-explorer-header">
        <div className="party-explorer-title-group">
          <span className="party-explorer-eyebrow">TradeX &bull; CONTRACTS &amp; SETTLEMENT</span>
          <h4 className="party-explorer-title">{t.title}</h4>
        </div>
        <div className="party-explorer-actions">
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={loadDeals}
            title={t.retry}
          >
            <RefreshIcon size={13} />
            <span>{t.retry}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="party-explorer-kpi-row">
        {/* KPI 1: Total Deals */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">{t.totalDealsBadge(totalDealsCount)}</span>
          <span className="party-kpi-value">{totalDealsCount}</span>
          <span className="party-kpi-sub">Commercial trades established</span>
        </div>

        {/* KPI 2: Contracts Generated */}
        <div className="party-explorer-kpi-card highlight-kpi">
          <span className="party-kpi-label">{t.contractsBadge(contractsGeneratedCount)}</span>
          <span className="party-kpi-value highlighted-name">{contractsGeneratedCount}</span>
          <span className="party-kpi-sub">Legal contracts generated and executed</span>
        </div>

        {/* KPI 3: Completed Deals */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">{t.completedBadge(completedDealsCount)}</span>
          <span className="party-kpi-value">{completedDealsCount}</span>
          <span className="party-kpi-sub">Approved and settled agreements</span>
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
          aria-selected={activeTab === 'APPROVED'}
          className={`party-tab-chip ${activeTab === 'APPROVED' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('APPROVED');
            setCurrentPage(1);
          }}
        >
          {t.tabs.approved}
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
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'AWAITING_SIG'}
          className={`party-tab-chip ${activeTab === 'AWAITING_SIG' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('AWAITING_SIG');
            setCurrentPage(1);
          }}
        >
          {t.tabs.contractsAwaiting}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'COMPLETED'}
          className={`party-tab-chip ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('COMPLETED');
            setCurrentPage(1);
          }}
        >
          {t.tabs.completed}
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
            onClick={loadDeals}
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Deals Table */}
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
                  <th>{t.commodityCol}</th>
                  <th
                    onClick={() => handleSort('buyer')}
                    className="sortable"
                    aria-sort={
                      sortField === 'buyer'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.buyerCol}{' '}
                    {sortField === 'buyer' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    onClick={() => handleSort('seller')}
                    className="sortable"
                    aria-sort={
                      sortField === 'seller'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.sellerCol}{' '}
                    {sortField === 'seller' &&
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
                  <th
                    onClick={() => handleSort('rate')}
                    className="sortable text-right"
                    aria-sort={
                      sortField === 'rate'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.rateCol}{' '}
                    {sortField === 'rate' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>{t.contractCol}</th>
                  <th>{t.statusCol}</th>
                  <th className="text-center">{t.actionCol}</th>
                </tr>
              </thead>
              <tbody>
                {pagedDeals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="party-empty-cell">
                      <div className="party-empty-state">
                        <span className="party-empty-icon">📜</span>
                        <p className="party-empty-title">{t.noDealsFound}</p>
                        <p className="party-empty-desc">
                          {searchTerm
                            ? `0 matching deals found for "${searchTerm}".`
                            : 'No deals recorded in this view.'}
                        </p>
                        <p className="party-empty-sub" style={{ fontSize: '0.82em', color: '#64748b', marginTop: '6px' }}>
                          {t.authNote}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedDeals.map((row) => {
                    const rawStatus = String(row.status || 'PENDING').toUpperCase();
                    const statusClass =
                      rawStatus === 'APPROVED' || rawStatus === 'COMPLETED'
                        ? 'status-active'
                        : rawStatus === 'REJECTED'
                        ? 'status-rejected'
                        : 'status-pending';

                    const buyer = row.buyerName || row.buyer || '--';
                    const seller = row.sellerName || row.seller || '--';
                    const comm = row.commodityName || row.commodity || '--';
                    const rate = row.rate || row.agreedRate || row.price;
                    const qty = row.quantity || row.dealQuantity;
                    const contractId = row.contractId || (row.contract ? row.contract.id : null);

                    return (
                      <tr
                        key={row.id || Math.random()}
                        className="party-table-row"
                        onDoubleClick={() => setSelectedDealModal(row)}
                      >
                        <td>
                          <button
                            type="button"
                            className="party-id-link"
                            onClick={() => setSelectedDealModal(row)}
                            title="View deal and contract terms"
                          >
                            #{row.id || '--'}
                          </button>
                        </td>
                        <td>
                          <span className="commodity-tag">{comm}</span>
                        </td>
                        <td>
                          <strong
                            className="party-name-clickable"
                            onClick={() => setSelectedDealModal(row)}
                          >
                            {buyer}
                          </strong>
                        </td>
                        <td>
                          <span
                            className="party-name-clickable"
                            onClick={() => setSelectedDealModal(row)}
                          >
                            {seller}
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
                        <td className="text-right">
                          <span className="rate-bold">
                            {rate ? `₹${Number(rate).toLocaleString('en-IN')}` : '--'}
                          </span>
                        </td>
                        <td>
                          {contractId ? (
                            <span className="counter-tag">CTR-#{contractId}</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>
                            {rawStatus === 'PENDING'
                              ? t.pending
                              : rawStatus === 'APPROVED'
                              ? t.approved
                              : rawStatus === 'REJECTED'
                              ? t.rejected
                              : rawStatus}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedDealModal(row)}
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
              {pagedDeals.length > 0 &&
                t.pageText(currentPage, totalPages, sortedDeals.length)}
              {sortedDeals.length !== deals.length &&
                ` (${t.matchingCount(sortedDeals.length)})`}
            </span>

            {/* Pagination Controls */}
            {sortedDeals.length > 0 && (
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

          {/* Hint & Transparency Note */}
          <div className="party-table-hint">
            <small>{t.doubleClickHint}</small>
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedDealModal && (
        <DealDetailsModal
          dealId={selectedDealModal.id}
          initialData={selectedDealModal}
          lang={lang}
          onClose={() => setSelectedDealModal(null)}
        />
      )}
    </div>
  );
}
