import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchIcon, CloseIcon, RefreshIcon, UsersIcon, EyeIcon } from '../common/Icons';
import { fetchParties } from '../../services/api';
import PartyDetailsModal from './PartyDetailsModal';

const PARTY_I18N = {
  en: {
    title: 'Registered Parties Explorer',
    searchPlaceholder: 'Search by party ID, company name, city, role, status...',
    searchAriaLabel: 'Search registered parties',
    clearSearch: 'Clear search',
    allRoles: 'All Roles',
    allStatuses: 'All Statuses',
    allLocations: 'All Locations',
    codeCol: 'Party ID',
    nameCol: 'Company Name',
    locationCol: 'Location',
    rolesCol: 'Role(s)',
    statusCol: 'Status',
    dateCol: 'Registered Date',
    actionsCol: 'Action',
    viewDetails: 'View Details',
    noParties: 'No registered parties found.',
    noPartiesFound: 'No parties found',
    matchingPartiesCount: (count) => `${count} matching parties`,
    totalPartiesBadge: (count) => `${count} Registered Parties`,
    activePartiesBadge: (count) => `${count} Active`,
    apiError: 'Could not retrieve registered parties from the marketplace backend. Please try again.',
    loading: 'Loading registered parties...',
    retry: 'Retry',
    pageText: (curr, total, count) => `Page ${curr} of ${total} (${count} total parties)`,
    prev: 'Previous',
    next: 'Next',
    pageSize: 'Per page:',
    doubleClickHint: 'Tip: Click any Party ID, company name or View Details to examine full profile.',
    active: 'Active',
    inactive: 'Inactive',
    unassigned: 'Unassigned',
  },
  hi: {
    title: 'पंजीकृत पार्टी एक्सप्लोरर',
    searchPlaceholder: 'पार्टी ID, कंपनी नाम, शहर, भूमिका या स्थिति से खोजें...',
    searchAriaLabel: 'पंजीकृत पार्टियां खोजें',
    clearSearch: 'खोज हटाएं',
    allRoles: 'सभी भूमिकाएँ',
    allStatuses: 'सभी स्थितियाँ',
    allLocations: 'सभी स्थान',
    codeCol: 'पार्टी ID',
    nameCol: 'कंपनी का नाम',
    locationCol: 'स्थान',
    rolesCol: 'भूमिका (Role)',
    statusCol: 'स्थिति',
    dateCol: 'पंजीकरण दिनांक',
    actionsCol: 'कार्य',
    viewDetails: 'विवरण देखें',
    noParties: 'कोई पंजीकृत पार्टी नहीं मिली।',
    noPartiesFound: 'कोई पार्टी नहीं मिली',
    matchingPartiesCount: (count) => `${count} मेल खाने वाली पार्टियां`,
    totalPartiesBadge: (count) => `${count} पंजीकृत पार्टियां`,
    activePartiesBadge: (count) => `${count} सक्रिय`,
    apiError: 'मार्केटप्लेस बैकएंड से पंजीकृत पार्टियां प्राप्त नहीं की जा सकीं। कृपया पुनः प्रयास करें।',
    loading: 'पंजीकृत पार्टियां लोड हो रही हैं...',
    retry: 'पुनः प्रयास करें',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (कुल ${count} पार्टियां)`,
    prev: 'पिछला',
    next: 'अगला',
    pageSize: 'प्रति पृष्ठ:',
    doubleClickHint: 'सुझाव: पूर्ण प्रोफ़ाइल देखने के लिए किसी भी पार्टी ID या कंपनी नाम पर क्लिक करें।',
    active: 'सक्रिय (Active)',
    inactive: 'निष्क्रिय (Inactive)',
    unassigned: 'अवर्गीकृत (Unassigned)',
  },
  mr: {
    title: 'नोंदणीकृत पार्ट्या एक्सप्लोरर',
    searchPlaceholder: 'पार्टी ID, कंपनी नाव, शहर, भूमिका किंवा स्थितीनुसार शोधा...',
    searchAriaLabel: 'नोंदणीकृत पार्ट्या शोधा',
    clearSearch: 'शोध साफ करा',
    allRoles: 'सर्व भूमिका',
    allStatuses: 'सर्व स्थिती',
    allLocations: 'सर्व ठिकाणे',
    codeCol: 'पार्टी ID',
    nameCol: 'कंपनीचे नाव',
    locationCol: 'ठिकाण',
    rolesCol: 'भूमिका (Role)',
    statusCol: 'स्थिती',
    dateCol: 'नोंदणी तारीख',
    actionsCol: 'कृती',
    viewDetails: 'तपशील पहा',
    noParties: 'कोणत्याही नोंदणीकृत पार्ट्या आढळल्या नाहीत.',
    noPartiesFound: 'कोणतीही पार्टी आढळली नाही',
    matchingPartiesCount: (count) => `${count} जुळणाऱ्या पार्ट्या`,
    totalPartiesBadge: (count) => `${count} नोंदणीकृत पार्ट्या`,
    activePartiesBadge: (count) => `${count} सक्रिय`,
    apiError: 'मार्केटप्लेस बॅकएंडकडून नोंदणीकृत पार्ट्या मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.',
    loading: 'नोंदणीकृत पार्ट्या लोड होत आहेत...',
    retry: 'पुन्हा प्रयत्न करा',
    pageText: (curr, total, count) => `पान ${curr} / ${total} (एकूण ${count} पार्ट्या)`,
    prev: 'मागील',
    next: 'पुढील',
    pageSize: 'प्रति पान:',
    doubleClickHint: 'टीप: पूर्ण प्रोफाईल पाहण्यासाठी कोणत्याही पार्टी ID, कंपनी नावावर किंवा तपशील बटनावर क्लिक करा.',
    active: 'सक्रिय (Active)',
    inactive: 'निष्क्रिय (Inactive)',
    unassigned: 'अवर्गीकृत (Unassigned)',
  },
};

/**
 * Parses parties from markdown table if message.parties is not directly present.
 */
function parsePartiesFromMarkdown(content) {
  if (!content || typeof content !== 'string') return [];
  const parties = [];
  const lines = content.split('\n');

  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim().replace(/\*\*/g, ''));

      if (cells.some((c) => c.includes('---'))) {
        inTable = true;
        continue;
      }

      if (inTable) {
        // Data row
        if (cells.length >= 4) {
          const partyCode = cells[0] || '';
          const companyName = cells[1] || '';
          const city = cells[2] || '';
          const state = cells[3] || '';
          const role = cells[4] || '';
          const status = cells[5] || 'ACTIVE';

          if (partyCode && !partyCode.toLowerCase().includes('party code')) {
            parties.push({
              partyCode,
              companyName,
              city,
              state,
              roles: role && role !== '-' && role !== 'Unassigned' && !role.includes('अवर्गीकृत') ? [role] : [],
              status: status.includes('ACTIVE') || status.includes('सक्रिय') ? 'ACTIVE' : status,
              active: !status.includes('INACTIVE') && !status.includes('निष्क्रिय'),
            });
          }
        }
      }
    } else {
      if (inTable && trimmed === '') {
        inTable = false;
      }
    }
  }

  return parties;
}

/**
 * Normalizes raw parties array from various shapes.
 */
function normalizePartiesList(parties) {
  if (!Array.isArray(parties)) return [];
  return parties.map((p, idx) => {
    const id = p.id || idx + 1;
    const partyCode = p.partyCode || p.code || `PRT-${String(id).padStart(4, '0')}`;
    const companyName = p.companyName || p.name || `Party ${partyCode}`;
    const city = p.city || '-';
    const state = p.state || '-';
    const roles = Array.isArray(p.roles)
      ? p.roles
      : typeof p.roles === 'string' && p.roles
      ? [p.roles]
      : [];
    const status = p.status || (p.active !== false ? 'ACTIVE' : 'INACTIVE');
    const active = p.active !== false && String(status).toUpperCase() === 'ACTIVE';
    const createdAt = p.createdAt || p.registrationDate || null;

    return {
      ...p,
      id,
      partyCode,
      companyName,
      city,
      state,
      roles,
      status,
      active,
      createdAt,
    };
  });
}

/**
 * Detects if user question was specifically asking about a city or role or status.
 */
function detectInitialFilterFromQuestion(question) {
  if (!question || typeof question !== 'string') return {};
  const lower = question.toLowerCase();

  let city = '';
  if (lower.includes('sangli') || lower.includes('सांगली')) city = 'Sangli';
  else if (lower.includes('pune') || lower.includes('पुणे')) city = 'Pune';
  else if (lower.includes('akola') || lower.includes('अकोला')) city = 'Akola';
  else if (lower.includes('latur') || lower.includes('लातूर')) city = 'Latur';
  else if (lower.includes('nanded') || lower.includes('नांदेड')) city = 'Nanded';
  else if (lower.includes('kolhapur') || lower.includes('कोल्हापूर')) city = 'Kolhapur';
  else if (lower.includes('nashik') || lower.includes('नाशिक')) city = 'Nashik';

  let role = '';
  if (lower.includes('buyer') || lower.includes('खरेदीदार') || lower.includes('खरीदार')) role = 'BUYER';
  else if (lower.includes('seller') || lower.includes('विक्रेता')) role = 'SELLER';
  else if (lower.includes('manufacturer') || lower.includes('उत्पादक')) role = 'MANUFACTURER';
  else if (lower.includes('trader') || lower.includes('व्यापारी')) role = 'TRADER';

  let status = '';
  if (lower.includes('inactive') || lower.includes('निष्क्रिय')) status = 'INACTIVE';
  else if (lower.includes('deleted') || lower.includes('हटवलेल्या') || lower.includes('हटाए गए')) status = 'DELETED';

  return { city, role, status };
}

export default function PartyExplorer({
  message,
  lang = 'en',
  onSendMessage,
}) {
  const i18n = PARTY_I18N[lang] || PARTY_I18N.en;

  // Extract initial parties
  const initialParties = useMemo(() => {
    if (Array.isArray(message?.parties) && message.parties.length > 0) {
      return normalizePartiesList(message.parties);
    }
    const fromMarkdown = parsePartiesFromMarkdown(message?.content);
    if (fromMarkdown.length > 0) {
      return normalizePartiesList(fromMarkdown);
    }
    return [];
  }, [message]);

  const [parties, setParties] = useState(initialParties);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Filters & Search
  const initialFilter = useMemo(() => {
    return detectInitialFilterFromQuestion(message?.userQuestion || message?.content);
  }, [message]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(initialFilter.role || 'ALL');
  const [statusFilter, setStatusFilter] = useState(initialFilter.status || 'ALL');
  const [locationFilter, setLocationFilter] = useState(initialFilter.city || 'ALL');

  // Sorting
  const [sortField, setSortField] = useState('partyCode');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedParty, setSelectedParty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If initial parties empty, attempt background fetch
  const loadPartiesFromApi = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetchParties({ page: 0, size: 50, showDeleted: false });
      const rawList = res?.data?.content || res?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        setParties(normalizePartiesList(rawList));
      }
    } catch (err) {
      // If API fails and we don't have existing parties, show error
      if (parties.length === 0) {
        setApiError(err.message || i18n.apiError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [parties.length, i18n.apiError]);

  useEffect(() => {
    if (initialParties.length === 0) {
      loadPartiesFromApi();
    } else {
      setParties(initialParties);
    }
  }, [initialParties, loadPartiesFromApi]);

  // Derive unique locations and roles for filter dropdowns
  const availableLocations = useMemo(() => {
    const locSet = new Set();
    parties.forEach((p) => {
      if (p.city && p.city !== '-') locSet.add(p.city);
    });
    return Array.from(locSet).sort();
  }, [parties]);

  const availableRoles = useMemo(() => {
    const roleSet = new Set();
    parties.forEach((p) => {
      if (Array.isArray(p.roles)) {
        p.roles.forEach((r) => roleSet.add(r));
      }
    });
    return Array.from(roleSet).sort();
  }, [parties]);

  // Dynamic Filtering Logic
  const filteredParties = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return parties.filter((p) => {
      // Search term matching across Party ID, Company Name, City, State, Role, Status
      if (query) {
        const matchCode = (p.partyCode || '').toLowerCase().includes(query);
        const matchName = (p.companyName || '').toLowerCase().includes(query);
        const matchCity = (p.city || '').toLowerCase().includes(query);
        const matchState = (p.state || '').toLowerCase().includes(query);
        const matchRoles = (p.roles || []).some((r) => r.toLowerCase().includes(query));
        const matchStatus = (p.status || '').toLowerCase().includes(query);
        const matchAddress = (p.address || '').toLowerCase().includes(query);

        if (
          !matchCode &&
          !matchName &&
          !matchCity &&
          !matchState &&
          !matchRoles &&
          !matchStatus &&
          !matchAddress
        ) {
          return false;
        }
      }

      // Role Filter
      if (roleFilter !== 'ALL') {
        if (roleFilter === 'UNASSIGNED') {
          if (p.roles && p.roles.length > 0) return false;
        } else {
          if (!p.roles || !p.roles.some((r) => r.toUpperCase() === roleFilter.toUpperCase())) {
            return false;
          }
        }
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE') {
          if (!p.active && String(p.status).toUpperCase() !== 'ACTIVE') return false;
        } else if (statusFilter === 'INACTIVE') {
          if (p.active || String(p.status).toUpperCase() === 'ACTIVE') return false;
        } else if (statusFilter === 'DELETED') {
          if (!p.isDeleted) return false;
        }
      }

      // Location Filter
      if (locationFilter !== 'ALL') {
        if ((p.city || '').toLowerCase() !== locationFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [parties, searchTerm, roleFilter, statusFilter, locationFilter]);

  // Sort Filtered Parties
  const sortedParties = useMemo(() => {
    return [...filteredParties].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'roles') {
        valA = (a.roles || []).join(', ');
        valB = (b.roles || []).join(', ');
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      const comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredParties, sortField, sortAsc]);

  // Pagination Slice
  const totalElements = sortedParties.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const pagedParties = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedParties.slice(start, start + pageSize);
  }, [sortedParties, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Open party details modal
  const handleOpenPartyModal = (party) => {
    setSelectedParty(party);
    setIsModalOpen(true);
  };

  // Active parties count from current unfiltered dataset
  const totalPartyCount = parties.length;
  const activePartyCount = parties.filter((p) => p.active !== false && String(p.status).toUpperCase() === 'ACTIVE').length;

  const isSearching = searchTerm.trim().length > 0;
  const hasZeroResults = totalElements === 0;

  return (
    <div className="order-explorer-container party-explorer-container">
      {/* 1. Header with Badges */}
      <div className="party-explorer-header">
        <div className="party-explorer-title-wrap">
          <UsersIcon size={18} className="text-primary" />
          <h4 className="party-explorer-title">{i18n.title}</h4>
        </div>
        <div className="party-badges-wrap">
          <span className="party-badge badge-total">
            {i18n.totalPartiesBadge(totalPartyCount)}
          </span>
          <span className="party-badge badge-active">
            {i18n.activePartiesBadge(activePartyCount)}
          </span>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Bar */}
      <div className="party-controls-bar">
        {/* Search Input */}
        <div className="order-search-box party-search-box">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            className="order-search-input"
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

        {/* Filter Dropdowns */}
        <div className="party-filters-group">
          {/* Role Filter */}
          <select
            className="party-filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by role"
          >
            <option value="ALL">{i18n.allRoles}</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="UNASSIGNED">{i18n.unassigned}</option>
          </select>

          {/* Location Filter */}
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
            {availableLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="party-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="ALL">{i18n.allStatuses}</option>
            <option value="ACTIVE">{i18n.active}</option>
            <option value="INACTIVE">{i18n.inactive}</option>
          </select>
        </div>
      </div>

      {/* 3. Hint message */}
      <div className="order-table-hint">
        <span>&#9432;</span>
        <span>{i18n.doubleClickHint}</span>
      </div>

      {/* 4. Loading Overlay */}
      {isLoading && (
        <div className="order-loading-overlay">
          <div className="order-spinner" />
          <span>{i18n.loading}</span>
        </div>
      )}

      {/* 5. Error Banner */}
      {!isLoading && apiError && parties.length === 0 && (
        <div className="order-error-banner">
          <span>{apiError}</span>
          <button
            type="button"
            className="btn btn-secondary party-retry-inline-btn"
            onClick={loadPartiesFromApi}
          >
            <RefreshIcon size={14} />
            <span>{i18n.retry}</span>
          </button>
        </div>
      )}

      {/* 6. Empty Results Banner */}
      {!isLoading && hasZeroResults && (
        <div className="order-empty-banner">
          <div className="order-empty-message">
            <span className="order-empty-title">{i18n.noPartiesFound}</span>
            <span className="order-empty-subtitle">{i18n.matchingPartiesCount(0)}</span>
          </div>
          {isSearching && (
            <button
              type="button"
              className="btn btn-secondary order-clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              {i18n.clearSearch}
            </button>
          )}
        </div>
      )}

      {/* 7. Responsive Parties Table */}
      {!isLoading && !hasZeroResults && (
        <div className="order-table-wrapper">
          <div className="table-responsive">
            <table className="order-records-table party-records-table">
              <thead>
                <tr>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('partyCode')}
                    title="Sort by Party Code"
                  >
                    <span className="th-content">
                      {i18n.codeCol}
                      {sortField === 'partyCode' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('companyName')}
                    title="Sort by Company Name"
                  >
                    <span className="th-content">
                      {i18n.nameCol}
                      {sortField === 'companyName' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('city')}
                    title="Sort by Location"
                  >
                    <span className="th-content">
                      {i18n.locationCol}
                      {sortField === 'city' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort('roles')}
                    title="Sort by Role"
                  >
                    <span className="th-content">
                      {i18n.rolesCol}
                      {sortField === 'roles' && (
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
                    onClick={() => handleSort('createdAt')}
                    title="Sort by Registration Date"
                  >
                    <span className="th-content">
                      {i18n.dateCol}
                      {sortField === 'createdAt' && (
                        <span className="sort-arrow">{sortAsc ? ' ▲' : ' ▼'}</span>
                      )}
                    </span>
                  </th>
                  <th className="text-center">{i18n.actionsCol}</th>
                </tr>
              </thead>
              <tbody>
                {pagedParties.map((p) => {
                  const isActive =
                    p.active !== false && String(p.status || '').toUpperCase() === 'ACTIVE';
                  const roles = p.roles || [];

                  return (
                    <tr
                      key={p.partyCode || p.id}
                      className="order-row party-row"
                      onDoubleClick={() => handleOpenPartyModal(p)}
                    >
                      <td>
                        <button
                          type="button"
                          className="party-code-link font-mono"
                          onClick={() => handleOpenPartyModal(p)}
                          title="Click to view details"
                        >
                          {p.partyCode}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="party-name-link font-bold"
                          onClick={() => handleOpenPartyModal(p)}
                          title="Click to view details"
                        >
                          {p.companyName}
                        </button>
                      </td>
                      <td>
                        <span className="party-location-text">
                          {p.city}
                          {p.state && p.state !== '-' ? `, ${p.state}` : ''}
                        </span>
                      </td>
                      <td>
                        <div className="party-roles-wrap">
                          {roles.length > 0 ? (
                            roles.map((r, ri) => (
                              <span key={ri} className="party-role-tag">
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted text-xs">{i18n.unassigned}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`party-status-badge ${
                            isActive ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          {isActive ? i18n.active : i18n.inactive}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs">
                          {p.createdAt ? String(p.createdAt).replace('T', ' ') : '-'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="party-row-action-btn"
                          onClick={() => handleOpenPartyModal(p)}
                          title={i18n.viewDetails}
                          aria-label={`${i18n.viewDetails} for ${p.partyCode}`}
                        >
                          <EyeIcon size={14} />
                          <span>{i18n.viewDetails}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Pagination Controls (Hidden when zero results) */}
      {!isLoading && !hasZeroResults && (
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

      {/* 9. Party Details Modal */}
      <PartyDetailsModal
        isOpen={isModalOpen}
        party={selectedParty}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedParty(null);
        }}
        lang={lang}
      />
    </div>
  );
}
