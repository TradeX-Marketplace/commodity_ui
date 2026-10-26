import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, CloseIcon, RefreshIcon, EyeIcon } from '../common/Icons';
import { fetchBuyerDemands } from '../../services/api';
import DemandDetailsModal from './DemandDetailsModal';

const DEMAND_I18N = {
  en: {
    title: 'Buyer Demands & Procurement Requests',
    searchPlaceholder: 'Search by demand ID, buyer, commodity, location...',
    searchAriaLabel: 'Search buyer demands',
    clearSearch: 'Clear search',
    allCommodities: 'All Commodities',
    allLocations: 'All Locations',
    allStatuses: 'All Statuses',
    openOnly: 'Open Only',
    above4000: 'Target Rate > ₹4,000',
    expiringThisWeek: 'Expiring This Week',
    idCol: 'Demand ID',
    commodityCol: 'Commodity',
    buyerCol: 'Buyer / Organization',
    qtyCol: 'Requested Qty',
    rateCol: 'Target Rate',
    locationCol: 'Delivery Location',
    statusCol: 'Status',
    dateCol: 'Required By',
    actionCol: 'Action',
    viewDetails: 'View Details',
    noDemandsFound: 'No buyer demands found',
    matchingCount: (count) => `${count} matching demands`,
    activeDemandsBadge: (count) => `${count} Active Demands`,
    totalQtyBadge: (qty, unit) => `Total Requested: ${Number(qty).toLocaleString('en-IN')} ${unit || 'Quintal'}`,
    highestCommodityTitle: 'Highest Demanded Commodity',
    highestCommoditySubtitle: (comm, qty, unit, count) => `${comm} leads with ${Number(qty).toLocaleString('en-IN')} ${unit} requested across ${count} demand${count === 1 ? '' : 's'}`,
    tiedCommodities: (count) => `(${count} commodities tied at this demand quantity)`,
    loading: 'Loading buyer demand records...',
    apiError: 'Could not retrieve buyer demands from the marketplace backend. Please try again.',
    retry: 'Retry',
    pageText: (curr, total, count) => `Page ${curr} of ${total} (${count} total demands)`,
    prev: 'Previous',
    next: 'Next',
    pageSize: 'Per page:',
    doubleClickHint: 'Tip: Click any Demand ID, buyer name or View Details to examine full specifications.',
    open: 'Open',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
  },
  hi: {
    title: 'खरीदार मांग व खरीद अनुरोध',
    searchPlaceholder: 'मांग ID, खरीदार, कमोडिटी या स्थान से खोजें...',
    searchAriaLabel: 'मांग खोजें',
    clearSearch: 'खोज हटाएं',
    allCommodities: 'सभी कमोडिटी',
    allLocations: 'सभी स्थान',
    allStatuses: 'सभी स्थितियाँ',
    openOnly: 'केवल खुली मांगें',
    above4000: 'लक्षित दर > ₹4,000',
    expiringThisWeek: 'इस सप्ताह समाप्त',
    idCol: 'मांग ID',
    commodityCol: 'कमोडिटी',
    buyerCol: 'खरीदार / संस्था',
    qtyCol: 'मांगी गई मात्रा',
    rateCol: 'लक्षित दर',
    locationCol: 'डिलीवरी स्थान',
    statusCol: 'स्थिति',
    dateCol: 'आवश्यकता दिनांक',
    actionCol: 'कार्य',
    viewDetails: 'विवरण देखें',
    noDemandsFound: 'कोई खरीदार मांग नहीं मिली',
    matchingCount: (count) => `${count} मेल खाती मांगें`,
    activeDemandsBadge: (count) => `${count} सक्रिय मांगें`,
    totalQtyBadge: (qty, unit) => `कुल मांग: ${Number(qty).toLocaleString('en-IN')} ${unit || 'क्विंटल'}`,
    highestCommodityTitle: 'सर्वाधिक मांग वाली कमोडिटी',
    highestCommoditySubtitle: (comm, qty, unit, count) => `${comm} सबसे आगे है, ${count} मांगों में ${Number(qty).toLocaleString('en-IN')} ${unit} की मांग`,
    tiedCommodities: (count) => `(${count} कमोडिटी समान मांग मात्रा पर)`,
    loading: 'खरीदार मांग रिकॉर्ड लोड हो रहे हैं...',
    apiError: 'मार्केटप्लेस बैकएंड से मांग रिकॉर्ड प्राप्त नहीं किए जा सके। कृपया पुनः प्रयास करें।',
    retry: 'पुनः प्रयास करें',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (कुल ${count} मांगें)`,
    prev: 'पिछला',
    next: 'अगला',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'सुझाव: पूर्ण विवरण देखने के लिए किसी भी पंक्ति पर क्लिक करें।',
    open: 'सक्रिय (Open)',
    fulfilled: 'पूर्ण (Fulfilled)',
    cancelled: 'रद्द (Cancelled)',
  },
  mr: {
    title: 'खरेदीदार मागणी व खरेदी विनंत्या',
    searchPlaceholder: 'मागणी ID, खरेदीदार, शेतमाल किंवा ठिकाणानुसार शोधा...',
    searchAriaLabel: 'मागणी शोधा',
    clearSearch: 'शोध साफ करा',
    allCommodities: 'सर्व शेतमाल',
    allLocations: 'सर्व ठिकाणे',
    allStatuses: 'सर्व स्थिती',
    openOnly: 'फक्त सक्रिय मागण्या',
    above4000: 'अपेक्षित दर > ₹४,०००',
    expiringThisWeek: 'या आठवड्यात संपणारे',
    idCol: 'मागणी ID',
    commodityCol: 'शेतमाल',
    buyerCol: 'खरेदीदार / संस्था',
    qtyCol: 'मागितलेले प्रमाण',
    rateCol: 'अपेक्षित दर',
    locationCol: 'डिलिव्हरी ठिकाण',
    statusCol: 'स्थिती',
    dateCol: 'आवश्यक तारीख',
    actionCol: 'कृती',
    viewDetails: 'तपशील पहा',
    noDemandsFound: 'कोणतीही खरेदीदार मागणी आढळली नाही',
    matchingCount: (count) => `${count} जुळणाऱ्या मागण्या`,
    activeDemandsBadge: (count) => `${count} सक्रिय मागण्या`,
    totalQtyBadge: (qty, unit) => `एकूण मागणी: ${Number(qty).toLocaleString('en-IN')} ${unit || 'क्विंटल'}`,
    highestCommodityTitle: 'सर्वाधिक मागणी असलेला शेतमाल',
    highestCommoditySubtitle: (comm, qty, unit, count) => `${comm} आघाडीवर आहे: ${count} मागण्यांमध्ये ${Number(qty).toLocaleString('en-IN')} ${unit} मागणी`,
    tiedCommodities: (count) => `(${count} शेतमाल समान मागणी प्रमाणावर)`,
    loading: 'खरेदीदार मागणी नोंदी लोड होत आहेत...',
    apiError: 'मार्केटप्लेस बॅकएंडवरून मागण्या मिळवता आल्या नाहीत. कृपया पुन्हा प्रयत्न करा.',
    retry: 'पुन्हा प्रयत्न करा',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (एकूण ${count} मागण्या)`,
    prev: 'मागे',
    next: 'पुढे',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'टीप: संपूर्ण तपशील पाहण्यासाठी कोणत्याही ओळीवर क्लिक करा.',
    open: 'सक्रिय (Open)',
    fulfilled: 'पूर्ण (Fulfilled)',
    cancelled: 'रद्द (Cancelled)',
  },
};

export default function DemandExplorer({ message, lang = 'en', onSendMessage }) {
  const t = DEMAND_I18N[lang] || DEMAND_I18N.en;

  // Local state
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyAbove4000, setOnlyAbove4000] = useState(false);
  const [onlyExpiringThisWeek, setOnlyExpiringThisWeek] = useState(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Details Modal
  const [selectedDemandModal, setSelectedDemandModal] = useState(null);

  // Initialize from message props if available
  useEffect(() => {
    if (Array.isArray(message?.buyerDemands) && message.buyerDemands.length > 0) {
      setDemands(message.buyerDemands);
      setLoading(false);
      return;
    }

    loadDemands();
  }, [message]);

  const loadDemands = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBuyerDemands({ useUpstreamDirect: true });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setDemands(list);
    } catch (err) {
      console.warn('Failed to fetch buyer demands directly:', err);
      setError(err);
      setDemands([]);
    } finally {
      setLoading(false);
    }
  };

  // Pre-seed filters based on question context if present
  useEffect(() => {
    const q = (message?.userQuestion || '').toLowerCase();
    if (q.includes('soybean') || q.includes('सोयाबीन')) {
      setSelectedCommodity('Soybean');
    } else if (q.includes('wheat') || q.includes('गेहूं') || q.includes('गहू')) {
      setSelectedCommodity('Wheat');
    } else if (q.includes('chana') || q.includes('चना') || q.includes('हरभरा')) {
      setSelectedCommodity('Chana');
    }

    if (q.includes('above 4000') || q.includes('above 4,000') || q.includes('4000')) {
      setOnlyAbove4000(true);
    }
    if (q.includes('expiring this week') || q.includes('this week')) {
      setOnlyExpiringThisWeek(true);
    }
    if (q.includes('open') || q.includes('active')) {
      setOnlyOpen(true);
    }
  }, [message?.userQuestion]);

  // Distinct commodities & locations for dropdowns
  const availableCommodities = useMemo(() => {
    const set = new Set();
    demands.forEach((d) => {
      const name = d.commodityName || d.commodity;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [demands]);

  const availableLocations = useMemo(() => {
    const set = new Set();
    demands.forEach((d) => {
      const loc = d.location || d.deliveryLocation;
      if (loc) set.add(loc);
    });
    return Array.from(set).sort();
  }, [demands]);

  // Is a date within this week (today to today + 7 days)?
  const isDateThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return target >= now && target <= endOfWeek;
  };

  // Filtered dataset
  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      // Commodity filter
      if (selectedCommodity !== 'ALL') {
        const comm = (d.commodityName || d.commodity || '').toLowerCase();
        if (!comm.includes(selectedCommodity.toLowerCase())) return false;
      }

      // Location filter
      if (selectedLocation !== 'ALL') {
        const loc = (d.location || d.deliveryLocation || '').toLowerCase();
        if (!loc.includes(selectedLocation.toLowerCase())) return false;
      }

      // Status filter
      const rawStatus = (d.status || 'OPEN').toUpperCase();
      if (onlyOpen && rawStatus !== 'OPEN' && rawStatus !== 'ACTIVE') {
        return false;
      }
      if (selectedStatus !== 'ALL' && rawStatus !== selectedStatus) {
        return false;
      }

      // Price filter: Target Rate > 4000
      if (onlyAbove4000) {
        const rate = Number(d.targetRate || d.price || d.rate || 0);
        if (rate <= 4000) return false;
      }

      // Expiry filter: Expiring this week
      if (onlyExpiringThisWeek) {
        const dateVal = d.requiredDate || d.date || d.expectedDate;
        if (!isDateThisWeek(dateVal)) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const idMatch = String(d.id || '').toLowerCase().includes(term);
        const buyerMatch = String(d.buyerName || d.buyer || '').toLowerCase().includes(term);
        const commMatch = String(d.commodityName || d.commodity || '').toLowerCase().includes(term);
        const locMatch = String(d.location || d.deliveryLocation || '').toLowerCase().includes(term);
        const statusMatch = rawStatus.toLowerCase().includes(term);
        if (!idMatch && !buyerMatch && !commMatch && !locMatch && !statusMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    demands,
    selectedCommodity,
    selectedLocation,
    selectedStatus,
    onlyOpen,
    onlyAbove4000,
    onlyExpiringThisWeek,
    searchTerm,
  ]);

  // Sorted dataset
  const sortedDemands = useMemo(() => {
    const list = [...filteredDemands];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'id') {
        aVal = Number(a.id) || a.id || 0;
        bVal = Number(b.id) || b.id || 0;
      } else if (sortField === 'quantity') {
        aVal = Number(a.quantity || a.requestedQuantity || 0);
        bVal = Number(b.quantity || b.requestedQuantity || 0);
      } else if (sortField === 'targetRate') {
        aVal = Number(a.targetRate || a.price || a.rate || 0);
        bVal = Number(b.targetRate || b.price || b.rate || 0);
      } else if (sortField === 'buyer') {
        aVal = String(a.buyerName || a.buyer || '').toLowerCase();
        bVal = String(b.buyerName || b.buyer || '').toLowerCase();
      } else if (sortField === 'commodity') {
        aVal = String(a.commodityName || a.commodity || '').toLowerCase();
        bVal = String(b.commodityName || b.commodity || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredDemands, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(sortedDemands.length / pageSize) || 1;
  const pagedDemands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedDemands.slice(start, start + pageSize);
  }, [sortedDemands, currentPage, pageSize]);

  // KPI 1: Active Demands count
  const activeDemandsCount = useMemo(() => {
    return demands.filter((d) => {
      const s = (d.status || 'OPEN').toUpperCase();
      return s === 'OPEN' || s === 'ACTIVE';
    }).length;
  }, [demands]);

  // KPI 2: Total requested quantity across active demands
  const totalQuantitySummary = useMemo(() => {
    let sum = 0;
    let unit = 'Quintal';
    demands.forEach((d) => {
      const s = (d.status || 'OPEN').toUpperCase();
      if (s === 'OPEN' || s === 'ACTIVE') {
        const q = Number(d.quantity || d.requestedQuantity || 0);
        if (!isNaN(q) && q > 0) {
          sum += q;
          if (d.unit) unit = d.unit;
        }
      }
    });
    return { sum, unit };
  }, [demands]);

  // KPI 3: Highest Demanded Commodity (with tie detection)
  const highestDemandedCommodityInfo = useMemo(() => {
    if (!demands || demands.length === 0) return null;
    const totals = {};
    const counts = {};
    const units = {};

    demands.forEach((d) => {
      const s = (d.status || 'OPEN').toUpperCase();
      if (s === 'OPEN' || s === 'ACTIVE') {
        const comm = d.commodityName || d.commodity || 'Unknown';
        const q = Number(d.quantity || d.requestedQuantity || 0);
        totals[comm] = (totals[comm] || 0) + (isNaN(q) ? 0 : q);
        counts[comm] = (counts[comm] || 0) + 1;
        if (d.unit) units[comm] = d.unit;
      }
    });

    let maxComm = null;
    let maxQty = -1;
    Object.entries(totals).forEach(([comm, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        maxComm = comm;
      }
    });

    if (!maxComm || maxQty <= 0) return null;

    const tiedComms = Object.entries(totals).filter(
      ([comm, qty]) => qty === maxQty && comm !== maxComm
    );

    return {
      commodity: maxComm,
      quantity: maxQty,
      unit: units[maxComm] || 'Quintal',
      count: counts[maxComm] || 1,
      tiedCount: tiedComms.length,
    };
  }, [demands]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCommodity('ALL');
    setSelectedLocation('ALL');
    setSelectedStatus('ALL');
    setOnlyOpen(false);
    setOnlyAbove4000(false);
    setOnlyExpiringThisWeek(false);
    setCurrentPage(1);
  };

  return (
    <div className="party-explorer-container demand-explorer-container">
      {/* Top Banner / Header */}
      <div className="party-explorer-header">
        <div className="party-explorer-title-group">
          <span className="party-explorer-eyebrow">TradeX &bull; PROCUREMENT</span>
          <h4 className="party-explorer-title">{t.title}</h4>
        </div>
        <div className="party-explorer-actions">
          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={loadDemands}
            title={t.retry}
          >
            <RefreshIcon size={13} />
            <span>{t.retry}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="party-explorer-kpi-row">
        {/* KPI 1: Active Demands */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">{t.activeDemandsBadge(activeDemandsCount)}</span>
          <span className="party-kpi-value">{activeDemandsCount}</span>
          <span className="party-kpi-sub">Verified procurement requirements</span>
        </div>

        {/* KPI 2: Total Quantity */}
        <div className="party-explorer-kpi-card">
          <span className="party-kpi-label">Total Requested Quantity</span>
          <span className="party-kpi-value">
            {Number(totalQuantitySummary.sum).toLocaleString('en-IN')}{' '}
            <small style={{ fontSize: '0.65em', color: '#64748b' }}>
              {totalQuantitySummary.unit}
            </small>
          </span>
          <span className="party-kpi-sub">Cumulative active buyer demand</span>
        </div>

        {/* KPI 3: Highest Demand Commodity Highlight */}
        {highestDemandedCommodityInfo && (
          <div className="party-explorer-kpi-card highlight-kpi">
            <span className="party-kpi-label">{t.highestCommodityTitle}</span>
            <span className="party-kpi-value highlighted-name">
              {highestDemandedCommodityInfo.commodity}
            </span>
            <span className="party-kpi-sub">
              {t.highestCommoditySubtitle(
                highestDemandedCommodityInfo.commodity,
                highestDemandedCommodityInfo.quantity,
                highestDemandedCommodityInfo.unit,
                highestDemandedCommodityInfo.count
              )}
              {highestDemandedCommodityInfo.tiedCount > 0 && (
                <span className="tied-pill">
                  {' '}
                  {t.tiedCommodities(highestDemandedCommodityInfo.tiedCount)}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="party-explorer-toolbar">
        {/* Search Input */}
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

        {/* Dropdown Filters */}
        <div className="party-filter-group">
          {/* Commodity Dropdown */}
          <select
            className="party-select-filter"
            value={selectedCommodity}
            onChange={(e) => {
              setSelectedCommodity(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by commodity"
          >
            <option value="ALL">{t.allCommodities}</option>
            {availableCommodities.map((comm) => (
              <option key={comm} value={comm}>
                {comm}
              </option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            className="party-select-filter"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by location"
          >
            <option value="ALL">{t.allLocations}</option>
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Quick Filter: Open Only */}
          <button
            type="button"
            className={`party-chip-btn ${onlyOpen ? 'active' : ''}`}
            onClick={() => {
              setOnlyOpen((prev) => !prev);
              setCurrentPage(1);
            }}
          >
            {t.openOnly}
          </button>

          {/* Quick Filter: Price > 4000 */}
          <button
            type="button"
            className={`party-chip-btn ${onlyAbove4000 ? 'active' : ''}`}
            onClick={() => {
              setOnlyAbove4000((prev) => !prev);
              setCurrentPage(1);
            }}
          >
            {t.above4000}
          </button>

          {/* Quick Filter: Expiring this week */}
          <button
            type="button"
            className={`party-chip-btn ${onlyExpiringThisWeek ? 'active' : ''}`}
            onClick={() => {
              setOnlyExpiringThisWeek((prev) => !prev);
              setCurrentPage(1);
            }}
          >
            {t.expiringThisWeek}
          </button>

          {/* Reset Filters button if active */}
          {(searchTerm ||
            selectedCommodity !== 'ALL' ||
            selectedLocation !== 'ALL' ||
            onlyOpen ||
            onlyAbove4000 ||
            onlyExpiringThisWeek) && (
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={clearAllFilters}
            >
              Reset
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
            onClick={loadDemands}
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Demands Table */}
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
                  <th
                    onClick={() => handleSort('commodity')}
                    className="sortable"
                    aria-sort={
                      sortField === 'commodity'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.commodityCol}{' '}
                    {sortField === 'commodity' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
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
                    onClick={() => handleSort('targetRate')}
                    className="sortable text-right"
                    aria-sort={
                      sortField === 'targetRate'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {t.rateCol}{' '}
                    {sortField === 'targetRate' &&
                      (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>{t.locationCol}</th>
                  <th>{t.dateCol}</th>
                  <th>{t.statusCol}</th>
                  <th className="text-center">{t.actionCol}</th>
                </tr>
              </thead>
              <tbody>
                {pagedDemands.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="party-empty-cell">
                      <div className="party-empty-state">
                        <span className="party-empty-icon">📋</span>
                        <p className="party-empty-title">{t.noDemandsFound}</p>
                        <p className="party-empty-desc">
                          {searchTerm
                            ? `0 matching demands found for "${searchTerm}".`
                            : 'No demands matching the selected criteria.'}
                        </p>
                        {(searchTerm ||
                          selectedCommodity !== 'ALL' ||
                          selectedLocation !== 'ALL' ||
                          onlyOpen ||
                          onlyAbove4000 ||
                          onlyExpiringThisWeek) && (
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={clearAllFilters}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedDemands.map((row) => {
                    const rawStatus = (row.status || 'OPEN').toUpperCase();
                    const statusClass =
                      rawStatus === 'OPEN' || rawStatus === 'ACTIVE'
                        ? 'status-active'
                        : rawStatus === 'FULFILLED'
                        ? 'status-fulfilled'
                        : 'status-rejected';

                    const commName = row.commodityName || row.commodity || '--';
                    const buyer = row.buyerName || row.buyer || '--';
                    const loc = row.location || row.deliveryLocation || '--';
                    const dateVal = row.requiredDate || row.date || row.expectedDate || '--';
                    const qty = row.quantity || row.requestedQuantity;
                    const rate = row.targetRate || row.price || row.rate;

                    return (
                      <tr
                        key={row.id || Math.random()}
                        className="party-table-row"
                        onDoubleClick={() => setSelectedDemandModal(row)}
                      >
                        <td>
                          <button
                            type="button"
                            className="party-id-link"
                            onClick={() => setSelectedDemandModal(row)}
                            title="View procurement details"
                          >
                            #{row.id || '--'}
                          </button>
                        </td>
                        <td>
                          <span className="commodity-tag">{commName}</span>
                        </td>
                        <td>
                          <strong
                            className="party-name-clickable"
                            onClick={() => setSelectedDemandModal(row)}
                          >
                            {buyer}
                          </strong>
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
                        <td>{loc}</td>
                        <td>
                          <span className={isDateThisWeek(dateVal) ? 'expiring-soon' : ''}>
                            {dateVal}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>
                            {rawStatus === 'OPEN' ? t.open : rawStatus === 'FULFILLED' ? t.fulfilled : rawStatus}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedDemandModal(row)}
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
              {pagedDemands.length > 0 &&
                t.pageText(currentPage, totalPages, sortedDemands.length)}
              {sortedDemands.length !== demands.length &&
                ` (${t.matchingCount(sortedDemands.length)})`}
            </span>

            {/* Pagination Controls */}
            {sortedDemands.length > 0 && (
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

          {/* Double Click Hint */}
          <div className="party-table-hint">
            <small>{t.doubleClickHint}</small>
          </div>
        </>
      )}

      {/* Details Modal */}
      {selectedDemandModal && (
        <DemandDetailsModal
          demandId={selectedDemandModal.id}
          initialData={selectedDemandModal}
          lang={lang}
          onClose={() => setSelectedDemandModal(null)}
        />
      )}
    </div>
  );
}
