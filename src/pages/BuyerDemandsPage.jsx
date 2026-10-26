import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import ErrorState from '../components/common/ErrorState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchBuyerDemands } from '../services/api';
import { ServerIcon } from '../components/common/Icons';

export default function BuyerDemandsPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBuyerDemands({ openOnly, useUpstreamDirect });
      setDemands(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setDemands([]);
    } finally {
      setLoading(false);
    }
  }, [openOnly, useUpstreamDirect]);

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
      key: 'buyerName',
      label: 'Buyer Name / Organization',
      sortable: true,
      render: (val) => <strong>{val || '--'}</strong>,
    },
    {
      key: 'commodityName',
      label: 'Commodity Demanded',
      sortable: true,
      render: (val) => <span className="commodity-badge">{val || '--'}</span>,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      align: 'right',
      render: (val, row) => (
        <span>
          {val !== null && val !== undefined ? Number(val).toLocaleString() : '--'}{' '}
          <small>{row.unit || 'units'}</small>
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Delivery Location',
      sortable: true,
      render: (val) => val || '--',
    },
    {
      key: 'requiredDate',
      label: 'Required By Date',
      sortable: true,
      render: (val) => val || '--',
    },
    {
      key: 'status',
      label: 'Demand Status',
      sortable: true,
      render: (val) => {
        const s = (val || '').toUpperCase();
        const variant =
          s === 'OPEN'
            ? 'success'
            : s === 'FULFILLED'
            ? 'info'
            : s === 'CANCELLED'
            ? 'danger'
            : 'neutral';
        return <Badge variant={variant}>{val || 'PENDING'}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Posted At',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '--'),
    },
  ];

  return (
    <div className="data-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">Buyer Demands & Procurement Requests</h2>
          <p className="page-subheading">
            Track active purchasing demands submitted by commodity buyers.
          </p>
        </div>

        <div className="page-actions-group">
          <label className="checkbox-filter-label">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
            />
            <span>Open Demands Only</span>
          </label>

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
      </div>

      {loading && <LoadingSkeleton type="table" rows={6} columns={8} />}

      {!loading && error && (
        <ErrorState
          title="Buyer Demands API Unavailable"
          message={error.message}
          endpointName="/api/ai/buyer-demands"
          port={9090}
          upstreamPort={7070}
          upstreamPath="/api/ai/buyer-demands"
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
          data={demands}
          title="Active Buyer Demands"
          subtitle={`Total: ${demands.length} procurement orders`}
          searchPlaceholder="Search by buyer, commodity, location, or status..."
          emptyMessage="No buyer demands found matching criteria."
        />
      )}
    </div>
  );
}
