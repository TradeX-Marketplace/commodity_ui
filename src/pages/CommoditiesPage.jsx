import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import ErrorState from '../components/common/ErrorState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchCommodities } from '../services/api';
import { ServerIcon } from '../components/common/Icons';

export default function CommoditiesPage() {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommodities({ useUpstreamDirect });
      setCommodities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setCommodities([]);
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
      key: 'name',
      label: 'Commodity Name',
      sortable: true,
      render: (val) => <strong>{val || '--'}</strong>,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="category-chip">{val || 'Uncategorized'}</span>
      ),
    },
    {
      key: 'unit',
      label: 'Standard Unit',
      sortable: true,
      render: (val) => val || '--',
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => <span className="cell-truncate" title={val}>{val || 'No description'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        const statusStr = (val || '').toUpperCase();
        const variant = statusStr === 'ACTIVE' ? 'success' : statusStr === 'INACTIVE' ? 'danger' : 'neutral';
        return <Badge variant={variant}>{val || 'UNKNOWN'}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '--'),
    },
  ];

  return (
    <div className="data-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Commodity Catalog</h2>
          <p className="page-subheading">
            View registered commodities and trade specifications.
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
          title="Commodities API Unavailable"
          message={error.message}
          endpointName="/api/ai/commodities"
          port={9090}
          upstreamPort={7070}
          upstreamPath="/api/ai/commodities"
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
          data={commodities}
          title="Approved Commodities"
          subtitle={`Total: ${commodities.length} items`}
          searchPlaceholder="Search by name, category, unit, or status..."
          emptyMessage="No commodities found in the catalog."
        />
      )}
    </div>
  );
}
