import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchIcon, CloseIcon, RefreshIcon } from '../common/Icons';
import { fetchSupplies } from '../../services/api';
import SupplyDetailsModal from './SupplyDetailsModal';

const SUPPLY_I18N = {
  en: {
    title: 'Commodity Supplies & Inventory',
    searchPlaceholder: 'Search by supply ID, commodity, seller, location...',
    searchAriaLabel: 'Search commodity supplies',
    clearSearch: 'Clear search',
    allCommodities: 'All Commodities',
    allLocations: 'All Locations',
    allStatuses: 'All Statuses',
    activeOnly: 'Active Only',
    below4500: 'Price < ₹4,500',
    idCol: 'Supply ID',
    commodityCol: 'Commodity',
    sellerCol: 'Seller / Trader',
    qtyCol: 'Available Qty',
    rateCol: 'Rate',
    locationCol: 'Location',
    statusCol: 'Status',
    expiryCol: 'Valid Till',
    supplyDetails: 'Supply Details',
    noSuppliesFound: 'No supplies found',
    matchingCount: (count) => `${count} matching supplies`,
    activeSuppliesBadge: (count) => `${count} Active Supplies`,
    totalQtyBadge: (qty, unit) => `Total Available: ${Number(qty).toLocaleString('en-IN')} ${unit || 'Quintal'}`,
    highestSellerTitle: 'Highest Available Quantity',
    highestSellerSubtitle: (seller, qty, unit, comm) => `${seller} holds ${Number(qty).toLocaleString('en-IN')} ${unit} of ${comm}`,
    tiedSellers: (count) => `(${count} sellers tied at this quantity)`,
    loading: 'Loading supplies and inventory records...',
    apiError: 'Could not retrieve supplies from the marketplace backend. Please try again.',
    retry: 'Retry',
    pageText: (curr, total, count) => `Page ${curr} of ${total} (${count} total supplies)`,
    prev: 'Previous',
    next: 'Next',
    pageSize: 'Per page:',
    doubleClickHint: 'Double-click a row to view details',
    active: 'Active',
    expired: 'Expired',
  },
  hi: {
    title: 'कमोडिटी आपूर्ति व स्टॉक एक्सप्लोरर',
    searchPlaceholder: 'आपूर्ति ID, कमोडिटी, विक्रेता या स्थान से खोजें...',
    searchAriaLabel: 'आपूर्ति खोजें',
    clearSearch: 'खोज हटाएं',
    allCommodities: 'सभी कमोडिटी',
    allLocations: 'सभी स्थान',
    allStatuses: 'सभी स्थितियाँ',
    activeOnly: 'केवल सक्रिय',
    below4500: 'दर < ₹4,500',
    idCol: 'आपूर्ति ID',
    commodityCol: 'वस्तु',
    sellerCol: 'विक्रेता',
    qtyCol: 'उपलब्ध मात्रा',
    rateCol: 'दर',
    locationCol: 'स्थान',
    statusCol: 'स्थिति',
    expiryCol: 'वैधता की तारीख',
    supplyDetails: 'आपूर्ति का विवरण',
    noSuppliesFound: 'कोई आपूर्ति नहीं मिली',
    matchingCount: (count) => `${count} मेल खाती आपूर्ति`,
    activeSuppliesBadge: (count) => `${count} सक्रिय आपूर्ति`,
    totalQtyBadge: (qty, unit) => `कुल उपलब्ध: ${Number(qty).toLocaleString('en-IN')} ${unit || 'क्विंटल'}`,
    highestSellerTitle: 'सर्वाधिक उपलब्ध मात्रा',
    highestSellerSubtitle: (seller, qty, unit, comm) => `${seller} के पास ${comm} की ${Number(qty).toLocaleString('en-IN')} ${unit} उपलब्ध है`,
    tiedSellers: (count) => `(${count} विक्रेता समान मात्रा पर)`,
    loading: 'आपूर्ति व स्टॉक रिकॉर्ड लोड हो रहे हैं...',
    apiError: 'मार्केटप्लेस बैकएंड से आपूर्ति प्राप्त नहीं की जा सकी। कृपया पुनः प्रयास करें।',
    retry: 'पुनः प्रयास करें',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (कुल ${count} आपूर्ति)`,
    prev: 'पिछला',
    next: 'अगला',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'विवरण देखने के लिए पंक्ति पर डबल-क्लिक करें',
    active: 'सक्रिय (Active)',
    expired: 'समाप्त (Expired)',
  },
  mr: {
    title: 'शेतमाल पुरवठा व साठा एक्सप्लोरर',
    searchPlaceholder: 'पुरवठा ID, शेतमाल, विक्रेता किंवा ठिकाणानुसार शोधा...',
    searchAriaLabel: 'पुरवठा शोधा',
    clearSearch: 'शोध साफ करा',
    allCommodities: 'सर्व शेतमाल',
    allLocations: 'सर्व ठिकाणे',
    allStatuses: 'सर्व स्थिती',
    activeOnly: 'फक्त सक्रिय',
    below4500: 'दर < ₹४,५००',
    idCol: 'पुरवठा ID',
    commodityCol: 'वस्तू',
    sellerCol: 'विक्रेता',
    qtyCol: 'उपलब्ध प्रमाण',
    rateCol: 'दर',
    locationCol: 'ठिकाण',
    statusCol: 'स्थिती',
    expiryCol: 'वैधता दिनांक',
    supplyDetails: 'पुरवठ्याचा तपशील',
    noSuppliesFound: 'कोणताही पुरवठा आढळला नाही',
    matchingCount: (count) => `${count} जुळणारे पुरवठा नोंदी`,
    activeSuppliesBadge: (count) => `${count} सक्रिय पुरवठा`,
    totalQtyBadge: (qty, unit) => `एकूण उपलब्ध: ${Number(qty).toLocaleString('en-IN')} ${unit || 'क्विंटल'}`,
    highestSellerTitle: 'सर्वाधिक उपलब्ध प्रमाण',
    highestSellerSubtitle: (seller, qty, unit, comm) => `${seller} कडे ${comm} चे ${Number(qty).toLocaleString('en-IN')} ${unit} उपलब्ध आहे`,
    tiedSellers: (count) => `(${count} विक्रेते समान प्रमाणावर)`,
    loading: 'पुरवठा व साठा नोंदी लोड होत आहेत...',
    apiError: 'मार्केटप्लेस बॅकएंडकडून पुरवठा मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.',
    retry: 'पुन्हा प्रयत्न करा',
    pageText: (curr, total, count) => `पान ${curr} / ${total} (एकूण ${count} पुरवठा)`,
    prev: 'मागील',
    next: 'पुढील',
    pageSize: 'प्रति पान:',
    doubleClickHint: 'तपशील पाहण्यासाठी ओळीवर डबल-क्लिक करा',
    active: 'सक्रिय (Active)',
    expired: 'मुदत संपली (Expired)',
  },
};

/**
 * Normalizes supply records from API or chatbot response.
 */
function normalizeSuppliesList(supplies) {
  if (!Array.isArray(supplies)) return [];
  return supplies.map((s, idx) => {
    // Preserve actual supply identifier fields from API DTO:
    // SupplyDto contains `id` (Long primary key) and `supplyNumber` (String business ID e.g. "SUP-1792572721202").
    // Some endpoints or test mocks may also supply `supplyId`.
    const supplyNumber =
      s.supplyNumber ||
      s.supplyId ||
      (s.id !== undefined && s.id !== null
        ? String(s.id).startsWith('SUP-')
          ? String(s.id)
          : `SUP-${s.id}`
        : `SUP-${1000 + idx}`);
    const supplyId = s.supplyId || supplyNumber;
    const id = s.id !== undefined && s.id !== null ? s.id : (s.supplyId || idx + 1);
    const commodityName = s.commodityName || s.commodity || 'Soybean';
    const parentCommodityName = s.parentCommodityName || null;
    const partyName = s.partyName || s.seller || s.sellerName || 'Marketplace Seller';
    const maskedLabel = s.maskedLabel || partyName;
    const availableQuantity = Number(s.availableQuantity !== undefined ? s.availableQuantity : s.quantity || 0);
    const totalQuantity = Number(s.totalQuantity !== undefined ? s.totalQuantity : availableQuantity);
    const lockedQuantity = Number(s.lockedQuantity !== undefined ? s.lockedQuantity : 0);
    const unit = s.unit || 'Quintal';
    const askingRate = Number(s.askingRate !== undefined ? s.askingRate : s.price || s.rate || 0);
    const location = s.location || '-';
    const status = s.status || (s.active !== false ? 'ACTIVE' : 'INACTIVE');
    const validTill = s.validTill || s.expiryDate || null;
    const createdAt = s.createdAt || null;

    return {
      ...s,
      id,
      supplyNumber,
      supplyId,
      commodityName,
      parentCommodityName,
      partyName,
      maskedLabel,
      availableQuantity,
      totalQuantity,
      lockedQuantity,
      unit,
      askingRate,
      location,
      status,
      validTill,
      createdAt,
    };
  });
}

/**
 * Inspects whether a supply's validTill date has passed, separately from stored active status.
 */
export function isSupplyPastExpiry(validTill) {
  if (!validTill) return false;
  try {
    const expiry = new Date(validTill);
    if (isNaN(expiry.getTime())) return false;
    // For date strings formatted as YYYY-MM-DD, validity extends to the end of that day
    if (typeof validTill === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(validTill.trim())) {
      expiry.setHours(23, 59, 59, 999);
    }
    return expiry.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Detects initial filters from user question.
 */
function detectSupplyInitialFilter(question) {
  if (!question || typeof question !== 'string') return {};
  const lower = question.toLowerCase();

  let commodity = '';
  if (lower.includes('soybean') || lower.includes('सोयाबीन')) commodity = 'Soybean';
  else if (lower.includes('wheat') || lower.includes('गहू') || lower.includes('गेहूं')) commodity = 'Wheat';
  else if (lower.includes('maize') || lower.includes('मका') || lower.includes('मक्का')) commodity = 'Maize';
  else if (lower.includes('cotton') || lower.includes('कापूस') || lower.includes('कपास')) commodity = 'Cotton';

  let location = '';
  if (lower.includes('sangli') || lower.includes('सांगली')) location = 'Sangli';
  else if (lower.includes('pune') || lower.includes('पुणे')) location = 'Pune';
  else if (lower.includes('latur') || lower.includes('लातूर')) location = 'Latur';
  else if (lower.includes('akola') || lower.includes('अकोला')) location = 'Akola';

  let priceFilter = false;
  if (lower.includes('4500') || lower.includes('4,500') || lower.includes('below') || lower.includes('कमी')) {
    priceFilter = true;
  }

  let expiringSoon = false;
  if (lower.includes('expiring') || lower.includes('expiry') || lower.includes('मुदत')) {
    expiringSoon = true;
  }

  let status = 'ACTIVE';
  if (lower.includes('expired') || lower.includes('मुदत संपली')) {
    status = 'EXPIRED';
  } else if (lower.includes('all') || lower.includes('सर्व') || lower.includes('सारे')) {
    status = 'ALL';
  }

  let initialSearch = '';
  const supMatch = question.match(/SUP-[\w\d-]+/i);
  if (supMatch) {
    initialSearch = supMatch[0];
  }

  return { commodity, location, priceFilter, expiringSoon, status, initialSearch };
}

export default function SupplyExplorer({
  message,
  lang = 'en',
  onSendMessage,
}) {
  const i18n = SUPPLY_I18N[lang] || SUPPLY_I18N.en;

  const initialSupplies = useMemo(() => {
    if (Array.isArray(message?.supplies) && message.supplies.length > 0) {
      return normalizeSuppliesList(message.supplies);
    }
    return [];
  }, [message]);

  const [supplies, setSupplies] = useState(initialSupplies);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const initFilters = useMemo(() => {
    return detectSupplyInitialFilter(message?.userQuestion || message?.content);
  }, [message]);

  const [searchTerm, setSearchTerm] = useState(initFilters.initialSearch || '');
  const [commodityFilter, setCommodityFilter] = useState(initFilters.commodity || 'ALL');
  const [locationFilter, setLocationFilter] = useState(initFilters.location || 'ALL');
  const [statusFilter, setStatusFilter] = useState(initFilters.status || 'ACTIVE');
  const [priceUnder4500, setPriceUnder4500] = useState(initFilters.priceFilter || false);

  const [sortField, setSortField] = useState(initFilters.expiringSoon ? 'validTill' : 'availableQuantity');
  const [sortAsc, setSortAsc] = useState(initFilters.expiringSoon ? true : false);

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSupply, setSelectedSupply] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSuppliesFromApi = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetchSupplies();
      const raw = res?.data || res?.content || (Array.isArray(res) ? res : []);
      if (Array.isArray(raw)) {
        setSupplies(normalizeSuppliesList(raw));
      }
    } catch (err) {
      setApiError(err.message || i18n.apiError);
    } finally {
      setIsLoading(false);
    }
  }, [i18n.apiError]);

  useEffect(() => {
    if (initialSupplies.length === 0) {
      loadSuppliesFromApi();
    } else {
      setSupplies(initialSupplies);
    }
  }, [initialSupplies, loadSuppliesFromApi]);

  // Available dropdown options
  const availableCommodities = useMemo(() => {
    const set = new Set();
    supplies.forEach((s) => {
      if (s.commodityName) set.add(s.commodityName);
    });
    return Array.from(set).sort();
  }, [supplies]);

  const availableLocations = useMemo(() => {
    const set = new Set();
    supplies.forEach((s) => {
      if (s.location && s.location !== '-') set.add(s.location);
    });
    return Array.from(set).sort();
  }, [supplies]);

  // Highest seller calculation
  const highestSellerInfo = useMemo(() => {
    const activeOnes = supplies.filter((s) => String(s.status).toUpperCase() === 'ACTIVE' && s.availableQuantity > 0);
    if (activeOnes.length === 0) return null;

    let maxQty = -1;
    activeOnes.forEach((s) => {
      if (s.availableQuantity > maxQty) maxQty = s.availableQuantity;
    });

    const highestList = activeOnes.filter((s) => s.availableQuantity === maxQty);
    if (highestList.length === 0) return null;

    return {
      top: highestList[0],
      tiedCount: highestList.length > 1 ? highestList.length : 0,
      allTied: highestList,
    };
  }, [supplies]);

  // Filtering
  const filteredSupplies = useMemo(() => {
    const rawQuery = searchTerm ? searchTerm.trim() : '';
    const query = rawQuery.toLowerCase();
    const cleanQuery = query.replace(/[\s-_]/g, '');

    return supplies.filter((s) => {
      if (query) {
        // Supply ID matching:
        // Matches the actual API DTO field `supplyNumber` (e.g. "SUP-1792572721202" or "SUP-101"),
        // as well as `id` (e.g. 6 or "SUP-101"), `supplyId`, and partial/full variations with or without hyphens/spaces.
        const idFields = [
          s.supplyNumber,
          s.supplyId,
          s.id !== undefined && s.id !== null ? String(s.id) : null,
          s.id !== undefined && s.id !== null ? `SUP-${s.id}` : null,
        ].filter(Boolean);

        const matchId = idFields.some((fieldVal) => {
          const valStr = String(fieldVal).trim().toLowerCase();
          if (valStr.includes(query)) return true;
          if (cleanQuery && valStr.replace(/[\s-_]/g, '').includes(cleanQuery)) return true;
          return false;
        });

        // Other supported search fields: Commodity, Seller / Trader, Location, Status
        const matchComm = String(s.commodityName || s.commodity || s.parentCommodityName || '').toLowerCase().includes(query);
        const matchSeller = String(s.partyName || s.seller || s.sellerName || s.maskedLabel || '').toLowerCase().includes(query);
        const matchLoc = String(s.location || '').toLowerCase().includes(query);
        const matchStatus = String(s.status || '').toLowerCase().includes(query);

        if (!matchId && !matchComm && !matchSeller && !matchLoc && !matchStatus) {
          return false;
        }
      }

      if (commodityFilter !== 'ALL') {
        if ((s.commodityName || '').toLowerCase() !== commodityFilter.toLowerCase()) return false;
      }

      if (locationFilter !== 'ALL') {
        if ((s.location || '').toLowerCase() !== locationFilter.toLowerCase()) return false;
      }

      if (statusFilter !== 'ALL') {
        const isPastExpiryDate = isSupplyPastExpiry(s.validTill);
        const storedStatusUpper = String(s.status || '').toUpperCase();

        if (statusFilter === 'ACTIVE') {
          // Stored status must be ACTIVE
          if (storedStatusUpper !== 'ACTIVE') return false;
        } else if (statusFilter === 'EXPIRED') {
          // Inspect expiry date separately from stored active status
          if (storedStatusUpper !== 'EXPIRED' && !isPastExpiryDate) return false;
        }
      }

      if (priceUnder4500) {
        if (s.askingRate >= 4500) return false;
      }

      return true;
    });
  }, [supplies, searchTerm, commodityFilter, locationFilter, statusFilter, priceUnder4500]);

  // Sorting
  const sortedSupplies = useMemo(() => {
    return [...filteredSupplies].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'availableQuantity' || sortField === 'askingRate') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return sortAsc ? valA - valB : valB - valA;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      const comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredSupplies, sortField, sortAsc]);

  const totalElements = sortedSupplies.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const pagedSupplies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSupplies.slice(start, start + pageSize);
  }, [sortedSupplies, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(field === 'validTill' ? true : false);
    }
  };

  const handleOpenModal = (supply) => {
    setSelectedSupply(supply);
    setIsModalOpen(true);
  };

  // Aggregations
  const activeSupplies = supplies.filter((s) => String(s.status).toUpperCase() === 'ACTIVE');
  const totalAvailableQty = activeSupplies.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
  const primaryUnit = supplies[0]?.unit || 'Quintal';

  const isQuestionHighestSeller = (message?.userQuestion || '').toLowerCase().includes('highest') ||
    (message?.userQuestion || '').toLowerCase().includes('सर्वाधिक');

  const hasZeroResults = totalElements === 0;
  const isErrorState = !isLoading && apiError && supplies.length === 0;

  return (
    <div className="order-explorer-container party-explorer-container">
      {/* 1. Header with Badges */}
      <div className="party-explorer-header">
        <div className="party-explorer-title-wrap">
          <span className="party-title-icon">📦</span>
          <h4 className="party-explorer-title">{i18n.title}</h4>
        </div>
        {!apiError && supplies.length > 0 && (
          <div className="party-badges-wrap">
            <span className="party-badge badge-total">
              {i18n.activeSuppliesBadge(activeSupplies.length)}
            </span>
            <span className="party-badge badge-active">
              {i18n.totalQtyBadge(totalAvailableQty, primaryUnit)}
            </span>
          </div>
        )}
      </div>

      {/* 2. Loading Overlay */}
      {isLoading && (
        <div className="order-loading-overlay">
          <div className="order-spinner" />
          <span>{i18n.loading}</span>
        </div>
      )}

      {/* 3. Explicit Connection Error State */}
      {isErrorState && (
        <div className="order-error-banner supply-error-banner" data-testid="supply-error-banner">
          <span className="error-icon" style={{ fontSize: '18px' }}>⚠️</span>
          <div className="party-error-msg" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <span style={{ fontWeight: 600 }}>{i18n.apiError}</span>
            <span style={{ fontSize: '12px', opacity: 0.85, wordBreak: 'break-word', fontFamily: 'monospace' }}>
              {apiError}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary party-retry-inline-btn"
            onClick={loadSuppliesFromApi}
          >
            <RefreshIcon size={14} />
            <span>{i18n.retry}</span>
          </button>
        </div>
      )}

      {/* 4. Highlight Card for Highest Seller if detected or requested */}
      {!isErrorState && highestSellerInfo && (isQuestionHighestSeller || supplies.length > 0) && (
        <div className="supply-highest-seller-card">
          <div className="highest-seller-badge-row">
            <span className="highest-seller-tag">★ {i18n.highestSellerTitle}</span>
            {highestSellerInfo.tiedCount > 0 && (
              <span className="tied-sellers-note">{i18n.tiedSellers(highestSellerInfo.tiedCount)}</span>
            )}
          </div>
          <div className="highest-seller-main-text">
            {i18n.highestSellerSubtitle(
              highestSellerInfo.top.partyName,
              highestSellerInfo.top.availableQuantity,
              highestSellerInfo.top.unit,
              highestSellerInfo.top.commodityName
            )}
          </div>
          <div className="highest-seller-sub">
            Location: {highestSellerInfo.top.location} · Asking Rate: ₹{Number(highestSellerInfo.top.askingRate).toLocaleString('en-IN')}/{highestSellerInfo.top.unit}
          </div>
        </div>
      )}

      {/* 5. Controls & Filter Bar */}
      {!isErrorState && (
        <div className="party-controls-bar">
          <div className="order-search-box party-search-box modern-search-box">
            <SearchIcon size={16} className="search-icon" />
            <input
              type="text"
              className="order-search-input modern-search-input"
              placeholder={i18n.searchPlaceholder}
              aria-label={i18n.searchAriaLabel}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                aria-label={i18n.clearSearch}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          <div className="party-filters-group">
            <select
              className="party-filter-select"
              value={commodityFilter}
              onChange={(e) => {
                setCommodityFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by commodity"
            >
              <option value="ALL">{i18n.allCommodities}</option>
              {availableCommodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="party-filter-select"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by location"
            >
              <option value="ALL">{i18n.allLocations}</option>
              {availableLocations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <select
              className="party-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="ACTIVE">{i18n.activeOnly}</option>
              <option value="ALL">{i18n.allStatuses}</option>
              <option value="EXPIRED">{i18n.expired}</option>
            </select>

            <button
              type="button"
              className={`btn btn-secondary party-pill-filter ${priceUnder4500 ? 'active' : ''}`}
              onClick={() => {
                setPriceUnder4500((prev) => !prev);
                setCurrentPage(1);
              }}
            >
              {i18n.below4500}
            </button>
          </div>
        </div>
      )}

      {/* 6. Table Hint */}
      {!isErrorState && !hasZeroResults && (
        <div className="order-table-hint">
          <span>&#9432;</span>
          <span>{i18n.doubleClickHint}</span>
        </div>
      )}

      {/* 7. Empty Results Banner */}
      {!isLoading && !isErrorState && hasZeroResults && (
        <div className="order-empty-banner">
          <div className="order-empty-message">
            <span className="order-empty-title">{i18n.noSuppliesFound}</span>
            <span className="order-empty-subtitle">{i18n.matchingCount(0)}</span>
          </div>
          {searchTerm && (
            <button
              type="button"
              className="btn btn-secondary order-clear-search-btn"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              {i18n.clearSearch}
            </button>
          )}
        </div>
      )}

      {/* 8. Supplies Records Table */}
      {!isLoading && !isErrorState && !hasZeroResults && (
        <div className="order-table-wrapper">
          <div className="table-responsive">
            <table className="order-records-table party-records-table">
              <thead>
                <tr>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('supplyNumber')}
                    title="Sort by Supply ID"
                  >
                    <span className="th-content">
                      {i18n.idCol}
                      {sortField === 'supplyNumber' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('commodityName')}
                    title="Sort by Commodity"
                  >
                    <span className="th-content">
                      {i18n.commodityCol}
                      {sortField === 'commodityName' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('partyName')}
                    title="Sort by Seller"
                  >
                    <span className="th-content">
                      {i18n.sellerCol}
                      {sortField === 'partyName' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th text-right"
                    onClick={() => handleSort('availableQuantity')}
                    title="Sort by Available Qty"
                  >
                    <span className="th-content">
                      {i18n.qtyCol}
                      {sortField === 'availableQuantity' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th text-right"
                    onClick={() => handleSort('askingRate')}
                    title="Sort by Asking Rate"
                  >
                    <span className="th-content">
                      {i18n.rateCol}
                      {sortField === 'askingRate' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('location')}
                    title="Sort by Location"
                  >
                    <span className="th-content">
                      {i18n.locationCol}
                      {sortField === 'location' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('status')}
                    title="Sort by Status"
                  >
                    <span className="th-content">
                      {i18n.statusCol}
                      {sortField === 'status' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('validTill')}
                    title="Sort by Expiry Date"
                  >
                    <span className="th-content">
                      {i18n.expiryCol}
                      {sortField === 'validTill' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedSupplies.map((s) => {
                  const isActive = String(s.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
                  return (
                    <tr
                      key={s.supplyNumber || s.id}
                      className="order-row party-row"
                      onDoubleClick={() => handleOpenModal(s)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenModal(s);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      title={i18n.doubleClickHint}
                    >
                      <td>
                        <span className="party-code-link font-mono">
                          {s.supplyNumber}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-gray-900">{s.commodityName}</span>
                      </td>
                      <td>
                        <span className="party-name-link font-bold">
                          {s.partyName}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="rate-value-bold text-blue-700">
                          {Number(s.availableQuantity).toLocaleString('en-IN')} {s.unit}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="total-amount-bold">
                          ₹{Number(s.askingRate).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>{s.location}</td>
                      <td>
                        <span
                          className={`party-status-badge ${
                            isActive ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {isActive ? i18n.active : s.status}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs">
                          {s.validTill ? String(s.validTill).replace('T', ' ') : '-'}
                          {isSupplyPastExpiry(s.validTill) && (
                            <span
                              className="text-amber-700 ml-1 font-sans font-semibold"
                              style={{ fontSize: '10px' }}
                              title="Expiry date has passed"
                            >
                              ({i18n.expired})
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. Pagination */}
      {!isLoading && !isErrorState && !hasZeroResults && (
        <div className="order-pagination-controls party-pagination-controls">
          <div className="party-page-size-selector">
            <span className="pagination-info">{i18n.pageSize}</span>
            <select
              className="page-size-dropdown"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Select page size"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="pagination-pages">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              {i18n.prev}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`pagination-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              {i18n.next}
            </button>
          </div>

          <div className="pagination-info">
            {i18n.pageText(currentPage, totalPages, totalElements)}
          </div>
        </div>
      )}

      {/* 10. Supply Details Modal */}
      <SupplyDetailsModal
        isOpen={isModalOpen}
        supply={selectedSupply}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSupply(null);
        }}
        lang={lang}
      />
    </div>
  );
}
