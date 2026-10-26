import React, { useState, useMemo } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

export default function DataTable({
  columns = [],
  data = [],
  title,
  subtitle,
  searchPlaceholder = "Search records...",
  emptyMessage = "No records found matching your criteria.",
  defaultPageSize = 10,
  initialSortKey = null,
  initialSortDirection = 'asc',
  extraHeaderActions,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(initialSortKey || (columns[0]?.key || ''));
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 1. Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [data, searchTerm, columns]);

  // 2. Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1 on new query
  };

  return (
    <div className="data-table-container">
      {/* Table Header toolbar */}
      <div className="table-toolbar">
        <div className="table-title-area">
          {title && <h3 className="table-title">{title}</h3>}
          {subtitle && <p className="table-subtitle">{subtitle}</p>}
        </div>

        <div className="table-controls">
          <div className="search-box">
            <SearchIcon className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search records"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {extraHeaderActions && (
            <div className="table-extra-actions">{extraHeaderActions}</div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive">
        <table className="data-table" aria-label={title || "Data Table"}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={col.sortable !== false ? 'th-sortable' : ''}
                    style={col.width ? { width: col.width } : {}}
                  >
                    <div className="th-content">
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <span className="sort-indicator">
                          {isSorted ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key} className={col.align ? `text-${col.align}` : ''}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '--')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  <div className="table-empty-state">
                    <p className="empty-message">{emptyMessage}</p>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="btn btn-outline btn-xs"
                      >
                        Clear search filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="table-footer">
        <div className="table-info">
          Showing{' '}
          <strong>
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </strong>{' '}
          to{' '}
          <strong>
            {Math.min(currentPage * pageSize, sortedData.length)}
          </strong>{' '}
          of <strong>{sortedData.length}</strong> records
          {data.length !== sortedData.length && ` (filtered from ${data.length})`}
        </div>

        <div className="table-pagination">
          <label className="page-size-label">
            Rows per page:
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="page-size-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>

          <div className="pagination-buttons">
            <button
              type="button"
              className="btn btn-icon btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous Page"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span className="pagination-page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-icon btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next Page"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
