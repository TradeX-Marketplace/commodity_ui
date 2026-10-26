import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/common/DataTable';
import ErrorState from '../components/common/ErrorState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchMarketRates } from '../services/api';
import { ServerIcon } from '../components/common/Icons';

export default function MarketRatesPage() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarketRates({ useUpstreamDirect });
      setRates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, [useUpstreamDirect]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      render: (val, row) => <strong>{val || row.commodity || '--'}</strong>,
    },
    {
      key: 'location',
      label: 'Location / Mandi',
      sortable: true,
      render: (val) => val || '--',
    },
    {
      key: 'rate',
      label: 'Market Rate',
      sortable: true,
      align: 'right',
      render: (val, row) => {
        const curr = row.currency || 'INR';
        const formatted = val !== null && val !== undefined ? Number(val).toLocaleString() : '--';
        return (
          <span className="rate-value-highlight">
            {curr === 'INR' ? '₹' : `${curr} `}{formatted}
          </span>
        );
      },
    },
    {
      key: 'unit',
      label: 'Unit',
      sortable: true,
      render: (val) => `per ${val || 'unit'}`,
    },
    {
      key: 'rateDate',
      label: 'Rate Date',
      sortable: true,
      render: (val, row) => val || row.date || '--',
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleString() : '--'),
    },
  ];

  return (
    <div className="data-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Current Market Rates</h2>
          <p className="page-subheading">
            Approved daily wholesale commodity rates across regional markets and mandis.
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

      {loading && <LoadingSkeleton type="table" rows={6} columns={7} />}

      {!loading && error && (
        <ErrorState
          title="Market Rates API Unavailable"
          message={error.message}
          endpointName="/api/ai/market-rates"
          port={9090}
          upstreamPort={7070}
          upstreamPath="/api/ai/market-rates"
          isMissingMapping={error.status === 404}
          isNetworkError={error.isNetworkError}
          onRetry={loadData}
          isUpstreamDirect={useUpstreamDirect}
          onToggleUpstream={() => setUseUpstreamDirect((prev) => !prev)}
        />
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={rates}
          title="Approved Market Rates"
          subtitle={`Total: ${rates.length} active listings`}
          searchPlaceholder="Search by commodity, location, rate, or date..."
          emptyMessage="No market rates currently published."
        />
      )}
    </div>
  );
}
