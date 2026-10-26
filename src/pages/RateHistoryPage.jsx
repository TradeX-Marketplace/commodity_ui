import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../components/common/DataTable';
import TrendChart from '../components/common/TrendChart';
import ErrorState from '../components/common/ErrorState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchRateHistory } from '../services/api';
import { ServerIcon } from '../components/common/Icons';

export default function RateHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommodity, setSelectedCommodity] = useState('ALL');
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRateHistory({ useUpstreamDirect });
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [useUpstreamDirect]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique commodities for filter
  const uniqueCommodities = useMemo(() => {
    const set = new Set();
    history.forEach((h) => {
      if (h.commodityName) set.add(h.commodityName);
    });
    return Array.from(set).sort();
  }, [history]);

  // Filtered for table & chart
  const displayedHistory = useMemo(() => {
    if (selectedCommodity === 'ALL') return history;
    return history.filter((h) => h.commodityName === selectedCommodity);
  }, [history, selectedCommodity]);

  // Chart time series (sorted chronologically by rateDate)
  const chartPoints = useMemo(() => {
    return [...displayedHistory]
      .filter((h) => h.rate !== null && h.rate !== undefined && (h.rateDate || h.date))
      .sort((a, b) => {
        const dateA = a.rateDate || a.date;
        const dateB = b.rateDate || b.date;
        return new Date(dateA) - new Date(dateB);
      })
      .map((h) => ({
        date: h.rateDate || h.date,
        rate: h.rate,
        commodity: h.commodityName,
      }));
  }, [displayedHistory]);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '70px',
      sortable: true,
    },
    {
      key: 'commodityName',
      label: 'Commodity',
      sortable: true,
      render: (val) => <strong>{val || '--'}</strong>,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (val) => val || '--',
    },
    {
      key: 'rate',
      label: 'Historical Rate',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="rate-value-highlight">
          ₹{val !== null && val !== undefined ? Number(val).toLocaleString() : '--'}
        </span>
      ),
    },
    {
      key: 'unit',
      label: 'Unit',
      sortable: true,
      render: (val) => `per ${val || 'unit'}`,
    },
    {
      key: 'rateDate',
      label: 'Recorded Date',
      sortable: true,
      render: (val) => val || '--',
    },
  ];

  return (
    <div className="data-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Rate History & Price Trends</h2>
          <p className="page-subheading">
            Historical price logs and time-series analysis for commodities.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setUseUpstreamDirect((prev) => !prev)}
          title="Toggle data source"
        >
          <ServerIcon size={14} />
          <span>
            {useUpstreamDirect
              ? 'Using Upstream: Port 7070'
              : 'Using Admin AI: Port 9090'}
          </span>
        </button>
      </div>

      {loading && <LoadingSkeleton type="table" rows={6} columns={6} />}

      {!loading && error && (
        <ErrorState
          title="Rate History API Unavailable"
          message={error.message}
          endpointName="/api/ai/rate-history"
          port={9090}
          upstreamPort={7070}
          upstreamPath="/api/ai/rate-history"
          isMissingMapping={error.status === 404}
          isNetworkError={error.isNetworkError}
          onRetry={loadData}
          isUpstreamDirect={useUpstreamDirect}
          onToggleUpstream={() => setUseUpstreamDirect((prev) => !prev)}
        />
      )}

      {!loading && !error && (
        <>
          {/* Commodity Trend Filter Bar */}
          <div className="filter-card">
            <label className="filter-label">
              Filter Price Trend by Commodity:
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="select-input"
              >
                <option value="ALL">All Commodities ({history.length} records)</option>
                {uniqueCommodities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* SVG Trend Chart */}
          <div className="chart-section">
            <TrendChart
              data={chartPoints}
              title={`Price Trend: ${selectedCommodity === 'ALL' ? 'All Commodities' : selectedCommodity}`}
              height={260}
              emptyMessage={
                chartPoints.length < 2
                  ? "At least two historical price points are required to plot a trend chart."
                  : "No data available."
              }
            />
          </div>

          {/* Historical Data Table */}
          <DataTable
            columns={columns}
            data={displayedHistory}
            title="Rate History Records"
            subtitle={`Showing ${displayedHistory.length} historical logs`}
            searchPlaceholder="Search historical rates by commodity, mandi, or date..."
            emptyMessage="No historical rate records found."
          />
        </>
      )}
    </div>
  );
}
